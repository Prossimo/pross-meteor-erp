import _ from 'underscore';
import {Meteor} from 'meteor/meteor';
import  {HTTP} from 'meteor/http';
import {check, Match} from 'meteor/check';
import {
    Messages,
    Files,
    CreatedUsers,
    Projects,
    SlackUsers,
    Quotes
} from '../lib/collections';
import {EMPLOYEE_ROLE, ADMIN_ROLE_LIST, ADMIN_ROLE, SUPER_ADMIN_ROLE} from '../constants/roles';

import NylasAPI from '../nylas/nylas-api';
import config from '../config/config.json';

const SLACK_API_KEY = "xoxp-136423598965-136423599189-142146118262-9e22fb56f47ce5af80c9f3d5ae363666";

Meteor.methods({
    userRegistration(userData){
        check(userData, {
            username: String,
            email: String,
            emailProvider: String,
            password: String,
            firstName: String,
            lastName: String,
            googleRefreshToken: Match.Maybe(String)
        });

        const {username, email, emailProvider, password, firstName, lastName, googleRefreshToken} = userData;
        let validation = {};
        if (Accounts.findUserByUsername(username)) validation.username = `Username "${username}" is already exist`;
        if (Accounts.findUserByEmail(email)) validation.email = `Email "${email}" is already exist`;

        if(!_.isEmpty(validation)) {
            userData.validation = validation;
            return userData;
        }

        // Nylas Authentication
        const authenticationData = {
            "client_id": NylasAPI.AppID,
            "name": `${firstName} ${lastName}`,
            "email_address": email,
            "provider": emailProvider
        };

        if(emailProvider == 'gmail') {
            authenticationData.settings = {
                google_client_id: config.google.clientId,
                google_client_secret: config.google.clientSecret,
                google_refresh_token: googleRefreshToken
            }
        } else {
            authenticationData.settings = {
                username: email,
                password: password
            }
        }
        console.log("Nylas authentication data", authenticationData);

        return Promise.await(
            NylasAPI.makeRequest({
                path: '/connect/authorize',
                method: 'POST',
                body: authenticationData,
                returnsModel: false,
                timeout: 60000,
                auth: {
                    user: '',
                    pass: '',
                    sendImmediately: true
                }
            }).then((result) => {
                console.log("NylasAPI makeRequest('/connect/authorize') result", result)
                return Promise.await(

                    NylasAPI.makeRequest({
                        path: '/connect/token',
                        method: 'POST',
                        timeout: 60000,
                        body: {
                            client_id: NylasAPI.AppID,
                            client_secret: NylasAPI.AppSecret,
                            code: result.code
                        },
                        auth: {
                            user: '',
                            pass: '',
                            sendImmediately: true
                        },
                        error: (error) => {
                            console.error("NylasAPI makeRequest('/connect/token') error", error)
                        }
                    }).then((result) => {
                        console.log("NylasAPI makeRequest('/connect/token') result", result)
                        const userId = Accounts.createUser({
                            username,
                            email,
                            emailProvider,
                            password,
                            profile: {
                                firstName,
                                lastName,
                                role: [
                                    {role: EMPLOYEE_ROLE}
                                ]
                            }
                        });
                        Roles.addUsersToRoles(userId, [EMPLOYEE_ROLE]);
                        userData.validation = validation;

                        return userData;
                    })
                );
            }).catch((error) => {
                console.log("NylasAPI makeRequest('/connect/authorize') error", error);
            })
        );
    },

    sendEmail: function (mailData) {
        Match.test(mailData, {
            to: Match.OneOf(String, Array),
            from: String,
            replyTo: String,
            subject: String,
            html: String,
        });
        this.unblock();

        Email.send(mailData);
        return "Message is sending";
    },

    createMassage(msgData, files){
        //todo refactor add checking args
        const author = Meteor.users.findOne({_id: this.userId}, {fields: {services: 0}});
        msgData.author = author;
        Messages.insert(msgData, (err, messageId) => {
            if (err) throw new Meteor.Error(err);

            if (files && files.length) {
                files.forEach(item => {
                    item.messageId = messageId;
                    Files.insert(item);
                });
            }
        });
    },

    deleteMsg(msg){
        check(msg, {
            _id: String,
            author: {
                _id: String
            },
        });
        if (msg.author._id === this.userId) {
            Messages.remove({_id: msg._id}, (err) => {
                if (err) throw new Meteor.Error(err)
            })
        }
    },

    updateMsg(msg, text){
        check(msg, {
            _id: String,
            author: {
                _id: String
            },
        });
        check(text, String)
        if (msg.author._id === this.userId) {
            Messages.update(
                {_id: msg._id},
                {$set: {msg: text}}, (err) => {
                    if (err) throw new Meteor.Error(err)
                })
        }
    },

    getFileDataURL(_id){
        //todo delete and use mongo-grid
        return Files.findOne({_id});
    },

    adminCreateUser(data){
        if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error("Access denied");
        if (Accounts.findUserByEmail(data.email) || CreatedUsers.findOne({email: data.email}))
            throw new Meteor.Error('validEmail', `Email "${data.email}" is already exist`);
        if (Accounts.findUserByUsername(data.username) || CreatedUsers.findOne({username: data.username}))
            throw new Meteor.Error('validUsername', `"${data.username}" is already exist`);

        data.createBy = this.userId;
        data.createAt = new Date();
        data.isActive = false;
        CreatedUsers.insert(data);
    },

    checkCreatedAccount(email){
        return CreatedUsers.find({email}).count();
    },

    initCreatedUser(email, password){
        const createdUser = CreatedUsers.findOne({email, isActive: false});

        const userId = Accounts.createUser({
            username: createdUser.username,
            email,
            password,
            profile: {
                firstName: createdUser.firstName,
                lastName: createdUser.lastName,
                role: [
                    {role: 'user'}
                ]
            }
        });
        Roles.addUsersToRoles(userId, [createdUser.role]);
        CreatedUsers.update({_id: createdUser._id}, {$set: {isActive: true}});
        return userId;
    },

    assignUsersToProject(projectId, usersIds){
        if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error("Access denied");
        Projects.update({_id: projectId}, {
                $set: {
                    members: usersIds
                }
            }
        );
    },

    updateUserInfo(user){
        if (user.userId !== this.userId && !Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST))
            throw new Meteor.Error("Access denied");

        Meteor.users.update({_id: user.userId}, {
            $set: {
                username: user.username,
                "profile.firstName": user.firstName,
                "profile.lastName": user.lastName,
                "profile.twitter": user.twitter,
                "profile.facebook": user.facebook,
                "profile.linkedIn": user.linkedIn,
                "profile.companyName": user.companyName,
                "profile.companyPosition": user.companyPosition
            }
        })
    },

    addProject(data){
        if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST))
            throw new Meteor.Error("Access denied");
        check(data, {
            name: String,
            active: Boolean,
            members: [String]
        });

        //todo sync with try catch err
        const createRes = HTTP.post('https://slack.com/api/channels.create', {
            params: {
                token: SLACK_API_KEY,
                name: data.name
            }
        });
        //hardcode bot id
        const inviteBot = HTTP.post('https://slack.com/api/channels.invite', {
            params: {
                token: SLACK_API_KEY,
                channel: createRes.data.channel.id,
                user: 'U477F4M6Y'
            }
        });

        data.slackChanel = createRes.data.channel.id;

        if (inviteBot.data.ok) {
            Projects.insert(data);
        } else {
            throw new Meteor.Error("Problems with slack integration")
        }
    },

    postSlackMessage(channel, message){
        HTTP.post('https://slack.com/api/chat.postMessage', {
            params: {
                token: SLACK_API_KEY,
                channel: channel,
                text: message
            }
        })
    },

    getSlackUsers(){
        HTTP.get('https://slack.com/api/users.list', {
            params: {
                token: SLACK_API_KEY,
            }
        }, requestCb);

        function requestCb(err, res) {
            if (err || !res.data.ok) return;
            const {members} = res.data;
            members.length && members.forEach(item => {
                if (!SlackUsers.findOne({id: item.id})) {
                    SlackUsers.insert(item);
                }
            })
        }
    },

    updateUserProfileField(field, data){
        check(field, String);
        check(data, Match.OneOf(String, Number));

        if (!Roles.userIsInRole(this.userId, [ADMIN_ROLE, SUPER_ADMIN_ROLE, EMPLOYEE_ROLE])) {
            throw new Meteor.Error("Access denied");
        }
        Meteor.users.update({_id: this.userId}, {
            $set: {
                [`profile.${field}`]: data
            }
        })
    },

    addNewQuote(data){
        if (!Roles.userIsInRole(this.userId, [ADMIN_ROLE, SUPER_ADMIN_ROLE, EMPLOYEE_ROLE])) {
            throw new Meteor.Error("Access denied");
        }

        data.createBy = this.userId;

        Meteor.call("sendBotMessage", data.projectId, `Add new quote ${data.name}`);

        Quotes.insert(data);
    },

    addRevisionQuote(data){
        if (!Roles.userIsInRole(this.userId, [ADMIN_ROLE, SUPER_ADMIN_ROLE, EMPLOYEE_ROLE])) {
            throw new Meteor.Error("Access denied");
        }

        const _id = data.quoteId;
        delete data.quoteId;

        Quotes.update({_id}, {
            $push: {
                revisions: data
            }
        })
    },

    editQuoteName(quoteId, name){
        check(quoteId, String);
        check(name, String);
        if (!Roles.userIsInRole(this.userId, [ADMIN_ROLE, SUPER_ADMIN_ROLE, EMPLOYEE_ROLE])) {
            throw new Meteor.Error("Access denied");
        }

        Quotes.update({_id: quoteId}, {
            $set: {name}
        });
    },

    updateUserConversationGroups(group, membersId){
        check(group, String);
        check(membersId, [String]);

        const profile = Meteor.users.findOne({_id: this.userId}).profile;
        if (profile.conversationGroups && profile.conversationGroups.length) {
            const updateGroups = profile.conversationGroups.map(item => {
                if (item.name === group) {
                    return {
                        name: group,
                        members: membersId
                    }
                } else {
                    return item;
                }
            });
            Meteor.users.update({_id: this.userId}, {
                $set: {
                    'profile.conversationGroups': updateGroups
                }
            })
        } else {
            Meteor.users.update({_id: this.userId}, {
                $set: {
                    "profile.conversationGroups": [{
                        name: group,
                        members: membersId
                    }]
                }
            })
        }
    }
});















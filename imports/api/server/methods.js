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
import config from '../config/config';
import '../lib/extendMatch.js';

const SLACK_API_KEY = "xoxp-136423598965-136423599189-142146118262-9e22fb56f47ce5af80c9f3d5ae363666";
const SLACK_BOT_ID = "U477F4M6Y";

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
                            password,
                            profile: {
                                firstName,
                                lastName,
                                role: [
                                    {role: EMPLOYEE_ROLE}
                                ]
                            },
                            nylas: result
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

    sendEmail(mailData) {
        Match.test(mailData, {
            to: Match.OneOf(String, [String]),
            from: String,
            replyTo: String,
            subject: String,
            attachments: Match.Maybe([String]),
            html: String,
        });
        this.unblock();

        if(_.isArray(mailData.attachments) && mailData.attachments.length){
            mailData.attachments = Files.find({_id: {$in: mailData.attachments}}).fetch().map(item=>{
                return {
                    fileName: item.original.name,
                    filePath: `${Meteor.absoluteUrl(`cfs/files/files/${item._id}/${item.original.name}`)}`
                }
            });
        }

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

    addMemberToProject(projectId, member){
        check(projectId, String);
        check(member, {
            userId: String,
            isMainStakeholder: Boolean,
            destination: Match.OneOf(String, null),
            category: Match.OneOf([String], [])
        });

        if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error("Access denied");

        Projects.update(projectId, {$push: {members: member}});
    },

    addUserToSlackChannel(userId, channel){
        check(userId, String);
        check(channel, String);

        const user = Meteor.users.findOne({_id: userId, slack: {$exists: true}});

        if(!user) throw new Meteor.Error("User don`t integrate with slack");

        const res = HTTP.post('https://slack.com/api/channels.invite', {
            params: {
                token: SLACK_API_KEY,
                channel,
                user: user.slack.id
            }
        });
        if(!res.data.ok){
            if(res.data.error === "already_in_channel") throw new Meteor.Error("User already in channel");
        }
        return res;
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
        if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)){
            throw new Meteor.Error("Access denied");
        }
        check(data, {
            name: String,
            shippingMode: String,
            members: [{
                userId: String,
                isMainStakeholder: Boolean,
                destination: String,
                category: [String]
            }],
            actualDeliveryDate: Date,
            productionStartDate: Date,
            estDeliveryRange: [Date],

            shippingContactPhone: Match.Maybe(Match.phone),
            shippingContactName: Match.Maybe(String),
            shippingContactEmail: Match.Maybe(String),
            shippingAddress:  Match.Maybe(String),
            shippingNotes:  Match.Maybe(String),

            billingContactPhone:  Match.Maybe(Match.phone),
            billingContactName: Match.Maybe(String),
            billingContactEmail: Match.Maybe(String),
            billingAddress: Match.Maybe(String),
            billingNotes: Match.Maybe(String),

            estProductionTime: Match.Maybe(Number),
            actProductionTime: Match.Maybe(Number),
            supplier: Match.Maybe(String),
            shipper: Match.Maybe(String),
        });

        let responseCreateChannel = HTTP.post('https://slack.com/api/channels.create', {
            params: {
                token: SLACK_API_KEY,
                name: data.name
            }
        });

        if(!responseCreateChannel.data.ok) {
            if(responseCreateChannel.data.error = 'name_taken'){
                throw new Meteor.Error(`Cannot create slack channel with name ${data.name}`);
            }
            throw new Meteor.Error(`Some problems with created slack channel! Sorry try later`);
        }


        data.slackChanel = responseCreateChannel.data.channel.id;

        const responseInviteBot = HTTP.post('https://slack.com/api/channels.invite', {
            params: {
                token: SLACK_API_KEY,
                channel: responseCreateChannel.data.channel.id,
                user: SLACK_BOT_ID
            }
        });

        if(!responseInviteBot.data.ok) throw new Meteor.Error("Bot cannot add to channel");

        Meteor.users.find({_id: {$in: data.members.map(item=>item.userId)}, slack: {$exists: true}})
            .forEach(user=>{
                HTTP.post('https://slack.com/api/channels.invite', {
                    params: {
                        token: SLACK_API_KEY,
                        channel: responseCreateChannel.data.channel.id,
                        user: user.slack.id
                    }
                })
            });

        return Projects.insert(data);
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

        Quotes.insert(data);
    },

    addQuoteRevision(data){
        check(data, {
            revisionNumber: Number,
            quoteId: String,
            totalPrice: Number,
            createBy: String,
            createAt: Date,
            fileName: String,
            fileId: String
        });
        if (!Roles.userIsInRole(this.userId, [ADMIN_ROLE, SUPER_ADMIN_ROLE, EMPLOYEE_ROLE])) {
            throw new Meteor.Error("Access denied");
        }

        const quoteId = data.quoteId;
        delete data.quoteId;

        Quotes.update(quoteId, {
            $push: {
                revisions: data
            }
        })
    },

    updateQuoteRevision(data){
        check(data, {
            revisionNumber: Number,
            quoteId: String,
            totalPrice: Number,
            updateBy: String,
            updateAt: Date,
            fileName: String,
            fileId: String
        });
        if (!Roles.userIsInRole(this.userId, [ADMIN_ROLE, SUPER_ADMIN_ROLE, EMPLOYEE_ROLE])) {
            throw new Meteor.Error("Access denied");
        }
        let oldFileId;

        const quote = Quotes.findOne(data.quoteId);

        const revisions = quote.revisions.map(revision=>{
            if(revision.revisionNumber === data.revisionNumber){
                oldFileId = revision.fileId;

                revision.totalPrice = data.totalPrice;
                revision.updateBy = data.updateBy;
                revision.updateAt = data.updateAt;
                revision.fileName = data.fileName;
                revision.fileId = data.fileId;
            }
            return revision;
        });

        Quotes.update(quote._id, {$set: {revisions}});
        Files.remove(oldFileId);
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
    },

    getTwilioToken() {
        const twilio = require('twilio')
        const config = require('../config/config')

        let capability = new twilio.Capability(
            config.twilio.accountSid,
            config.twilio.authToken
        );
        capability.allowClientOutgoing(config.twilio.appSid);
        let token = capability.generate();

        return token;
    }
});















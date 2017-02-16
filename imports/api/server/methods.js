import { Meteor } from 'meteor/meteor';
import  { HTTP } from 'meteor/http';
import { check, Match } from 'meteor/check';
import { Messages, Files, CreatedUsers, Projects, Quotes } from '../lib/collections';
import { EMPLOYEE_ROLE, DEFAULT_USER_GROUP, ADMIN_ROLE_LIST, ADMIN_ROLE, SUPER_ADMIN_ROLE } from '../constants/roles';

Meteor.methods({
    userRegistration(userData){
        check(userData, {
            username: String,
            email: String,
            password: String,
            firstName: String,
            lastName: String,
        });

        const { username, email, password, firstName, lastName } = userData;
        let validation = {};
        if(Accounts.findUserByUsername(username)) validation.username = `Username "${username}" is already exist`;
        if(Accounts.findUserByEmail(email)) validation.email = `Email "${email}" is already exist`;

        if(JSON.stringify(validation) === '{}'){
            const userId = Accounts.createUser({
                username,
                email,
                password,
                profile: {
                    firstName,
                    lastName,
                    role: [
                        {role: 'user'}
                    ]
                }
            });
            //todo change default role
            Roles.addUsersToRoles(userId, [EMPLOYEE_ROLE], DEFAULT_USER_GROUP );
        }else{
            userData.validation = validation;
        }

        return userData;
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
        Messages.insert(msgData, (err, messageId)=>{
            if(err) throw new Meteor.Error(err);

            if(files && files.length){
                files.forEach(item=>{
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
        if(msg.author._id === this.userId){
            Messages.remove({_id: msg._id}, (err)=>{
                if(err) throw new Meteor.Error(err)
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
        if(msg.author._id === this.userId){
            Messages.update(
                {_id: msg._id},
                {$set: {msg: text}}, (err)=>{
                if(err) throw new Meteor.Error(err)
            })
        }
    },

    getFileDataURL(_id){
        //todo delete and use mongo-grid
        return Files.findOne({_id});
    },

    adminCreateUser(data){
        if(!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error("Access denied");
        if(Accounts.findUserByEmail(data.email) || CreatedUsers.findOne({email: data.email}))
            throw new Meteor.Error('validEmail',`Email "${data.email}" is already exist`);
        if(Accounts.findUserByUsername(data.username) || CreatedUsers.findOne({username: data.username}))
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
        if(!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error("Access denied");
        Projects.update({_id: projectId},{
                $set: {
                    members: usersIds
                }
            }
        );
    },

    updateUserInfo(user){
        if(user.userId !== this.userId && !Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST))
            throw new Meteor.Error("Access denied");

        Meteor.users.update({_id: user.userId},{
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
        if(!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST))
            throw new Meteor.Error("Access denied");
        check(data, {
            name: String,
            active: Boolean,
            members: [String]
        });

        //todo sync with try catch err
        const createRes = HTTP.post('https://slack.com/api/channels.create', {
            params: {
                token: Meteor.settings.private.slack.apiToken,
                name: data.name
            }
        });
        //hardcode bot id
        const inviteBot = HTTP.post('https://slack.com/api/channels.invite', {
            params: {
                token: Meteor.settings.private.slack.apiToken,
                channel: createRes.data.channel.id,
                user: 'U4596V0KS'
            }
        });

        data.slackChanel = createRes.data.channel.id;

        if(inviteBot.data.ok) Projects.insert(data);
    },

    updateUserProfileField(field, data){
        check(field, String);
        check(data, Match.OneOf(String, Number));

        if(!Roles.userIsInRole(this.userId, [ADMIN_ROLE,SUPER_ADMIN_ROLE,EMPLOYEE_ROLE])){
            throw new Meteor.Error("Access denied");
        }
        Meteor.users.update({_id: this.userId}, {
            $set: {
                [`profile.${field}`]: data
            }
        })
    },

    addNewQuote(data){
        if(!Roles.userIsInRole(this.userId, [ADMIN_ROLE,SUPER_ADMIN_ROLE,EMPLOYEE_ROLE])){
            throw new Meteor.Error("Access denied");
        }

        data.createBy = this.userId;

        Quotes.insert(data);
    },

    addRevisionQuote(data){
        //todo add check arrgs security
        if(!Roles.userIsInRole(this.userId, [ADMIN_ROLE,SUPER_ADMIN_ROLE,EMPLOYEE_ROLE])){
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
        if(!Roles.userIsInRole(this.userId, [ADMIN_ROLE,SUPER_ADMIN_ROLE,EMPLOYEE_ROLE])){
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
        if(profile.conversationGroups && profile.conversationGroups.length){
            const updateGroups = profile.conversationGroups.map(item=>{
                if(item.name === group){
                    return {
                        name: group,
                        members: membersId
                    }
                }else{
                    return item;
                }
            });
            Meteor.users.update({_id: this.userId},{
                $set: {
                    'profile.conversationGroups': updateGroups
                }
            })
        }else{
            console.log()
            Meteor.users.update({_id: this.userId},{
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















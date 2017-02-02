import { Meteor } from 'meteor/meteor';
import { Messages, Files } from '../lib/collections';
import { EMPLOYEE_ROLE, DEFAULT_USER_GROUP } from '../constatnts/roles';

Meteor.methods({
    userRegistration(userData){
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
            Roles.addUsersToRoles(userId, [EMPLOYEE_ROLE], DEFAULT_USER_GROUP );
        }else{
            userData.validation = validation;
        }

        return userData;
    },

    sendEmail: function (mailData) {
        check(mailData, {
            to: String,
            from: String,
            subject: String,
            html: String
        });
        this.unblock();

        Email.send(mailData);
        return "Message is sending";
    },

    createMassage(msgData, files){
        const author = Meteor.users.findOne({_id: this.userId}, {fields: {services: 0}});
        msgData.author = author;
        Messages.insert(msgData, (err, messageId)=>{
            if(err) throw new Meteor.Error(err);

            if(files.length){
                files.forEach(item=>{
                    item.messageId = messageId;
                    Files.insert(item);
                });
            }
        });
    },

    deleteMsg(msg){
        //todo more security, err cb
        if(msg.author._id === this.userId){
            Messages.remove({_id: msg._id}, (err)=>{
                if(err) throw new Meteor.Error(err)
            })
        }
    },

    updateMsg(msg, text){
        //todo more security, err cb
        if(msg.author._id === this.userId){
            Messages.update(
                {_id: msg._id},
                {$set: {msg: text}}, (err)=>{
                if(err) throw new Meteor.Error(err)
            })
        }
    },

    getFileDataURL(_id){
        //todo check
        return Files.findOne({_id});
    }
});















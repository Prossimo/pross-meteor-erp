import { Meteor } from 'meteor/meteor';
import { Messages } from '../lib/collections'

Meteor.methods({
    userRegistration(userData){
        const { username, email, password, firstName, lastName } = userData;
        let validation = {};
        if(Accounts.findUserByUsername(username)) validation.username = `Username "${username}" is already exist`;
        if(Accounts.findUserByEmail(email)) validation.email = `Email "${email}" is already exist`;

        if(JSON.stringify(validation) === '{}'){
            Accounts.createUser({
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

    createMassage(msgData){
        const author = Meteor.users.findOne({_id: this.userId}, {fields: {services: 0}});
        msgData.author = author;
        Messages.insert(msgData, (err, id)=>{
            if(!err){
                return id;
            }else{
                throw new Meteor.Error(err)
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
            Messages.update({_id: msg._id}, {$set: {msg: text}}, (err)=>{
                if(err) throw new Meteor.Error(err)
            })
        }
    }
});















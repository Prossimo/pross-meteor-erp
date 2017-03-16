import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { Messages, SalesRecords, CreatedUsers, Quotes, Files, Events, SlackMessages } from '../lib/collections';
import { NylasAccounts } from '../models/nylasaccounts/nylas-accounts'
import {
    GET_ACTIVITY,
    GET_PROJECTS,
    GET_USERS,
    GET_PROJECT,
    GET_SLACK_MSG,
    GET_PROJECT_EVENTS,
    GET_ADMIN_CREATE_USERS,
    GET_QUOTES,
    GET_PROJECT_FILES,
    GET_NYLAS_ACCOUNTS
} from '../constants/collections';
import { ADMIN_ROLE_LIST } from '../constants/roles';

Meteor.startup(()=>{
    Meteor.publish(GET_USERS, function(){
        return Meteor.users.find({}, {fields: {
            "services": 0
        }});
    });

    Meteor.publish(GET_ACTIVITY, function(projectId){
        Match.test(projectId, String);

        return Messages.find({projectId});
    });

    Meteor.publish(GET_PROJECTS, function(){
        if(Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) return SalesRecords.find();
        return SalesRecords.find({"members.userId": this.userId})
    });

    Meteor.publish(GET_QUOTES, function(projectId){
        Match.test(projectId, String);

        return Quotes.find({projectId})
    });

    Meteor.publish(GET_PROJECT, function(_id){
        Match.test(_id, String);

        if(Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) return SalesRecords.find({_id});
        return SalesRecords.find({_id, "members.userId": this.userId});
    });

    Meteor.publish(GET_ADMIN_CREATE_USERS, function(){
        if(Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST))
            return CreatedUsers.find({createBy: this.userId});
    });

    Meteor.publish(GET_PROJECT_FILES, function(projectId){
        Match.test(projectId, String);

        return Files.find({'metadata.projectId': projectId});
    });

    Meteor.publish(GET_PROJECT_EVENTS, function(projectId){
        Match.test(projectId, String);

        return Events.find({projectId});
    });

    Meteor.publish(GET_SLACK_MSG, function (salesRecordId) {
        Match.test(salesRecordId, String);

        const salesRecord = SalesRecords.findOne(salesRecordId);
        if(salesRecord.slackChanel){
            return SlackMessages.find({channel: salesRecord.slackChanel, subtype: {$ne: "bot_message"}})
        }else{
            return[];
        }
    })

    Meteor.publish(GET_NYLAS_ACCOUNTS, function () {
        return NylasAccounts.find({});
    });
});



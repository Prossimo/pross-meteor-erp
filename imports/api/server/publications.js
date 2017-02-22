import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { Messages, Projects, CreatedUsers, Quotes, Files, Events, SlackMessages } from '../lib/collections';
import { GET_ACTIVITY, GET_PROJECTS, GET_USERS, GET_PROJECT, GET_SLACK_MSG, GET_PROJECT_EVENTS, GET_ADMIN_CREATE_USERS, GET_QUOTES, GET_PROJECT_FILES } from '../constants/collections';
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
        if(Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) return Projects.find();
        return Projects.find({members: this.userId})
    });

    Meteor.publish(GET_QUOTES, function(projectId){
        Match.test(projectId, String);

        return Quotes.find({projectId})
    });

    Meteor.publish(GET_PROJECT, function(_id){
        Match.test(_id, String);

        if(Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) return Projects.find({_id});
        return Projects.find({_id, members: this.userId});
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

    Meteor.publish(GET_SLACK_MSG, function (projectId) {
        Match.test(projectId, String);

        const project = Projects.findOne(projectId);
        if(project.slackChanel){
            return SlackMessages.find({channel: project.slackChanel, subtype: {$ne: "bot_message"}})
        }else{
            return[];
        }
    })
});



import { Meteor } from 'meteor/meteor';
import { Messages, Projects, CreatedUsers } from '../lib/collections';
import { GET_ACTIVITY, GET_PROJECTS, GET_USERS, GET_PROJECT, GET_ADMIN_CREATE_USERS } from '../constatnts/collections'

Meteor.startup(()=>{
    Meteor.publish(GET_USERS, function(){
        return Meteor.users.find({}, {fields: {
            "services": 0
        }});
    });

    Meteor.publish(GET_ACTIVITY, function(projectId){
        return Messages.find({projectId});
    });

    Meteor.publish(GET_PROJECTS, function(){
        return Projects.find();
    });

    Meteor.publish(GET_PROJECT, function(_id){
        return Projects.find({_id});
    });

    Meteor.publish(GET_ADMIN_CREATE_USERS, function(){
        return CreatedUsers.find({createBy: this.userId});
    });
});



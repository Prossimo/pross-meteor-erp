import { Meteor } from 'meteor/meteor';
import { Match } from 'meteor/check';
import { Messages, Projects, CreatedUsers } from '../lib/collections';
import { GET_ACTIVITY, GET_PROJECTS, GET_USERS, GET_PROJECT, GET_ADMIN_CREATE_USERS } from '../constatnts/collections';
import { ADMIN_ROLE_LIST } from '../constatnts/roles';

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

    Meteor.publish(GET_PROJECT, function(_id){
        Match.test(_id, String);

        if(Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) return Projects.find({_id});
        return Projects.find({_id, members: this.userId});
    });

    Meteor.publish(GET_ADMIN_CREATE_USERS, function(){
        if(Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST))
            return CreatedUsers.find({createBy: this.userId});
    });
});



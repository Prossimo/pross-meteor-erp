import { Meteor } from 'meteor/meteor';
import { Messages, Projects } from '../lib/collections';
import { GET_ACTIVITY, GET_PROJECTS, GET_USERS, GET_PROJECT } from '../constatnts/collections'

Meteor.startup(()=>{
    Meteor.publish(GET_USERS, () => {
        return Meteor.users.find({}, {fields: {
            "services": 0
        }});
    });

    Meteor.publish(GET_ACTIVITY, (projectId) => {
        return Messages.find({projectId});
    });

    Meteor.publish(GET_PROJECTS, () => {
        return Projects.find();
    });

    Meteor.publish(GET_PROJECT, (_id) => {
        return Projects.find({_id});
    });
});



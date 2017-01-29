import { Meteor } from 'meteor/meteor';
import { Messages } from '../lib/collections';

Meteor.startup(()=>{
    Meteor.publish("users", () => {
        return Meteor.users.find({}, {fields: {
            "services": 0
        }});
    });

    Meteor.publish("messages", () => {
        return Messages.find();
    });
})



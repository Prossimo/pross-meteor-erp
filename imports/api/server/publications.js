import { Meteor } from 'meteor/meteor';


Meteor.startup(()=>{
    Meteor.publish("users", () => {
        return Meteor.users.find();
    });
})



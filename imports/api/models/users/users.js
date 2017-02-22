import { Factory } from 'meteor/dburles:factory';
import SimpleSchema from 'simpl-schema';
import faker from 'faker';
import { Accounts } from 'meteor/accounts-base';
Schema = {};

Schema.User = new SimpleSchema({
    username: {
        type: String,
        optional: true
    },
    emails: {
        type: Array,
        optional: true
    },
    "emails.$": {
        type: Object
    },
    "emails.$.address": {
        type: String,
        regEx: SimpleSchema.RegEx.Email
    },
    "emails.$.provider": {
        type: String,
        optional: true
    },
    "emails.$.verified": {
        type: Boolean
    },
    createdAt: {
        type: Date
    },
    // Make sure this services field is in your schema if you're using any of the accounts packages
    services: {
        type: Object,
        optional: true,
        blackbox: true
    },
    roles: {
        type: Array,
        optional: true
    },
    'roles.$': {
        type: String
    },
    profile: {
        type: Object,
        optional: true
    },
    'profile.firstName': {
        type: String
    },
    'profile.lastName': {
        type: String
    },
    slack: {
        type: Object,
        optional: true,
        blackbox: true
    }
});

export const UserSchema = Schema.User;

Meteor.users.attachSchema(UserSchema);
Meteor.users.publicFields = {
    username: 1,
    emails: 1,
    firstName: 1,
    lastName: 1,
    roles: 1,
    slack: 1,
    createdAt: 1
};

// Deny all client-side updates to user documents
Meteor.users.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; },
});

Factory.define('user', Meteor.users, {
    username: () => faker.lorem.word() + Random.id(10),
    firstName: () => faker.lorem.word(),
    lastName: () => faker.lorem.word()
});

Meteor.users.helpers({
    email() {
        if(this.emails.length > 0)
        {
            return this.emails[0].address;
        }
        return null;
    }
});

if(Meteor.isServer) {
    Accounts.onCreateUser(function(options, user) {
        console.log("Accounts.onCreateUser", options);
        user.profile = {};
        if(options.profile) {
            const profile = options.profile;

            if(profile.firstName)
            {
                user.profile.firstName = profile.firstName;
            }
            if(profile.firstName)
            {
                user.profile.lastName = profile.lastName;
            }
        }

        if(options.emailProvider) {
            user.emails[0].provider = options.emailProvider;
        }
        return user;
    });
}



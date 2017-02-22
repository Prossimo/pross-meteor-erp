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
    nylas: {
        type: Object,
        optional: true
    },
    'nylas.access_token': {
        type: String
    },
    'nylas.account_id': {
        type: String
    },
    'nylas.email_address': {
        type: String
    },
    'nylas.provider': {
        type: String
    },
    'nylas.organization_unit': {
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
            if(profile.lastName)
            {
                user.profile.lastName = profile.lastName;
            }
        }
        if(options.nylas) {
            user.nylas = {};
            const nylas = options.nylas;

            if(nylas.access_token)
            {
                user.nylas.access_token = nylas.access_token;
            }
            if(nylas.account_id)
            {
                user.nylas.account_id = nylas.account_id;
            }
            if(nylas.organization_unit)
            {
                user.nylas.organization_unit = nylas.organization_unit;
            }
            if(nylas.email_address)
            {
                user.nylas.email_address = nylas.email_address;
            }
            if(nylas.provider)
            {
                user.nylas.provider = nylas.provider;
            }
        }

        return user;
    });
}



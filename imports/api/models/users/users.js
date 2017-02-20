import { Factory } from 'meteor/dburles:factory';
import SimpleSchema from 'simpl-schema';
import faker from 'faker';
import { Accounts } from 'meteor/accounts-base';
Schema = {};

Schema.Address = new SimpleSchema({
    street: {
        type: String,
        optional: true
    },
    city: {
        type: String,
        optional: true
    },
    state: {
        type: String,
        optional: true
    },
    country: {
        type: String,
        optional: true
    }
});
Schema.UserProfile = new SimpleSchema({
    firstName: {
        type: String,
        optional: true
    },
    lastName: {
        type: String,
        optional: true
    },
    birthday: {
        type: Date,
        optional: true
    },
    gender: {
        type: String,
        allowedValues: ['Male', 'Female'],
        optional: true
    },
    organization : {
        type: String,
        optional: true
    },
    website: {
        type: String,
        regEx: SimpleSchema.RegEx.Url,
        optional: true
    },
    bio: {
        type: String,
        optional: true
    },
    address: {
        type: Schema.Address,
        optional: true
    }
});

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
        type: Schema.UserProfile,
        optional: true
    }
});

Meteor.users.attachSchema(Schema.User);
Meteor.users.publicFields = {
    username: 1,
    emails: 1,
    firstName: 1,
    lastName: 1,
    roles: 1,
    createdAt: 1
};
export const UserSchema = Schema.User;

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
        /*if(options.firstName)
        {
            user.firstName = options.firstName;
        }
        if(options.firstName)
        {
            user.lastName = options.lastName;
        }*/

        if(options.emailProvider) {
            user.emails[0].provider = options.emailProvider;
        }
        return user;
    });
}



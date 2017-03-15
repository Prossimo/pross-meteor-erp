import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

class NylasAccountsCollection extends Mongo.Collection {
    insert(doc, callback) {
        const ourDoc = doc;
        ourDoc.createdAt = ourDoc.createdAt || new Date();
        const result = super.insert(ourDoc, callback);
        return result
    }

    remove(selector) {
        const result = super.remove(selector);
        return result;
    }
}

export const NylasAccounts = new NylasAccountsCollection("NylasAccounts");

// Deny all client-side updates since we will be using methods to manage this collection
NylasAccounts.deny({
    insert() {
        return false;
    },
    update() {
        return false;
    },
    remove() {
        return false;
    }
});

NylasAccounts.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    createdAt: {type: Date, denyUpdate: true, optional: true},
    modifiedAt: {type: Date, denyInsert: true, optional: true},

    accessToken: {type: String},
    accountId: {type: String},
    organizationUnit: {type: String},
    emailAddress: {type: String},
    provider: {type: String},

    isTeamAccount: {type: Boolean, optional: true},
    userId: {type: String, optional: true}  // if isTeamAccount=true then null
});

NylasAccounts.attachSchema(NylasAccounts.schema);

NylasAccounts.publicFields = {
    accessToken: 1,
    accountId: 1,
    organizationUnit: 1,
    emailAddress: 1,
    provider: 1,
    isTeamAccount: 1,
    userId: 1,
    createdAt: 1,
    modifiedAt: 1
};
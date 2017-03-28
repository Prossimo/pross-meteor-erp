import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

class ContactsCollection extends Mongo.Collection {
    insert(doc, callback) {
        const ourDoc = doc;
        ourDoc.created_at = ourDoc.created_at || new Date();
        const result = super.insert(ourDoc, callback);
        return result
    }

    remove(selector) {
        const result = super.remove(selector);
        return result;
    }
}

export const Contacts = new ContactsCollection("Contacts");

// Deny all client-side updates since we will be using methods to manage this collection
Contacts.deny({
    insert() {
        return true;
    },
    update() {
        return true;
    },
    remove() {
        return true;
    }
});

Contacts.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    id: {type: String},
    account_id: {type: String},
    email: {type: String},
    name: {type: String, optional: true},
    phone_numbers: {type: Array, optional: true},
    "phone_numbers.$": {
        type: Object
    },
    description: {type: String, optional: true},
    removed: {type: Boolean, optional: true},
    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
});

Contacts.attachSchema(Contacts.schema);

Contacts.publicFields = {
    id: 1,
    account_id: 1,
    email: 1,
    name: 1,
    phone_numbers: 1,
    description: 1,
    removed: 1,
    created_at: 1,
    modified_at: 1
};

Contacts.helpers({
    account() {
        const {NylasAccounts} = require('../nylasaccounts/nylas-accounts')

        return NylasAccounts.findOne({accountId: this.account_id})
    }
});
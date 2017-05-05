import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

class CompaniesCollection extends Mongo.Collection {
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

const Companies = new CompaniesCollection("Companies");

Companies.TYPES = ['Architect', 'Engineer', 'Developer', 'Freight Forwarder', 'Energy Consultant', 'Shipping Line', 'Trucker', 'Procurement Consultat', 'Facade Consultant', 'Testing Lab', 'General Contractor', 'Installer', 'Fabricator', 'Glass Processor', 'Aluminum Extruder']
// Deny all client-side updates since we will be using methods to manage this collection
Companies.deny({
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


Companies.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    name: {type: String},
    website: {type: String, optional: true},
    type: {type: String, optional: true},
    phone_numbers: {type: Array, optional: true},
    "phone_numbers.$": {type: Object},
    "phone_numbers.$.number": {type: String},
    "phone_numbers.$.is_default": {type: Boolean},
    "phone_numbers.$.type": {type: String},
    addresses: {type: Array, optional: true},
    "addresses.$": {type: Object},
    "addresses.$.address": {type: String},
    "addresses.$.type": {type: String},
    "addresses.$.is_default": {type: Boolean},
    "addresses.$.is_billing": {type: Boolean},
    "addresses.$.is_mail": {type: Boolean},
    user_id: {type: String, optional: true},
    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
});

Companies.attachSchema(Companies.schema);

Companies.publicFields = {
    id: 1,
    name: 1,
    website: 1,
    type: 1,
    phone_numbers: 1,
    addresses: 1,
    user_id: 1,
    created_at: 1,
    modified_at: 1
};

Companies.helpers({

});

export default Companies;

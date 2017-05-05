import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import {Factory} from 'meteor/dburles:factory';
import {_} from 'meteor/underscore';
import faker from 'faker';

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
Companies.PHONE_TYPES = ['Work', 'Home', 'Mobile', 'Other']
Companies.ADDRESS_TYPES = ['Billing', 'Mail', 'Home', 'Other']
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

Companies.Address = new SimpleSchema({
    address: {type: String},
    type: {type: String},
    is_default: {type: Boolean},
    //is_billing: {type: Boolean},
    //is_mail: {type: Boolean}
})

Companies.PhoneNumber = new SimpleSchema({
    number: {type: String},
    type: {type: String},
    is_default: {type: Boolean}
})

Companies.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    name: {type: String},
    website: {type: String, optional: true},
    type: {type: String, optional: true},
    phone_numbers: {type: Array, optional: true},
    'phone_numbers.$': {type: Companies.PhoneNumber},
    addresses: {type: Array, optional: true},
    'addresses.$': {type: Companies.Address},
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

Factory.define('company', Companies, {
    name: faker.company.companyName(),
    website: faker.internet.url(),
    type: _.sample(Companies.TYPES),
    phone_numbers: [{
        number: faker.phone.phoneNumber(),
        type: _.sample(Companies.PHONE_TYPES),
        is_default: true
    }],
    addresses: [{
        address: faker.address.streetAddress(),
        type: _.sample(Companies.ADDRESS_TYPES),
        is_default: true
    }]
})

Companies.helpers({

});

export default Companies;

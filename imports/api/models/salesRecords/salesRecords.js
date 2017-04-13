import _ from 'underscore'
import {Mongo} from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';
import { Factory } from 'meteor/dburles:factory';
import faker from 'faker';
import { STAGES } from '../../constants/project';
import Threads from '../threads/threads'
import Messages from '../messages/messages'
import Contacts from '../contacts/contacts'

class SalesRecordsCollection extends Mongo.Collection {
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

export default SalesRecords = new SalesRecordsCollection("SalesRecords");
// Deny all client-side updates since we will be using methods to manage this collection
/*salesRecords.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
});*/

SalesRecords.schema = new SimpleSchema({
    _id: { type: String, regEx: SimpleSchema.RegEx.Id },
    createdAt: { type: Date, denyUpdate: true, optional: true },
    modifiedAt: { type: Date, denyInsert: true, optional: true },
    slackChanel: { type: String, optional: true },

    name: { type: String },
    members: { type: Array },
    "members.$": { type: Object },
    "members.$.userId": { type: String },
    "members.$.destination": { type: String, optional: true },
    "members.$.category": { type: Array, optional: true },
    "members.$.category.$": { type: String, optional: true },

    stakeholders: { type: Array },
    'stakeholders.$': { type: Object },
    'stakeholders.$.contactId': { type: String },
    'stakeholders.$.isMainStakeholder': { type: Boolean },
    'stakeholders.$.notify': { type: Boolean },
    'stakeholders.$.destination': { type: String, optional: true },
    'stakeholders.$.category': { type: Array, optional: true },
    'stakeholders.$.category.$': { type: String, optional: true },

    actualDeliveryDate: { type: Date },
    productionStartDate: { type: Date },
    estDeliveryRange: { type: Array },
    "estDeliveryRange.$": { type: Date },

    shippingMode: { type: String, optional: true },
    shippingContactPhone: { type: String, optional: true },
    shippingContactName: { type: String, optional: true },
    shippingContactEmail: { type: String, optional: true },
    shippingAddress: { type: String, optional: true },
    shippingNotes: { type: String, optional: true },

    billingContactPhone: { type: String, optional: true },
    billingContactName: { type: String, optional: true },
    billingContactEmail: { type: String, optional: true },
    billingAddress: { type: String, optional: true },
    billingNotes: { type: String, optional: true },

    supplier: { type: String, optional: true },
    shipper: { type: String, optional: true },
    estProductionTime: { type: Number, optional: true },
    actProductionTime: { type: Number, optional: true },
    stage: { type: String, allowedValues: STAGES },
    folderId: { type: String, optional: true }
});

SalesRecords.attachSchema(SalesRecords.schema);

SalesRecords.publicFields = {
    name: 1,
    members: 1,
    slackChanel: 1,
    createdAt: 1,
    modifiedAt: 1,
    actualDeliveryDate: 1,
    productionStartDate: 1,
    estDeliveryRange: 1,
    shippingMode: 1,
    shippingContactPhone: 1,
    shippingContactName: 1,
    shippingContactEmail: 1,
    shippingAddress: 1,
    shippingNotes: 1,
    billingContactPhone: 1,
    billingContactName: 1,
    billingContactEmail: 1,
    billingAddress: 1,
    billingNotes: 1,
    supplier: 1,
    shipper: 1,
    estProductionTime: 1,
    actProductionTime: 1,
    stage: 1
};

Factory.define('salesRecord', SalesRecords, {
    name: () => faker.name.jobTitle()
});


SalesRecords.before.insert(function (userId, doc) {
    doc.createdAt = new Date()
});

SalesRecords.before.update(function (userId, doc, fieldNames, modifier, options) {
    // modifier.$set = modifier.$set || {};
    doc.modifiedAt = Date.now();
});

SalesRecords.helpers({
    threads() {
        return Threads.find({salesRecordId: this._id}).fetch()
    },
    messages() {
        const threads = this.threads()

        return Messages.find({thread_id:{$in:_.pluck(threads, 'id')}}).fetch()
    },
    contactsForStakeholders() {
        const contactIds = _.pluck(this.stakeholders, 'contactId')
        return Contacts.find({_id:{$in:contactIds}}).fetch()
    }
})
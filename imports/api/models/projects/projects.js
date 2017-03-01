import SimpleSchema from 'simpl-schema';
import { Factory } from 'meteor/dburles:factory';
import faker from 'faker';
import _ from 'underscore';
import {Projects} from '../../lib/collections';
export const STATUSES = ['active', 'delivered'];

// Deny all client-side updates since we will be using methods to manage this collection
/*Projects.deny({
    insert() { return true; },
    update() { return true; },
    remove() { return true; }
});*/

Projects.schema = new SimpleSchema({
    _id: { type: String, regEx: SimpleSchema.RegEx.Id },
    name: { type: String },
    sec_stakeholder_designation: { type: String },
    stakeholder_category: { type: Array },
    status: { type: String },
    active: { type: Boolean },
    slackChanel: { type: String, optional: true },
    members: { type: Array },
    "members.$": { type: String },
    createdAt: { type: Date, denyUpdate: true, optional: true },
    modifiedAt: { type: Date, denyInsert: true, optional: true },
    is_main_stakeholder: { type: Boolean },
    actualDeliveryDate: { type: Date},
    productionStartDate: { type: Date},
    estDeliveryRange: { type: Array },
    shippingContactPhone: { type: String },
    billingContactPhone: { type: String },
    shippingNotes: { type: String },
    billingNotes: { type: String },
    estProductionTime: { type: Number },
    actProductionTime: { type: Number },
});

Projects.attachSchema(Projects.schema);

Projects.publicFields = {
    name: 1,
    sec_stakeholder_designation: 1,
    stakeholder_category: 1,
    status: 1,
    active: 1,
    members: 1,
    slackChanel: 1,
    createdAt: 1,
    modifiedAt: 1,
    is_main_stakeholder: 1,
    actualDeliveryDate: 1,
    productionStartDate: 1,
    estDeliveryRange: 1,
    billingContactPhone: 1,
    shippingContactPhone: 1,
    shippingNotes: 1,
    billingNotes: 1,
    estProductionTime: 1,
    actProductionTime: 1,
};

Factory.define('project', Projects, {
    name: () => faker.name.jobTitle(),
    status: () => _.sample(STATUSES),
    active: () => _.sample([true, false])
});


Projects.before.insert(function (userId, doc) {
    doc.createdAt = new Date()
});

Projects.before.update(function (userId, doc, fieldNames, modifier, options) {
    // modifier.$set = modifier.$set || {};
    modifier.$set.modifiedAt = Date.now();
});
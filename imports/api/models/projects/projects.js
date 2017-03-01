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
//todo alex change format member property -> it must contain {is_main_stakeholder, stakeholder_category, memberName}
Projects.schema = new SimpleSchema({
    _id: { type: String, regEx: SimpleSchema.RegEx.Id },
    name: { type: String },
    sec_stakeholder_designation: { type: String },
    stakeholder_category: { type: Array },
    slackChanel: { type: String, optional: true },
    members: { type: Array },
    "members.$": { type: String },
    createdAt: { type: Date, denyUpdate: true, optional: true },
    modifiedAt: { type: Date, denyInsert: true, optional: true },
    is_main_stakeholder: { type: Boolean },
    actualDeliveryDate: { type: Date},
    productionStartDate: { type: Date},
    estDeliveryRange: { type: Array },
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
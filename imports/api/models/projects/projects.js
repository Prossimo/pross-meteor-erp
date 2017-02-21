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
    status: { type: String },
    active: { type: Boolean },
    slackChanel: { type: String, optional: true },
    members: { type: Array },
    "members.$": { type: String },
    createdAt: { type: Date, denyUpdate: true, optional: true },
    modifiedAt: { type: Date, denyInsert: true, optional: true }
});

Projects.attachSchema(Projects.schema);

Projects.publicFields = {
    name: 1,
    status: 1,
    active: 1,
    members: 1,
    slackChanel: 1,
    createdAt: 1,
    modifiedAt: 1
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
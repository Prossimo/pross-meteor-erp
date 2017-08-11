import _ from 'underscore'
import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import { Factory } from 'meteor/dburles:factory'
import faker from 'faker'
import { STAGES, SUB_STAGES } from '../../constants/project'
import Threads from '../threads/threads'
import Messages from '../messages/messages'
import People from '../people/people'
import Users from '../users/users'

class SalesRecordsCollection extends Mongo.Collection {
    insert(doc, callback) {
        const ourDoc = doc
        ourDoc.createdAt = ourDoc.createdAt || new Date()
        const result = super.insert(ourDoc, callback)
        return result
    }

    remove(selector) {
        const result = super.remove(selector)
        return result
    }
}

const SalesRecords = new SalesRecordsCollection('SalesRecords')
// Deny all client-side updates since we will be using methods to manage this collection
/*salesRecords.deny({
    insert() { return true },
    update() { return true },
    remove() { return true }
})*/

export const DEAL_PRIORITY = {
    Low: 'Low',
    High: 'High',
    Medium: 'Medium',
    Urgent: 'Urgent'
}
export const DEAL_PROBABILITY = {
    Low: 'Low',
    High: 'High',
    Medium: 'Medium'
}

SalesRecords.schema = new SimpleSchema({
    _id: { type: String, regEx: SimpleSchema.RegEx.Id },
    createdAt: { type: Date, denyUpdate: true, optional: true },
    modifiedAt: { type: Date, denyInsert: true, optional: true },
    slackChanel: { type: String, optional: true },
    slackChannelName: { type: String, optional: true },

    name: { type: String },
    members: { type: Array },
    'members.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    teamLead: {type: String, regEx: SimpleSchema.RegEx.Id, optional:true},

    stakeholders: { type: Array },
    'stakeholders.$': { type: Object },
    'stakeholders.$.peopleId': { type: String },
    'stakeholders.$.isMainStakeholder': { type: Boolean },
    'stakeholders.$.notify': { type: Boolean },

    participants: {type: Array, optional:true},    // participants for main conversation
    'participants.$': { type: Object },
    'participants.$.peopleId': { type: String },
    'participants.$.isMain': { type: Boolean, optional: true },

    actualDeliveryDate: { type: Date },
    productionStartDate: { type: Date },
    estDeliveryRange: { type: Array },
    'estDeliveryRange.$': { type: Date },

    bidDuDate: { type: Date, optional:true },
    priority: {type: String, allowedValues: Object.values(DEAL_PRIORITY), defaultValue: DEAL_PRIORITY.Low},
    expectedRevenue: {type: Number, optional:true},
    totalSquareFootage: {type: Number, optional:true},
    probability: {type: String, allowedValues: Object.values(DEAL_PROBABILITY), defaultValue: DEAL_PROBABILITY.Low},
    clientStatus: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
    supplierStatus: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},

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
    subStage: {type: String, allowedValues: SUB_STAGES},
    folderId: { type: String, optional: true },
    taskFolderId: { type: String, optional: true },
})

SalesRecords.attachSchema(SalesRecords.schema)

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
}

Factory.define('salesRecord', SalesRecords, {
    name: () => faker.name.jobTitle()
})


SalesRecords.before.insert((userId, doc) => {
    doc.createdAt = new Date()
})

SalesRecords.before.update((userId, doc, fieldNames, modifier, options) => {
    // modifier.$set = modifier.$set || {}
    doc.modifiedAt = Date.now()
})

SalesRecords.helpers({
    threads() {
        return Threads.find({salesRecordId: this._id}).fetch()
    },
    messages() {
        const threads = this.threads()

        return Messages.find({thread_id:{$in:_.pluck(threads, 'id')}}).fetch()
    },
    contactsForMainParticipants() {
        if(!this.participants || this.participants.length==0) return []

        const peopleIds = _.pluck(this.participants, 'peopleId')
        const people = People.find({_id:{$in:peopleIds}}).fetch()

        return people.map(p => ({name:p.name, email:p.defaultEmail()}))
    },
    noticeableContactsForStakeholders() {
        const peopleIds = _.pluck(this.stakeholders.filter(st => st.notify), 'peopleId')
        const people = People.find({_id:{$in:peopleIds}}).fetch()

        return people.map(p => ({name:p.name, email:p.defaultEmail()}))

    },
    people() {
        const peopleIds = _.pluck(this.stakeholders.filter(st => st.notify), 'peopleId')
        return People.find({_id:{$in:peopleIds}}).fetch()
    },
    getParticipants() {
        if(!this.participants) return []

        const peopleIds = _.pluck(this.participants, 'peopleId')
        return People.find({_id:{$in:peopleIds}}).map(p => {
            p.isMain = _.findWhere(this.participants, {peopleId:p._id}).isMain
            return p
        })
    },
    getMembers() {
        if (!this.members || this.members.length == 0) return []
        return Users.find({_id:{$in:this.members}}).fetch()
    }
})

export default SalesRecords

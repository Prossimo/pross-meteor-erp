import _ from 'underscore'
import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import { Factory } from 'meteor/dburles:factory'
import faker from 'faker'
import { STAGES, SUB_STAGES } from '../../constants/project'
import Threads from '../threads/threads'
import Messages from '../messages/messages'
import Tasks from '../tasks/tasks'
import People from '../people/people'
import Users from '../users/users'
import Conversations from '../conversations/conversations'
import SlackMessages from '../slackMessages/slackMessages'
import Events from '../events/events'
import Quotes from '../quotes/quotes'
import ClientStatus from './clientstatus'
import SupplierStatus from './supplierstatus'

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

export const DEAL_STATE = {
    us: 'US',
    canada: 'Canada States'
}

SalesRecords.schema = new SimpleSchema({
    _id: { type: String, regEx: SimpleSchema.RegEx.Id },
    createdAt: { type: Date, denyUpdate: true, optional: true },
    modifiedAt: { type: Date, denyInsert: true, optional: true },

    name: { type: String },
    members: { type: Array },
    'members.$': { type: String, regEx: SimpleSchema.RegEx.Id },
    teamLead: {type: String, regEx: SimpleSchema.RegEx.Id, optional:true},
    dealer: {type: String, regEx: SimpleSchema.RegEx.Id, optional:true},    // person with dealer designation

    stakeholders: { type: Array },
    'stakeholders.$': { type: Object },
    'stakeholders.$.peopleId': { type: String },
    'stakeholders.$.isMainStakeholder': { type: Boolean },

    actualDeliveryDate: { type: Date },
    productionStartDate: { type: Date },
    estDeliveryRange: { type: Array },
    'estDeliveryRange.$': { type: Date },

    bidDueDate: { type: Date, optional:true },
    priority: {type: String, allowedValues: Object.values(DEAL_PRIORITY), defaultValue: DEAL_PRIORITY.Low},
    expectedRevenue: {type: Number, optional:true},
    totalSquareFootage: {type: Number, optional:true},
    probability: {type: String, allowedValues: Object.values(DEAL_PROBABILITY), defaultValue: DEAL_PROBABILITY.Low},
    clientStatus: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true}, // client status id
    supplierStatus: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},   // supplier status id

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

    slackChannel: { type: Object, defaultValue: {}},
    'slackChannel.id': { type: String, optional:true },
    'slackChannel.name': { type: String, optional:true },
    'slackChannel.isPrivate': { type: Boolean, optional:true },

    conversationIds: {type: Array, optional:true},
    'conversationIds.$': {type: String, regEx: SimpleSchema.RegEx.Id},

    archived: {type: Boolean, optional: true},
    dealState: {type: String, optional: true}
})

SalesRecords.attachSchema(SalesRecords.schema)

SalesRecords.publicFields = {
    name: 1,
    members: 1,
    slackChannel: 1,
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
    stage: 1,

    dealer: 1,

    teamLead: 1,
    bidDueDate: 1,
    expectedRevenue: 1,
    totalSquareFootage: 1,
    priority: 1,
    probability: 1,
    clientStatus: 1,
    supplierStatus: 1,

    createdAt: 1,
    modifiedAt: 1
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
        if(!this.conversationIds) return []
        return Threads.find({conversationId: {$in:this.conversationIds}}).fetch()
    },
    messages() {
        const threads = this.threads()

        return Messages.find({thread_id:{$in:_.pluck(threads, 'id')}}).fetch()
    },
    tasks() {
        return Tasks.find({parentId:this._id, parentType:'deal'}).fetch()
    },
    contactsForMainParticipants() {
        if(!this.conversationIds || this.conversationIds.length==0) return []

        const conversation = Conversations.findOne(this.conversationIds[0])
        if(!conversation) return []

        return conversation.contacts()
    },
    people() {
        const peopleIds = _.pluck(this.stakeholders, 'peopleId')
        return People.find({_id:{$in:peopleIds}}).fetch()
    },
    getMembers() {
        if (!this.members || this.members.length == 0) return []
        return Users.find({_id:{$in:this.members}}).fetch()
    },

    slackActivities() {
        if(!this.slackChannel) return []
        const msg = SlackMessages.find({channel: this.slackChannel.id}, {sort: {createAt: -1}}).map( item => {
            if(item.userId) item.author = Users.findOne(item.userId)
            return item
        })

        const events = Events.find({projectId:this._id}).map(item => {
            item.type = 'event'
            if(item.createBy) item.author = Users.findOne(item.createBy)
            return item
        })

        return msg.concat(events).sort((a,b) => a.createAt > b.createAt ? -1 : 1)

    },

    quotes() {
        return Quotes.find({projectId:this._id}, {sort: {createAt: -1}}).fetch()
    },

    getDealer() {
        if(!this.dealer) return null

        return People.findOne(this.dealer)
    },

    getClientStatus() {
        if(!this.clientStatus) return null
        return ClientStatus.findOne(this.clientStatus)
    },

    getSupplierStatus() {
        if(!this.supplierStatus) return null
        return SupplierStatus.findOne(this.supplierStatus)
    },

    getTeamLead() {
        if(!this.teamLead) return null
        return Meteor.users.findOne(this.teamLead)
    }
})

export default SalesRecords

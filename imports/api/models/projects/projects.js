import {Mongo} from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import find from 'lodash/find'
import Users from '../users/users'
import People from '../people/people'
import Tasks from '../tasks/tasks'
import Conversations from '../conversations/conversations'
import Threads from '../threads/threads'
import Messages from '../messages/messages'
import NylasAccounts from '../nylasaccounts/nylas-accounts'

class ProjectsCollection extends Mongo.Collection {
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

const Projects = new ProjectsCollection('Projects')

Projects.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    createdAt: {type: Date, denyUpdate: true, optional: true},
    modifiedAt: {type: Date, denyInsert: true, optional: true},
    name: {type: String},
    members: {type: Array, optional: true},
    'members.$': {type: Object},
    'members.$.userId': {type: String},
    'members.$.isAdmin': {type: Boolean},
    stakeholders: {type: Array, optional: true},
    'stakeholders.$': {type: Object},
    'stakeholders.$.peopleId': {type: String},
    'stakeholders.$.isMainStakeholder': {type: Boolean, optional: true},
    'stakeholders.$.addToMain': {type: Boolean, optional: true},    // to main conversation
    folderId: {type: String, optional: true},
    taskFolderId: {type: String, optional: true},

    slackChannel: { type: Object, defaultValue: {}, optional: true },
    'slackChannel.id': { type: String, optional:true },
    'slackChannel.name': { type: String, optional:true },
    'slackChannel.isPrivate': { type: Boolean, optional:true },

    conversationIds: {type: Array, optional: true},
    'conversationIds.$': {type: String, regEx: SimpleSchema.RegEx.Id},

    nylasAccountId: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},   // For inbox projects

    archived: {type:Boolean, optional:true}
})

Projects.attachSchema(Projects.schema)

Projects.helpers({
    threads() {
        if(!this.conversationIds) return []
        return Threads.find({conversationId: {$in:this.conversationIds}}).fetch()
    },
    messages() {
        const threads = this.threads()

        return Messages.find({thread_id:{$in:map(threads, 'id')}}).fetch()
    },
    tasks() {
        return Tasks.find({parentId:this._id, parentType:'project'}).fetch()
    },
    getMembers() {
        if (!this.members || this.members.length == 0) return []

        const memberIds = map(this.members, 'userId')
        return Users.find({_id: {$in: memberIds}}).fetch()
    },

    getStakeholders() {
        if (!this.stakeholders || this.stakeholders.length == 0) return []

        const peopleIds = map(this.stakeholders, 'peopleId')
        //console.log(JSON.stringify({_id: {$in:peopleIds}}))
        return People.find({_id: {$in: peopleIds}}).map(p => {
            const stakeholder = find(this.stakeholders, {peopleId: p._id})
            return {
                ...p,
                email: p.defaultEmail(),
                designation: p.designation() ? p.designation().name : null,
                isMainStakeholder: stakeholder.isMainStakeholder,
                addToMain: stakeholder.addToMain
            }
        })
    },
    people() {
        const peopleIds = map(this.stakeholders, 'peopleId')
        return People.find({_id: {$in: peopleIds}}).fetch()
    },
    nylasAccount() {
        if(!this.nylasAccountId) return null

        return NylasAccounts.findOne(this.nylasAccountId)
    }
})
export default Projects

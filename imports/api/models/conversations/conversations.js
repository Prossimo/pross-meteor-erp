import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import {Factory} from 'meteor/dburles:factory'
import {_} from 'meteor/underscore'
import faker from 'faker'
import Threads from '../threads/threads'
import Messages from '../messages/messages'
import SalesRecords from '../salesRecords/salesRecords'
import Projects from '../projects/projects'
import People from '../people/people'
import Users from '../users/users'

class ConversationsCollection extends Mongo.Collection {
    insert(doc, callback) {
        const ourDoc = doc
        ourDoc.created_at = ourDoc.created_at || new Date()
        const result = super.insert(ourDoc, callback)
        return result
    }

    remove(selector) {
        const result = super.remove(selector)
        return result
    }
}

const Conversations = new ConversationsCollection('Conversations')

// Deny all client-side updates since we will be using methods to manage this collection
Conversations.deny({
    insert() {
        return true
    },
    update() {
        return true
    },
    remove() {
        return true
    }
})

Conversations.schema = new SimpleSchema({
    _id: {type: String, regEx: SimpleSchema.RegEx.Id},
    name: {type: String},
    participants: {type: Array},
    'participants.$': { type: Object },
    'participants.$.peopleId': { type: String },
    'participants.$.isMain': { type: Boolean, optional: true },

    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
})

Conversations.attachSchema(Conversations.schema)

Conversations.publicFields = {
    name: 1,
    participants: 1,
    created_at: 1,
    modified_at: 1
}

Conversations.helpers({
    threads() {
        return Threads.find({conversationId: this._id}).fetch()
    },
    messages() {
        const threads = this.threads()

        return Messages.find({thread_id:{$in:_.pluck(threads, 'id')}}).fetch()
    },
    parent() {
        const sr = SalesRecords.findOne({conversationIds:this._id})
        if(sr) return _.extend(sr, {type:'deal'})

        const pr = Projects.findOne({conversationIds:this._id})
        if(pr) return _.extend(pr, {type:'project'})

        return null
    },
    getParticipants() {
        let participants = []
        const parent = this.parent()
        if(parent && parent.type === 'deal' && parent.dealer) participants.push(People.findOne(parent.dealer))

        const peopleIds = _.pluck(this.participants, 'peopleId')
        participants = participants.concat(People.find({_id:{$in:peopleIds}}).map(p => {
            p.isMain = _.findWhere(this.participants, {peopleId:p._id}).isMain
            return p
        }))

        return participants
    },
    contacts() {
        return this.getParticipants().map(p => ({
            name: p.name,
            email: p.defaultEmail(),
            isMain: p.isMain
        })).filter(({email}) => (email && email.length))

    },
    getAssignees() {
        const threads = Threads.find({conversationId:this._id}).fetch()

        if(!threads || threads.length==0) return []

        return threads.map(t => t.getAssignee()).filter(a => a!=null)
    },
    getFollowers() {
        const threads = Threads.find({conversationId:this._id}).fetch()

        if(!threads || threads.length==0) return []

        let followers = []

        threads.forEach(t => {
            followers = followers.concat(t.getFollowers())
        })
        return followers
    }
})

export default Conversations

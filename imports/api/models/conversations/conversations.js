import { Mongo } from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import {Factory} from 'meteor/dburles:factory'
import {_} from 'meteor/underscore'
import faker from 'faker'
import Threads from '../threads/threads'
import Messages from '../messages/messages'

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
    salesRecordId: {type: String, regEx: SimpleSchema.RegEx.Id},
    created_at: {type: Date, denyUpdate: true, optional: true},
    modified_at: {type: Date, denyInsert: true, optional: true}
})

Conversations.attachSchema(Conversations.schema)

Conversations.publicFields = {
    name: 1,
    salesRecordId: 1,
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
    }
})

export default Conversations

import {Mongo} from 'meteor/mongo'
import SimpleSchema from 'simpl-schema'
import NylasAccounts from '../nylasaccounts/nylas-accounts'
import Threads from '../threads/threads'
import Conversations from '../conversations/conversations'
import Projects from '../projects/projects'

class MessagesCollection extends Mongo.Collection {
   insert(doc, callback) {
      const ourDoc = doc
      ourDoc.created_at = new Date()
      const result = super.insert(ourDoc, callback)
      return result
   }

   remove(selector) {
      const result = super.remove(selector)
      return result
   }
}

const Messages = new MessagesCollection('Messages')

// Deny all client-side updates since we will be using methods to manage this collection
Messages.deny({
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

Messages.schema = new SimpleSchema({
   _id: {type: String, regEx: SimpleSchema.RegEx.Id},

   object: {type: String, optional: true},  // draft or message
   id: {type: String, optional: true},
   account_id: {type: String},
   thread_id: {type: String},
   subject: {type: String, optional: true},
   from: {type: Array, optional: true},
   'from.$': {
      type: Object
   },
   'from.$.name': {
      type: String,
      optional: true
   },
   'from.$.email': {
      type: String,
      //regEx: SimpleSchema.RegEx.Email
   },
   to: {type: Array, optional: true},
   'to.$': {
      type: Object
   },
   'to.$.name': {
      type: String,
      optional: true
   },
   'to.$.email': {
      type: String,
      //regEx: SimpleSchema.RegEx.Email
   },
   cc: {type: Array, optional: true},
   'cc.$': {
      type: Object
   },
   'cc.$.name': {
      type: String,
      optional: true
   },
   'cc.$.email': {
      type: String,
      //regEx: SimpleSchema.RegEx.Email
   },
   bcc: {type: Array, optional: true},
   'bcc.$': {
      type: Object
   },
   'bcc.$.name': {
      type: String,
      optional: true
   },
   'bcc.$.email': {
      type: String,
      //regEx: SimpleSchema.RegEx.Email
   },
   reply_to: {type: Array, optional: true},
   'reply_to.$': {
      type: Object
   },
   'reply_to.$.name': {
      type: String,
      optional: true
   },
   'reply_to.$.email': {
      type: String,
      //regEx: SimpleSchema.RegEx.Email
   },
   date: {type: Number},
   unread: {type: Boolean, optional: true},
   starred: {type: Boolean, optional: true},
   snippet: {type: String, optional: true},
   body: {type: String, optional: true},
   files: {type: Array, optional: true},
   'files.$': {
      type: Object
   },
   'files.$.id': {
      type: String,
      optional: true
   },
   'files.$.content_id': {
      type: String,
      optional: true
   },
   'files.$.content_type': {
      type: String,
      optional: true
   },
   'files.$.filename': {
      type: String,
      optional: true
   },
   'files.$.size': {
      type: Number,
      optional: true
   },
   'files.$.isBackedUp': {
      type: Boolean,
      optional: true,
   },
   events: {type: Array, optional: true},
   'events.$': {
      type: Object
   },
   folder: {type: Object, optional: true},
   labels: {type: Array, optional: true},
   'labels.$': {
      type: Object
   },

    version: {type: Number, optional:true},
   created_at: {type: Date, denyUpdate: true, optional: true},
   modified_at: {type: Date, denyInsert: true, optional: true},
   isAttachmentBackup: {type: Boolean, optional: true},
})

Messages.attachSchema(Messages.schema)

Messages.publicFields = {
   id: 1,
   account_id: 1,
   thread_id: 1,
   subject: 1,
   from: 1,
   to: 1,
   cc: 1,
   bcc: 1,
   reply_to: 1,
   date: 1,
   unread: 1,
   starred: 1,
   snippet: 1,
   body: 1,
   files: 1,
   events: 1,
   folder: 1,
   labels: 1,
    version: 1,

   created_at: 1,
   modified_at: 1
}

Messages.helpers({
   account() {
      return NylasAccounts.findOne({accountId: this.account_id})
   },
   conversationId() {
      const thread = Threads.findOne({id: this.thread_id})
      if (!thread) return null
      return thread.conversationId
   },
   conversation() {
      const thread = Threads.findOne({id: this.thread_id})
      if (!thread) return null
      if (!thread.conversationId) return null

      return Conversations.findOne(thread.conversationId)
   },
   thread() {
      if (!this.thread_id) return null

      return Threads.findOne({id: this.thread_id})
   },
   project() {
      const nylasAccount = this.account()
      return Projects.findOne({nylasAccountId: nylasAccount._id})
   }
})

export default Messages

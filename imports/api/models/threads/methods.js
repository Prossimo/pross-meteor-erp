import _ from 'underscore'
import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import {ValidatedMethod} from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import Threads from './threads'
import Messages from '../messages/messages'
import NylasAccounts from '../nylasaccounts/nylas-accounts'
import NylasAPI from '/imports/api/nylas/nylas-api'

export const getThread = new ValidatedMethod({
    name: 'thread.get',
    validate: new SimpleSchema({id: String}).validator({clean: true}),
    run({id}) {
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')
        return Threads.findOne({id})
    }
})

export const countThreads = new ValidatedMethod({
    name: 'thread.count',
    validate: new SimpleSchema({
      query: {
        type: Object,
        blackbox: true,
      },
   }).validator({clean: true}),
    run({ query }) {
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')
        const count = Threads.find(query).count()
        return count
    }
})

export const insertThread = new ValidatedMethod({
    name: 'thread.insert',
    validate: Threads.schema.omit('_id', 'created_at', 'modified_at').validator({clean: true}),
    run(thread) {
        //console.log('insertThread')
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')

        return Threads.insert(thread)
    }
})

export const updateThread = new ValidatedMethod({
    name: 'thread.update',
    validate: Threads.schema.omit('created_at', 'modified_at').validator({clean: true}),
    run({_id, ...data}) {
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const thread = Threads.findOne(_id)
        if (!thread) throw new Meteor.Error(`Could not found thread with _id:${_id}`)

        //console.log('updateThread', _id, data)
        Threads.update({_id}, {$set: data})

        return true
    }
})


export const upsertThread = new ValidatedMethod({
    name: 'thread.upsert',
    validate: Threads.schema.omit('_id', 'created_at', 'modified_at').validator({clean: true}),
    run(thread) {
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')

        if(Meteor.isServer) {
            const existingThread = Threads.findOne({id: thread.id})

            if (!existingThread) {
                //console.log('insetThread')
                Threads.insert(thread)
            } else if (existingThread && (thread.version != existingThread.version || thread.unread!=existingThread.unread)) { // It should be uncommented after deployment
                //console.log('updateThread')
                thread.conversationId = existingThread.conversationId
                Threads.update({_id: existingThread._id}, {$set: {...thread}})
            }
        }

        return true
    }
})

export const fetchNewThreads = new ValidatedMethod({
    name: 'thread.fetchNewThreads',
    validate: new SimpleSchema({accounts: [NylasAccounts.schema.omit('_id')]}).validator({clean: true}),
    run({accounts}) {
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const loadThreads = ({accessToken, categories}) => {
            const auth = {
                user: accessToken,
                pass: '',
                sendImmediately: true
            }

            const inbox = _.findWhere(categories, {name: 'inbox'})
            if (!inbox) return Promise.resolve([])

            return new Promise((resolve, reject) => NylasAPI.makeRequest({
                path: `/threads?in=${inbox.id}`,
                method: 'GET',
                auth
            }).then(threads => {
                resolve(threads)
            }).catch(err => reject(err)))
        }

        const promises = accounts.map(account => loadThreads(account))

        Promise.all(promises).then((threads) => {
            //console.log('Server Fetch New Threads result')
        }).finally(() => {

        })
    }
})


export const removeThread = new ValidatedMethod({
    name: 'thread.remove',
    validate: new SimpleSchema({
        _id: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
        id: {type: String, optional: true}
    }).validator({clean: true}),
    run({_id, id}) {
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')

        if (_id) {

            const thread = Threads.findOne(_id)
            if (!thread) throw new Meteor.Error(`Could not found thread with _id:${_id}`)

            Threads.remove({_id})

            Messages.remove({thread_id: thread.id})

            return true
        } else if (id) {

            const thread = Threads.findOne({id})
            if (!thread) throw new Meteor.Error(`Could not found thread with _id:${_id}`)

            Threads.remove({id})

            Messages.remove({thread_id: id})

            return true
        }
    }
})


export const unbindThreadFromConversation = new ValidatedMethod({
    name: 'thread.unbindFromConversation',
    validate: new SimpleSchema({
        id: {type: String, optional: true}
    }).validator({clean: true}),
    run({id}) {
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const thread = Threads.findOne({id})
        if (!thread) throw new Meteor.Error(`Could not found thread with id:${id}`)

        Threads.update({id}, {$set: {conversationId: null}})
    }
})

Meteor.methods({
  threadMarkAsReadByUser(threadId, read) {
      check(threadId, String)
      check(read, Boolean)

      const userId = Meteor.userId()
      if (!userId) throw new Meteor.Error(403, 'Not authorized')

      const thread = Threads.findOne({id: threadId})
      if (!thread) throw new Meteor.Error(404, 'Not found entity')

      const readByUsers = thread.readByUsers || []
      const index = _.findIndex(readByUsers, {userId})
      if (index > -1) readByUsers[index]['read'] = read
      else readByUsers.push({
          userId,
          read
      })

      Threads.update({id: threadId}, {$set: {readByUsers}})
  },
    threadSetStatus(_id, status) {
      check(_id, String)
        check(status, String)


        const userId = Meteor.userId()
        if (!userId) throw new Meteor.Error(403, 'Not authorized')

        const thread = Threads.findOne({_id})
        if (!thread) throw new Meteor.Error(404, 'Not found entity')

        Threads.update({_id}, {$set: {status}})
    }
})

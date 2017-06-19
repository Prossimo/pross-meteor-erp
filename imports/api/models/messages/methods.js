import { Meteor } from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import Messages from './messages'
import NylasAPI from '../../nylas/nylas-api'
import Threads from '../threads/threads'

const bound = Meteor.bindEnvironment((callback) => callback())

Meteor.methods({
    insertMessageForSalesRecord(salesRecordId, message)
    {
        check(salesRecordId, String)
        check(message, Object)

        NylasAPI.makeRequest({
            path: `/threads/${message.thread_id}`,
            method: 'GET',
            accountId: message.account_id
        }).then((thread) => {
            if (thread) {
                bound(() => {
                    const existingThreads = Threads.find({id:thread.id}).fetch()
                    if(existingThreads && existingThreads.length) {
                        Threads.update({id:thread.id}, {$set:thread})
                    } else {
                        Threads.insert(_.extend(thread, {salesRecordId}))
                    }

                    return Messages.insert(message)
                })
            }
        })
    }
})

export const updateMessage = new ValidatedMethod({
    name: 'message.update',
    validate: Messages.schema.validator({clean:true}),
    run({_id, ...data}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const message = Messages.findOne(_id)
        if(!message) throw new Meteor.Error(`Could not found message with _id:${_id}` )

        Messages.update({_id}, {$set:data})
    }
})
import { Meteor } from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import Messages from './messages'
import NylasAPI from '../../nylas/nylas-api'
import Threads from '../threads/threads'

const bound = Meteor.bindEnvironment((callback) => callback())


export const insertMessage = new ValidatedMethod({
    name: 'message.insert',
    validate: Messages.schema.omit('_id', 'created_at', 'modified_at').validator({clean: true}),
    run(message) {
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')

        Messages.insert(message)

        return true
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

export const upsertMessage = new ValidatedMethod({
    name: 'message.upsert',
    validate: Messages.schema.omit('_id', 'created_at', 'modified_at').validator({clean: true}),
    run(message) {
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')

        if(Meteor.isServer) {
            const existingMessage = Messages.findOne({id: message.id})
            if (!existingMessage) {
                console.log('insertMessage')
                Messages.insert(message)
            } else if (existingMessage && message.version!=existingMessage.version) {
                console.log('updateMessage')
                Messages.update({_id: existingMessage._id}, {$set: {...message}})
            }
        }

        return true
    }
})

export const removeMessage = new ValidatedMethod({
    name: 'message.remove',
    validate: Messages.schema.pick('id').validator({clean: true}),
    run({id}) {
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')

        if(Meteor.isServer) {
            Messages.remove({id})
        }

        return true
    }
})

export const saveMessage = new ValidatedMethod({
    name: 'message.saveMessage',
    validate: new SimpleSchema({
        message: Messages.schema.omit('_id','created_at','modified_at'),
        conversationId: {type:String, optional:true},
        isNew: {type:Boolean, optional:true},
        isReply: {type:Boolean, optional:true}
    }).validator({clean:true}),
    run({conversationId, isNew, isReply, message}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        NylasAPI.makeRequest({
            path: `/threads/${message.thread_id}`,
            method: 'GET',
            accountId: message.account_id
        }).then((thread) => {
            if (thread) {
                //console.log(thread)
                bound(() => {
                    if(Meteor.isServer) {
                        const existingThread = Threads.findOne({id:thread.id})

                        const data = {}
                        if(conversationId) data.conversationId = conversationId
                        if(isNew) data.assignee = this.userId
                        if(isReply && existingThread && existingThread.assignee!==this.userId) {
                            const followers = existingThread.followers || []
                            followers.push(this.userId)
                            data.followers = followers
                        }
                        if(existingThread) {
                            Threads.update({id:thread.id}, {$set:Object.assign(thread, data)})
                        } else {
                            Threads.insert(Object.assign(thread, data))
                        }

                        const existingMessage = Messages.findOne({id:message.id})
                        if(!existingMessage) {
                            Messages.insert(message)
                        } else if(existingMessage.version !== message.version) {
                            Messages.update({_id: existingMessage._id}, {$set: {...message}})
                        }
                    }
                })
            }
        })
    }
})

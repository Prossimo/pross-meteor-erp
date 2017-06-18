import queryString from 'query-string'
import Threads from './threads'
import Messages from '../messages/messages'
import NylasAPI from '../../nylas/nylas-api'

const bound = Meteor.bindEnvironment((callback) => callback())

Meteor.methods({
    updateThreadAndMessages({thread_id, account_id}) {
        check(thread_id, String)
        check(account_id, String)

        NylasAPI.makeRequest({
            path: `/threads/${thread_id}`,
            method: 'GET',
            accountId: account_id
        }).then((t) => {

            const existingThread = Threads.findOne({id:threadId})
            if(existingThread) {

                Threads.update({_id:existingThread._id}, {$set:_.extend(thread, {salesRecordId})})

                const query = queryString.stringify({thread_id: thread.id})
                NylasAPI.makeRequest({
                    path: `/messages?${query}`,
                    method: 'GET',
                    accountId: thread.account_id
                }).then((messages) => {
                    if (messages && messages.length) {

                        bound(() => {
                            messages.forEach((message) => {
                                const existingMessage = Messages.findOne({id:message.id})
                                if(!existingMessage) {
                                    Messages.insert(message)
                                } else {
                                    Messages.update({_id:existingMessage._id}, {$set:message})
                                }
                            })
                        })
                        /*const Fiber = require('fibers')

                         Fiber(() => {
                         messages.forEach((message) => {
                         const existingMessage = Messages.findOne({id:message.id})
                         if(!existingMessage) {
                         Messages.insert(message)
                         } else {
                         Messages.update({_id:existingMessage._id}, {$set:message})
                         }
                         })
                         }).run()*/
                    }
                })
            }
        })
    }
})
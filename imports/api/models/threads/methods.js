import queryString from 'query-string'
import Threads from './threads'
import Messages from '../messages/messages'
import NylasAPI from '../../nylas/nylas-api'


Meteor.methods({
    insertOrUpdateThreadWithMessage(salesRecordId, thread, message)
    {
        /*check(data, {
            id: Match.Maybe(String),
            account_id: Match.Maybe(String),
            email: String,
            name: Match.Maybe(String),
            phone_numbers: Match.Maybe(Array)
        });*/

        const existingThread = Threads.findOne({id:thread.id, salesRecordId:salesRecordId})
        if(existingThread && existingThread.version!=thread.version) {
            Threads.update({_id:existingThread._id}, {$set:_.extend(thread, {salesRecordId})})
        } else {
            Threads.insert(_.extend(thread, {salesRecordId}))
        }

        return Messages.insert(message)
    },

    updateThreadAndMessages(salesRecordId, thread) {
        const existingThread = Threads.findOne({id:thread.id, salesRecordId:salesRecordId})
        if(existingThread) {
            Threads.update({_id:existingThread._id}, {$set:_.extend(thread, {salesRecordId})})

            const query = queryString.stringify({thread_id: thread.id});
            NylasAPI.makeRequest({
                path: `/messages?${query}`,
                method: 'GET',
                accountId: thread.account_id
            }).then((messages) => {
                if (messages && messages.length) {

                    const Fiber = require('fibers')

                    Fiber(() => {
                        messages.forEach((message) => {
                            const existingMessage = Messages.findOne({id:message.id})
                            if(!existingMessage)
                                Messages.insert(message)
                        })
                    }).run()
                }
            })
        }


    }
});
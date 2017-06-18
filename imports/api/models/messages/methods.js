import Messages from './messages'
import Threads from '../threads/threads'
import NylasAPI from '../../nylas/nylas-api'

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
import _ from 'underscore'
import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import {ROLES, People, SalesRecords, ClientStatus, SupplierStatus, Tasks, Quotes, Files, Events, Messages, SlackMessages, Conversations, Threads} from '../index'



Meteor.publishComposite('salesrecords.one', function (_id) {
    check(_id, String)
    if (!Match.test(_id, String)) return this.ready()

    return {
        find() {
            return SalesRecords.find({_id})
        },

        children: [{
            find({_id}) {
                return Events.find({projectId:_id})
            }
        },{
            find({slackChanel}) {
                if(slackChanel) {
                    return SlackMessages.find({channel: slackChanel})
                }
            }
        },{
            find({_id}) {
                return Quotes.find({projectId:_id})
            }
        },{
            find({_id}) {
                return Files.find({'metadata.projectId': _id})
            }
        },{
            find({_id}) {
                return Tasks.find({parentType:'project', parentId: _id})
            }
        },{
            find({conversationIds}) {
                if(conversationIds && conversationIds.length>0) {
                    return Conversations.find({_id: {$in: conversationIds}})
                }
            }
        },{
            find({conversationIds}) {
                if(conversationIds && conversationIds.length>0) {
                    return Threads.find({conversationId: {$in:conversationIds}})
                }
            }
        },{
            find(salesRecord) {
                const threads = salesRecord.threads()

                if(threads && threads.length > 0) {
                    return Messages.find({thread_id: {$in: _.pluck(threads, 'id')}})
                }
            }
        }]
    }
})

Meteor.publishComposite('salesrecords.mine', () => ({
    find() {
        if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) return SalesRecords.find()
        return SalesRecords.find({'members': this.userId})
    },
    children: [
        {
            find({ stakeholders }) {
                if (stakeholders) {
                    const peopleIds = stakeholders.map(({ peopleId }) => peopleId)
                    return People.find({ _id: { $in: peopleIds } })
                }
            }

        }
    ]
}))

Meteor.publish('clientstatuses.all', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return ClientStatus.find({})
})

Meteor.publish('supplierstatuses.all', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return SupplierStatus.find({})
})
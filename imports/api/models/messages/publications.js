import _ from 'underscore'
import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import {ROLES} from '../users/users'
import Messages from './messages'
import SalesRecords from '../salesRecords/salesRecords'
import Projects from '../projects/projects'
import Conversations from '../conversations/conversations'
import Threads from '../threads/threads'

Meteor.publish('messages.mine', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    if(Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
        return Messages.find()
    }

    const nylasAccounts = Meteor.users.findOne({_id:this.userId}).nylasAccounts()
    return Messages.find({account_id:{$in:_.pluck(nylasAccounts, 'accountId')}})
})


Meteor.publish('messages.all', function () {
    if(!this.userId) return this.ready()

    return Messages.find()
})

Meteor.publish('messages.bySalesRecord', function (salesRecordId) {
    check(salesRecordId, String)

    if(!this.userId) return this.ready()

    const salesRecord = SalesRecords.findOne(salesRecordId)

    if(salesRecord) {
        const threads = salesRecord.threads()

        if(threads && threads.length>0) {
            return Messages.find({thread_id: _.pluck(threads, 'id')})
        }
    }
    return this.ready()
})

Meteor.publish('messages.byProject', function (projectId) {
    check(projectId, String)

    if(!this.userId) return this.ready()

    const project = Projects.findOne(projectId)

    if(project) {
        const threads = project.threads()

        if(threads && threads.length>0) {
            return Messages.find({thread_id: _.pluck(threads, 'id')})
        }
    }
    return this.ready()
})
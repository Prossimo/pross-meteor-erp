import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import {ROLES} from '../users/users'
import Threads from './threads'

Meteor.publish('threads.mine', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    if(Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
        return Threads.find()
    }

    const nylasAccounts = Meteor.users.findOne({_id:this.userId}).nylasAccounts()
    return Threads.find({account_id:{$in:map(nylasAccounts, 'accountId')}})
})

Meteor.publish('threads.accountId', function(accountId) {
    check(accountId, String)
    if(!this.userId) {
        this.ready()
        return
    }

    return Threads.find({account_id: accountId})
})

Meteor.publish('threads.all', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return Threads.find()
})

Meteor.publish('threads.custom', function(query, options) {
    check(query, Object)
    check(options, Object)
    if (!this.userId) {
        this.ready()
        return
    }
    return Threads.find(query, options)
})

Meteor.publish('threads.params', function(filters={}, options={}) {
    check(filters, Object)
    check(options, {
        sort: Match.Maybe(Object),
        skip: Match.Maybe(Number),
        limit: Match.Maybe(Number)
    })
    if(!this.userId) {
        this.ready()
        return
    }

    //if(!options.skip) options.skip = 0
    //if(!options.limit) options.limit = 100
    //console.log('threads.params publication', filters, options, Threads.find(filters, options).fetch().length)
    return Threads.find(filters, options)
})

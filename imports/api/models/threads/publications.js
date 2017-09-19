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
    return Threads.find({account_id:{$in:_.pluck(nylasAccounts, 'accountId')}})
})

Meteor.publish('threads.all', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return Threads.find()
})

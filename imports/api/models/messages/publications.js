import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import {ROLES} from '../users/users'
import Messages from './messages'

Meteor.publish('MyMessages', function() {
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

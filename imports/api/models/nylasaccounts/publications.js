import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import NylasAccounts from './nylas-accounts'
import {ROLES} from '../users/users'

Meteor.publish('nylasaccounts.all', () => NylasAccounts.find({}))
Meteor.publish('nylasaccounts.mine', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    const $or = [{userId:this._id}]
    if(Roles.userIsInRole(this._id, ROLES.ADMIN)) $or.push({isTeamAccount:true})
    else $or.push({isTeamAccount:true, teamMembers:this._id})

    return NylasAccounts.find({$or})
})
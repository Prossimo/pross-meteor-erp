import {Meteor} from 'meteor/meteor'
import NylasAccounts from './nylas-accounts'

Meteor.publish('nylasaccounts.all', () => NylasAccounts.find({}))
Meteor.publish('nylasaccounts.mine', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return NylasAccounts.find({
        '$or': [{isTeamAccount: true},{userId: this.userId}]
    })
})
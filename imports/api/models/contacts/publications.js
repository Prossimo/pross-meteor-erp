import {Meteor} from 'meteor/meteor'
import map from 'lodash/map'
import Contacts from './contacts'

Meteor.publish('contacts.mine', function () {
    if(!this.userId) return []
    const nylasAccounts = Meteor.users.findOne({_id:this.userId}).nylasAccounts()

    return Contacts.find({
        $or: [{
            account_id: {
                $in:map(nylasAccounts, 'accountId')
            }
        },{
            userId: this.userId
        }]
    })
})

Meteor.publish('contacts.all', () => Contacts.find())

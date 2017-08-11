import {Meteor} from 'meteor/meteor'
import ClientStatus from './clientstatus'
import SupplierStatus from './supplierstatus'

Meteor.publish('ClientStatus', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return ClientStatus.find({})
})

Meteor.publish('SupplierStatus', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return SupplierStatus.find({})
})


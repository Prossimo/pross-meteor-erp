import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import {ROLES, People} from '../index'
import SalesRecords from './salesRecords'
import ClientStatus from './clientstatus'
import SupplierStatus from './supplierstatus'
import Tasks from '../tasks/tasks'


Meteor.publishComposite('MySalesRecords', () => ({
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
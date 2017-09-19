import {Meteor} from 'meteor/meteor'
import People from './people'
import Designations from './designations'

Meteor.publish('people.all', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return People.find({})
})

Meteor.publish('peopledesignations.all', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return Designations.find({})
})


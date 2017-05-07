import {Meteor} from 'meteor/meteor'
import {GET_COMPANIES} from '../../constants/collections'
import Companies from './companies'

Meteor.publish(GET_COMPANIES, function() {console.log('userId', this.userId)
    if(!this.userId) {
        this.ready()
        return
    }

    return Companies.find({})
})
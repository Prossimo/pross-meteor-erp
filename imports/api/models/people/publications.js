import {Meteor} from 'meteor/meteor'
import {GET_COMPANIES} from '../../constants/collections'
import Companies from './companies'

Meteor.publish(GET_COMPANIES, function() {
    if(!this.userId) {
        this.ready()
        return
    }

    console.log('GET_COMPANIES publication')
    return Companies.find({})
})
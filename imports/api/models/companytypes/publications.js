import {Meteor} from 'meteor/meteor'
import {GET_COMPANYTYPES} from '../../constants/collections'
import CompanyTypes from './companytypes'

Meteor.publish(GET_COMPANYTYPES, function() {
    if(!this.userId) {
        this.ready()
        return
    }

    console.log('GET_COMPANYTYPES publication')
    return CompanyTypes.find({})
})
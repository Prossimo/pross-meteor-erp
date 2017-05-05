import {Meteor} from 'meteor/meteor'
import {GET_COMPANIES} from '../../constants/collections'
import Companies from './companies'

Meteor.publish(GET_COMPANIES, ()=>{
    if(!this.userId) {
        return this.ready();
    }

    return Companies.find({})
})
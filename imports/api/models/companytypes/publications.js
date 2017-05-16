import {Meteor} from 'meteor/meteor'
import {GET_COMPANYTYPES} from '../../constants/collections'
import CompanyTypes from './companytypes'

Meteor.publish(GET_COMPANYTYPES, function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return CompanyTypes.find({$or:[{user_id:null},{user_id:this.userId}]})
})
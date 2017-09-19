import {Meteor} from 'meteor/meteor'
import Companies from './companies'
import CompanyTypes from '../companies/companytypes'


Meteor.publish('companies.all', function() {
    if(!this.userId) {
        this.ready()
        return
    }
    return Companies.find({})
})

Meteor.publish('companytypes.all', function() {
    if(!this.userId) {
        this.ready()
        return
    }

    return CompanyTypes.find({$or:[{user_id:null},{user_id:this.userId}]})
})
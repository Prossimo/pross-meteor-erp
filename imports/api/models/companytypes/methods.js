import {_} from 'meteor/underscore'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import CompanyTypes from './companytypes'
import {ADMIN_ROLE_LIST} from '../../constants/roles'


export const insertCompanyType = new ValidatedMethod({
    name: 'companytypes.insert',
    validate: CompanyTypes.schema.pick('name').validator({clean:true}),
    run({name}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const type = CompanyTypes.findOne({name})
        if(type) throw new Meteor.Error('Duplicated type name')

        const data = {
            name
        }

        if(!Roles.userIsInRole(this.userId, [...ADMIN_ROLE_LIST])) data.user_id = this.userId
        return CompanyTypes.insert(data)
    }
})

export const updateCompanyType = new ValidatedMethod({
    name: 'companytypes.update',
    validate: CompanyTypes.schema.pick('_id','name').validator({clean:true}),
    run({_id, name}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const companyType = CompanyTypes.findOne({_id})
        if(!companyType) throw new Meteor.Error(`Not found company type with _id ${_id}`)

        if(!Roles.userIsInRole(this.userId, [...ADMIN_ROLE_LIST]) && (!companyType.user_id || companyType.user_id!==this.userId))
            throw new Meteor.Error('Permission denied')

        const type = CompanyTypes.findOne({name})
        if(type && type._id !== companyType._id) throw new Meteor.Error('Duplicated type name')

        const data = {
            name: _.isUndefined(name) ? null : name
        }

        return CompanyTypes.update({_id}, {$set:data})
    }
})

export const removeCompanyType = new ValidatedMethod({
    name: 'companytypes.remove',
    validate: new SimpleSchema({_id:CompanyTypes.schema.schema('_id')}).validator({clean:true}),
    run({_id}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        const companyType = CompanyTypes.findOne({_id})
        if(!companyType) throw new Meteor.Error(`Not found company type with _id ${_id}`)

        if(!Roles.userIsInRole(this.userId, [...ADMIN_ROLE_LIST]) && (!companyType.user_id || companyType.user_id!==this.userId))
            throw new Meteor.Error('Permission denied')

        CompanyTypes.remove(_id)
    }
})
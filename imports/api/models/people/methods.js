import {_} from 'meteor/underscore'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import People from './people'
import Designations from './designations'
import {ADMIN_ROLE_LIST} from '../../constants/roles'


export const insertPerson = new ValidatedMethod({
    name: 'people.insert',
    validate: People.schema.pick('name','email','twitter','facebook','linkedin','designation_id','role','is_user','emails','phone_numbers','company_id','position').validator({clean:true}),
    run({name, email, twitter, facebook, linkedin, designation_id, role, is_user, emails, phone_numbers, company_id, position}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const data = {
            name, email, twitter, facebook, linkedin, designation_id, role, is_user, emails, phone_numbers, company_id, position,
            user_id: this.userId
        }

        return People.insert(data)
    }
})

export const updatePerson = new ValidatedMethod({
    name: 'people.update',
    validate: People.schema.pick('_id','name','email','twitter','facebook','linkedin','designation_id','role','is_user','emails','phone_numbers','company_id','position').validator({clean:true}),
    run({_id, name, email, twitter, facebook, linkedin, designation_id, role, is_user, emails, phone_numbers, company_id, position}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const person = People.findOne({_id})
        if(!person) throw new Meteor.Error(`Not found person with _id ${_id}`)

        if(person.user_id!==this.userId) throw new Meteor.Error('Permission denied')

        const data = {
            name: _.isUndefined(name) ? null : name,
            email: _.isUndefined(email) ? null : email,
            twitter: _.isUndefined(twitter) ? null : twitter,
            facebook: _.isUndefined(facebook) ? null : facebook,
            linkedin: _.isUndefined(linkedin) ? null : linkedin,
            designation_id: _.isUndefined(designation_id) ? null : designation_id,
            role: _.isUndefined(role) ? null : role,
            is_user: _.isUndefined(is_user) ? false : is_user,
            emails: _.isUndefined(emails) ? [] : emails,
            phone_numbers: _.isUndefined(phone_numbers) ? [] : phone_numbers,
            company_id: _.isUndefined(company_id) ? null : company_id,
            position: _.isUndefined(position) ? null : position,
            user_id: this.userId
        }

        return People.update({_id}, {$set:data})
    }
})

export const removePerson = new ValidatedMethod({
    name: 'people.remove',
    validate: new SimpleSchema({_id:People.schema.schema('_id')}).validator({clean:true}),
    run({_id}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const person = People.findOne({_id})
        if(!person) throw new Meteor.Error(`Not found person with _id ${_id}`)

        if(person.user_id!==this.userId) throw new Meteor.Error('Permission denied')

        People.remove(_id)
    }
})

export const insertDesignation = new ValidatedMethod({
    name: 'people.designations.insert',
    validate: Designations.schema.pick('name','role_addable','roles').validator({clean:true}),
    run({name, role_addable, roles}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        if(!Roles.userIsInRole(this.userId, [...ADMIN_ROLE_LIST])) throw new Meteor.Error('Permission denied')

        const data = {
            name, role_addable, roles
        }

        return Designations.insert(data)
    }
})

export const updateDesignation = new ValidatedMethod({
    name: 'people.designations.update',
    validate: Designations.schema.pick('_id','name','role_addable','roles').validator({clean:true}),
    run({_id, name, role_addable, roles}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        if(!Roles.userIsInRole(this.userId, [...ADMIN_ROLE_LIST])) throw new Meteor.Error('Permission denied')

        const designation = Designations.findOne({_id})
        if(!designation) throw new Meteor.Error(`Not found designation with _id ${_id}`)


        const data = {
            name: _.isUndefined(name) ? null : name,
            role_addable: _.isUndefined(role_addable) ? false : role_addable,
            roles: _.isUndefined(roles) ? [] : roles
        }

        return Designations.update({_id}, {$set:data})
    }
})

export const removeDesignation = new ValidatedMethod({
    name: 'people.designations.remove',
    validate: new SimpleSchema({_id:Designations.schema.schema('_id')}).validator({clean:true}),
    run({_id}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        if(!Roles.userIsInRole(this.userId, [...ADMIN_ROLE_LIST])) throw new Meteor.Error('Permission denied')

        const designation = Designations.findOne({_id})
        if(!designation) throw new Meteor.Error(`Not found designation with _id ${_id}`)

        Designations.remove(_id)
    }
})
import {_} from 'meteor/underscore'
import { Meteor } from 'meteor/meteor'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import Companies from './companies'


export const insertCompany = new ValidatedMethod({
    name: 'companies.insert',
    validate: Companies.schema.pick('name','website','type','phone_numbers','addresses').validator({clean:true}),
    run({name, website, type, phone_numbers, addresses}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const data = {
            name,
            website,
            type,
            phone_numbers,
            addresses,
            user_id: this.userId
        }

        return Companies.insert(data)
    }
})

export const updateCompany = new ValidatedMethod({
    name: 'companies.update',
    validate: Companies.schema.pick('_id','name','website','type','phone_numbers','addresses').validator({clean:true}),
    run({_id, name, website, type, phone_numbers, addresses}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const company = Companies.findOne({_id})
        if(!company) throw new Meteor.Error(`Not found company with _id ${_id}`)

        const data = {
            name: _.isUndefined(name) ? null : name,
            website: _.isUndefined(website) ? null : website,
            type: _.isUndefined(type) ? null : type,
            phone_numbers: _.isUndefined(phone_numbers) ? [] : phone_numbers,
            addresses: _.isUndefined(addresses) ? [] : addresses,
            user_id: this.userId
        }

        return Companies.update({_id}, {$set:data})
    }
})

export const removeCompany = new ValidatedMethod({
    name: 'companies.remove',
    validate: new SimpleSchema({_id:Companies.schema.schema('_id')}).validator({clean:true}),
    run({_id}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        Companies.remove(_id)
    }
})
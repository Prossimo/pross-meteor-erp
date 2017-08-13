import {Roles} from 'meteor/alanning:roles'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import {ROLES, ClientStatus, SupplierStatus} from '../index'

export const insertClientStatus = new ValidatedMethod({
    name: 'clientstatus.insert',
    validate: ClientStatus.schema.pick('name').validator({clean:true}),
    run({name}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Permission denied')

        return ClientStatus.insert({name, editable:true})
    }
})

export const updateClientStatus = new ValidatedMethod({
    name: 'clientstatus.update',
    validate: ClientStatus.schema.pick('_id','name').validator({clean:true}),
    run({_id, name}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Permission denied')

        const status = ClientStatus.findOne({_id})
        if(!status) throw new Meteor.Error('Could not found entity')

        return ClientStatus.update({_id}, {name})
    }
})

export const removeClientStatus = new ValidatedMethod({
    name: 'clientstatus.remove',
    validate: ClientStatus.schema.pick('_id').validator({clean:true}),
    run({_id}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Permission denied')

        const status = ClientStatus.findOne({_id})
        if(!status) throw new Meteor.Error('Could not found entity')

        return ClientStatus.remove({_id})
    }
})

export const insertSupplierStatus = new ValidatedMethod({
    name: 'supplierstatus.insert',
    validate: SupplierStatus.schema.pick('name').validator({clean:true}),
    run({name}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Permission denied')

        return SupplierStatus.insert({name, editable:true})
    }
})

export const updateSupplierStatus = new ValidatedMethod({
    name: 'supplierstatus.update',
    validate: SupplierStatus.schema.pick('_id','name').validator({clean:true}),
    run({_id, name}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Permission denied')

        const status = SupplierStatus.findOne({_id})
        if(!status) throw new Meteor.Error('Could not found entity')

        return SupplierStatus.update({_id}, {name})
    }
})

export const removeSupplierStatus = new ValidatedMethod({
    name: 'supplierstatus.remove',
    validate: SupplierStatus.schema.pick('_id').validator({clean:true}),
    run({_id}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')
        if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Permission denied')

        const status = SupplierStatus.findOne({_id})
        if(!status) throw new Meteor.Error('Could not found entity')

        return SupplierStatus.remove({_id})
    }
})
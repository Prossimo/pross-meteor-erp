import _ from 'underscore'
import { Meteor } from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import Conversations from './conversations'

export const insertConversation = new ValidatedMethod({
    name: 'conversation.insert',
    validate: Conversations.schema.pick('name','salesRecordId').validator({clean:true}),
    run({name, salesRecordId}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        if(Conversations.findOne({salesRecordId, name})) throw new Meteor.Error('Conversation with same name is exist')

        const data = {
            name,
            salesRecordId,
            user_id: this.userId
        }

        return  Conversations.insert(data)
    }
})

export const updateConversation = new ValidatedMethod({
    name: 'conversation.update',
    validate: Conversations.schema.pick('_id','name','salesRecordId').validator({clean:true}),
    run({_id, name, salesRecordId}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const conversation = Conversations.findOne({_id})
        if(!conversation) throw new Meteor.Error(`Not found conversation with _id ${_id}`)

        const existingConversation = Conversations.findOne({salesRecordId, name})
        if(existingConversation && existingConversation._id!=_id) throw new Meteor.Error('Conversation with same name is exist')

        const data = {
            name: _.isUndefined(name) ? null : name,
            salesRecordId: _.isUndefined(salesRecordId) ? null : salesRecordId,
            user_id: this.userId
        }

        return Conversations.update({_id}, {$set:data})
    }
})

export const removeConversation = new ValidatedMethod({
    name: 'conversation.remove',
    validate: new SimpleSchema({_id:Conversations.schema.schema('_id')}).validator({clean:true}),
    run({_id}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        if(!Conversations.findOne({_id})) throw new Meteor.Error(`Not found conversation with _id ${_id}`)

        //if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Permission denied')

        Conversations.remove(_id)
    }
})
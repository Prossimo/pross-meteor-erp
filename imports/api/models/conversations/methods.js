import _ from 'underscore'
import { Meteor } from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import Conversations from './conversations'
import {ROLES} from '../index'

const validatePermission = (userId) => {
    if(!userId || !Roles.userIsInRole(userId, [ROLES.ADMIN, ROLES.SALES, ROLES.MANAGER])) {
        throw new Meteor.Error('Access Denied')
    }
}

export const insertConversation = new ValidatedMethod({
    name: 'conversation.insert',
    validate: Conversations.schema.pick('name', 'participants').validator({clean:true}),
    run({name, participants}) {
        validatePermission(this.userId)

        if(participants && participants.length > 0 &&_.findIndex(participants, {isMain:true}) == -1) participants[0]['isMain'] = true

        const data = {
            name,
            participants,
            owner: this.userId
        }

        return Conversations.insert(data)
    }
})

export const updateConversation = new ValidatedMethod({
    name: 'conversation.update',
    validate: Conversations.schema.pick('_id', 'name', 'participants').validator({clean:true}),
    run({_id, name, participants}) {
        validatePermission(this.userId)

        const conversation = Conversations.findOne({_id})
        if(!conversation) throw new Meteor.Error(`Not found conversation with _id ${_id}`)


        if(!_.isUndefined(participants) && _.findIndex(participants, {isMain:true}) == -1)  participants[0].isMain = true
        const data = {
            name: _.isUndefined(name) ? null : name,
            participants: _.isUndefined(participants) ? null : participants,
            user_id: this.userId
        }

        return Conversations.update({_id}, {$set:data})
    }
})

export const setParticipantAsMain = new ValidatedMethod({
    name: 'conversation.setParticipantAsMain',
    validate: Conversations.schema.pick('_id').extend({peopleId:{type: String, regEx: SimpleSchema.RegEx.Id}}).validator({clean:true}),
    run({_id, peopleId}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const conversation = Conversations.findOne({_id})
        if(!conversation) throw new Meteor.Error(`Not found conversation with _id ${_id}`)

        const {participants} = conversation
        if(_.findIndex(participants, {peopleId}) == -1) throw new Meteor.Error(`Not found participant with id: ${peopleId}`)

        participants.forEach(p => {
            if(p.peopleId == peopleId) p.isMain = true
            else p.isMain = false
        })

        return Conversations.update({_id}, {$set:{participants}})
    }
})


export const removeConversation = new ValidatedMethod({
    name: 'conversation.remove',
    validate: new SimpleSchema({_id:Conversations.schema.schema('_id')}).validator({clean:true}),
    run({_id}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const conversation = Conversations.findOne({_id})
        if(!conversation) throw new Meteor.Error(`Not found conversation with _id ${_id}`)

        if(!Roles.userIsInRole(this.userId, ROLES.ADMIN) && this.userId !== conversation.owner) throw new Meteor.Error(403, 'Permission denied')

        //if(!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Permission denied')

        Conversations.remove(_id)
    }
})
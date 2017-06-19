import { Meteor } from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import Threads from './threads'

export const updateThread = new ValidatedMethod({
    name: 'thread.update',
    validate: Threads.schema.validator({clean:true}),
    run({_id, ...data}) {
        if(!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const thread = Threads.findOne(_id)
        if(!thread) throw new Meteor.Error(`Could not found thread with _id:${_id}` )

        Threads.update({_id}, {$set:data})
    }
})
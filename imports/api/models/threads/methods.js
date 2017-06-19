import {Meteor} from 'meteor/meteor'
import {Roles} from 'meteor/alanning:roles'
import {ValidatedMethod} from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import Threads from './threads'
import Messages from '../messages/messages'

export const updateThread = new ValidatedMethod({
    name: 'thread.update',
    validate: Threads.schema.validator({clean: true}),
    run({_id, ...data}) {
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')

        const thread = Threads.findOne(_id)
        if (!thread) throw new Meteor.Error(`Could not found thread with _id:${_id}`)

        Threads.update({_id}, {$set: data})

        return true
    }
})

export const removeThread = new ValidatedMethod({
    name: 'thread.remove',
    validate: new SimpleSchema({
        _id: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true},
        id: {type: String, optional: true}
    }).validator({clean: true}),
    run({_id, id}) {
        if (!this.userId) throw new Meteor.Error(403, 'Not authorized')

        if(_id) {

            const thread = Threads.findOne(_id)
            if (!thread) throw new Meteor.Error(`Could not found thread with _id:${_id}`)

            Threads.remove({_id})

            Messages.remove({thread_id: thread.id})

            return true
        } else if(id) {

            const thread = Threads.findOne({id})
            if (!thread) throw new Meteor.Error(`Could not found thread with _id:${_id}`)

            Threads.remove({id})

            Messages.remove({thread_id: id})

            return true
        }
    }
})
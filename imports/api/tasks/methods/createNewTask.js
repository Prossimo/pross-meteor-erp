import SimpleSchema from 'simpl-schema'
import {ValidatedMethod} from 'meteor/mdg:validated-method'
import inviteUsers from './inviteUsers'
import sendSlackMessage from './sendSlackMessage'
import {Tasks} from '../../models'

export default new ValidatedMethod({
    name: 'task.create',
    validate: new SimpleSchema({
        name: {
            type: String,
            optional: true
        },
        assignee: {
            type: String,
            optional: true,
        },
        approver: {
            type: String,
            optional: true,
        },
        description: {
            type: String,
            optional: true,
        },
        dueDate: {
            type: Date,
            optional: true
        },
        status: {
            type: String,
            allowedValues: [
                'Idea',
                'To-Do',
                'In Progress',
                'Reviewing',
                'Complete',
                'Blocked',
            ],
            optional: true
        },
        parentId: {
            type: String,
        },
        parentType: {
            type: String
        }
    }).validator(),
    run(task) {
        if (!this.userId) return
        const {name, parentId, parentType, assignee, approver, dueDate, status} = task
        inviteUsers.call({
            parentId,
            taskOperators: [assignee, approver],
        })
        if(!name) {
            task.name = `Task #${Tasks.find({parentId, parentType}).fetch().length+1}`
        }
        if(!dueDate) {
            task.dueDate = new Date()
        }
        if(!status) {
            task.status = 'Idea'
        }

        const _id = Tasks.insert(task)
        const actorId = this.userId
        Meteor.defer(() => {
            sendSlackMessage.call({
                taskId: _id,
                parentId,
                type: 'NEW_TASK',
                actorId
            })
        })
        return _id
    },
})

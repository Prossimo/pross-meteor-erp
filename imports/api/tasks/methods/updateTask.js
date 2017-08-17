import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import inviteUsers from './inviteUsers'
import { Tasks } from '../../models'
import sendSlackMessage from './sendSlackMessage'

export default new ValidatedMethod({
  name: 'task.update',
  validate: Tasks.schema.validator(),
  run(task) {
    if (!this.userId) return
    const { assignee, approver, parentId } = task
    inviteUsers.call({
      parentId,
      taskOperators: [assignee, approver],
    })
    Tasks.update(task._id, {
      $set: task,
    })
    const actorId = this.userId
    Meteor.defer(() => {
      sendSlackMessage.call({
        taskId: task._id,
        parentId,
        type: 'UPDATE_TASK',
        actorId,
      })
    })
  },
})

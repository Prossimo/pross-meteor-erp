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
    const oldVersionTask = Tasks.findOne(task._id)

    delete task.created_at
    task.modified_at = new Date()

    // ASSIGN TASK TO USER
    Tasks.update(task._id, {
      $set: task,
    })
    let type = 'UPDATE_TASK'
    const actorId = this.userId
    if (oldVersionTask && !oldVersionTask.assignee && task.assignee) {
      type = 'ASSIGN_TASK'
    }
    Meteor.defer(() => {
      sendSlackMessage.call({
        taskId: task._id,
        parentId,
        type,
        actorId,
      })
    })
  },
})

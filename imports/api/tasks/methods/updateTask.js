import { ValidatedMethod } from 'meteor/mdg:validated-method'
import SimpleSchema from 'simpl-schema'
import inviteUsers from './inviteUsers'
import { Tasks, SalesRecords, Projects } from '../../models'
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

      // Add approver and assignee as teammember to project or deal
      if(task.parentType === 'deal') {
          const salesrecord = SalesRecords.findOne(parentId)
          if(salesrecord) {
              const members = salesrecord.members || []
              if(assignee&&assignee.length>0&&members.indexOf(assignee) == -1) members.push(assignee)
              if(approver&&approver.length>0&&members.indexOf(approver) == -1) members.push(approver)
              SalesRecords.update(parentId, {$set:{members}})
          }
      } else if(task.parentType === 'project') {
          const project = Projects.findOne(parentId)
          if(project) {
              const members = project.members || []
              if(assignee&&assignee.length>0&&members.map(m => m.userId).indexOf(assignee) == -1) members.push({userId:assignee})
              if(approver&&approver.length>0&&members.map(m => m.userId).indexOf(approver) == -1) members.push({userId:approver})
              Projects.update(parentId, {$set:{members}})
          }
      }

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

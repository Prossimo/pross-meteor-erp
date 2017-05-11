import SimpleSchema from 'simpl-schema';
import inviteUsers from './inviteUsers';
import { Tasks } from '../../models';

const updateTask = new ValidatedMethod({
  name: 'task.update',
  validate: new SimpleSchema({
    name: {
      type: String,
    },
    assignee: {
      type: String,
    },
    approver: {
      type: String,
      optional: true,
    },
    description: {
      type: String,
    },
    dueDate: {
      type: Date,
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
    },
    parentId: {
      type: String,
    },
    _id: {
      type: String,
    },
  }).validator(),
  run(task) {
    if (!this.userId) return;
    const { assignee, approver, parentId } = task;
    inviteUsers.call({
      parentId,
      taskOperators: [assignee, approver],
    });
    return Tasks.update(task._id, {
      $set: task,
    });
  },
});

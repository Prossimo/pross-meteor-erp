import SimpleSchema from 'simpl-schema';
import config from '/imports/api/config/config';
import inviteUsers from './inviteUsers';
import { Tasks } from '../../models';

const {
  slack: {
    apiRoot,
    apiKey,
    botId,
    botToken,
  },
} = config;

const createNewTask = new ValidatedMethod({
  name: 'task.create',
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
  }).validator(),
  run(task) {
    if (!this.userId) return;
    const { parentId, assignee, approver } = task;
    inviteUsers.call({
      parentId,
      taskOperators: [assignee, approver],
    });
    return Tasks.insert(task);
  },
});

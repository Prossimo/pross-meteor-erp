import SimpleSchema from 'simpl-schema';
import { Tasks } from '../../lib/collections';

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
    return Tasks.insert(task);
  },
});

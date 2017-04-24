import SimpleSchema from 'simpl-schema';
import { Tasks } from '../../lib/collections';

Tasks.schema = new SimpleSchema({
  _id: {
    type: String,
  },
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
      'Planned',
      'In Progress',
      'Complete',
      'Blocked',
    ],
  },
  parentId: {
    type: String,
  },
  isRemoved: {
    type: Boolean,
    defaultValue: false,
  },
});

Tasks.attachSchema(Tasks.schema);


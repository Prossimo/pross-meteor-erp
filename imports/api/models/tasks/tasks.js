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
      'Planned',
      'In Progress',
      'Complete',
      'Blocked',
    ],
  },
});

Tasks.attachSchema(Tasks.schema);


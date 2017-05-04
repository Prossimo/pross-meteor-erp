import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Tasks = new Mongo.Collection('Tasks');

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
      'In Progress',
      'Reviewing',
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

export default Tasks;

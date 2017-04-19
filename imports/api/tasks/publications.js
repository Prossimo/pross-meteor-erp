import { Tasks } from '../lib/collections';

Meteor.publish('task.all', function ({ parentId }) {
  if (!Match.test(parentId, String) || !this.userId) return this.ready();
  return Tasks.find({ parentId , isRemoved: false});
});

import { Tasks } from '../lib/collections';

Meteor.publishComposite('task.all', function ({ parentId }) {
  if (!Match.test(parentId, String) || !this.userId) return this.ready();
  return {
    find() {
      return Tasks.find({
        parentId,
        isRemoved: false,
      }, {
        fields: {
          isRemoved: 0,
        },
      });
    },

    children: [
      {
        find({ assignee, approver }) {
          return Meteor.users.find({ _id: { $in: [assignee, approver] } });
        },
      },
    ],
  };
});

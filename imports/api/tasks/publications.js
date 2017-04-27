import { Tasks } from '../lib/collections';

Meteor.publishComposite('task.all', function (param) {
  if (!Match.test(param, {
    parentId: String,
    filter: {
      AssignToMe: Boolean,
      DueDate: Boolean,
      IamApprover: Boolean,
      Today: Boolean,
      Tomorrow: Boolean,
    },
  })) return this.ready();

  if (!this.userId) return this.ready();
  const {
    parentId,
    filter: {
      AssignToMe,
      DueDate,
      IamApprover,
      Today,
      Tomorrow,
    },
  } = param;
  console.log(param);
  const selector = {
    parentId,
    isRemoved: false,
  };
  return {
    find() {
      return Tasks.find(selector, {
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

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

  const selector = {
    parentId,
    isRemoved: false,
  };

  if (AssignToMe) selector.assignee = this.userId;
  if (IamApprover) selector.approver = this.userId;
  if (DueDate) selector.dueDate = { $lt: new Date() };
  if (Today) {
    const start = moment(moment().format('YYYY-MM-DD') + ' 00:00:00').toDate();
    const end = moment(moment().format('YYYY-MM-DD') + ' 23:59:59').toDate();
    selector.dueDate = { $gte: start, $lte: end };
  }

  if (Tomorrow) {
    const start = moment(moment().add(1, 'd').format('YYYY-MM-DD') + ' 00:00:00').toDate();
    const end = moment(moment().add(1, 'd').format('YYYY-MM-DD') + ' 23:59:59').toDate();
    selector.dueDate = { $gte: start, $lte: end };
  }

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

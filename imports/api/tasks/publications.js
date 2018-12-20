import Tasks, { applyFilter } from "/imports/api/models/tasks/tasks";
import _ from "lodash";

Meteor.publishComposite("task.all", function(param = {}) {
  /*if (!Match.test(param, {
      parentId: Match.Maybe(String),
      filter: Match.Maybe({
        AssignToMe: Boolean,
        DueDate: Boolean,
        IamApprover: Boolean,
        Today: Boolean,
        Tomorrow: Boolean,
      }),
    })) return this.ready()*/
  if (!this.userId) return this.ready();

  const selector = applyFilter({
    userId: this.userId,
    ...param
  });

  return {
    find() {
      return Tasks.find(selector, {
        fields: {
          isRemoved: 0,
          comments: 0
        }
      });
    },

    children: [
      {
        find({ assignee, approver }) {
          return Meteor.users.find({
            _id: { $in: _.union(assignee, approver) }
          });
        }
      }
    ]
  };
});

/*
 * publish detail of a task
 * */

Meteor.publishComposite("task.details", function({ _id }) {
  if (!Match.test(_id, String)) return this.ready();
  return {
    find() {
      return Tasks.find(
        {
          _id,
          isRemoved: false
        },
        {
          fields: {
            isRemoved: 0
          }
        }
      );
    },
    children: [
      {
        find({ comments }) {
          if (comments) {
            const userIds = comments.map(({ userId }) => userId);
            return Meteor.users.find({ _id: { $in: userIds } });
          }
        }
      }
    ]
  };
});

/*
 * publish tasks by userId
 * */

Meteor.publishComposite("task.byUserId", function() {
  const userId = this.userId;
  if (!userId) return this.ready();
  return {
    find() {
      return Tasks.find(
        {
          isRemoved: false,
          $or: [{ assignee: userId }, { approver: userId }]
        },
        {
          fields: {
            isRemoved: 0
          }
        }
      );
    }
  };
});

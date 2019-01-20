import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import { Projects, SalesRecords } from "../../models";
import { slackClient } from "/imports/api/slack";
import union from "lodash/union";

export default new ValidatedMethod({
  name: "task.inviteUsers",
  validate: new SimpleSchema({
    parentId: {
      type: String
    },
    taskOperators: {
      type: Array
    },
    "taskOperators.$": {
      type: String
    }
  }).validator(),
  run({ parentId, taskOperators }) {
    /*
     * Add employee and approver to current project
     * */
    const project = Projects.findOne(parentId);
    const salesRecord = SalesRecords.findOne(parentId);
    const taskParent = project || salesRecord;
    if (taskParent) {
      const { members = [] } = taskParent;
      const memberIds = project
        ? members.filter(m => m && m.userId).map(({ userId }) => userId)
        : members;

      // Invite assigned users to project/saleRecord
      let willInviteUserIds = taskOperators
        .filter(userId => !memberIds.includes(userId) && !!userId)
        .map(userId => {
          if (project) {
            return { userId, isAdmin: false, category: [] };
          } else {
            return userId;
          }
        });
      const currentMembers = union(members, willInviteUserIds);

      // Invite user to project
      if (project) {
        console.log("User was invite to project");
        Meteor.call("updateProjectMembers", parentId, currentMembers, err => {
          if (err) return ClientErrorLog.error(err);
        });

        Projects.update(parentId, {
          $push: {
            members: {
              $each: willInviteUserIds
            }
          }
        });
      }

      // Invite user to saleRecord
      if (salesRecord) {
        console.log("User was invited to saleRecord");
        Meteor.call(
          "updateSalesRecordMembers",
          parentId,
          currentMembers,
          err => {
            if (err) return ClientErrorLog.error(err);
          }
        );

        SalesRecords.update(parentId, {
          $push: {
            members: {
              $each: willInviteUserIds
            }
          }
        });
      }

      willInviteUserIds = project
        ? willInviteUserIds.map(({ userId }) => userId)
        : willInviteUserIds;

      Meteor.users
        .find({ _id: { $in: willInviteUserIds }, slack: { $exists: true } })
        .forEach(user =>
          Meteor.call("inviteUserToSlackChannel", {
            ...taskParent.slackChannel,
            user: user.slack.id
          })
        );
    }
  }
});

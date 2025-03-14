import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import SimpleSchema from "simpl-schema";
import Messages from "./messages";
import NylasAPI from "../../nylas/nylas-api";
import Threads from "../threads/threads";
import { NylasAccounts } from "../index";
import _ from "underscore";

const bound = Meteor.bindEnvironment(callback => callback());

export const insertMessage = new ValidatedMethod({
  name: "message.insert",
  validate: Messages.schema
    .omit("_id", "created_at", "modified_at")
    .validator({ clean: true }),
  run(message) {
    if (!this.userId) throw new Meteor.Error(403, "Not authorized");

    Messages.insert(message);

    return true;
  }
});

export const updateMessage = new ValidatedMethod({
  name: "message.update",
  validate: Messages.schema.validator({ clean: true }),
  run({ _id, ...data }) {
    if (!this.userId) throw new Meteor.Error(403, "Not authorized");

    const message = Messages.findOne(_id);
    if (!message)
      throw new Meteor.Error(`Could not found message with _id:${_id}`);

    Messages.update({ _id }, { $set: data });
  }
});

export const upsertMessage = new ValidatedMethod({
  name: "message.upsert",
  validate: Messages.schema
    .omit("_id", "created_at", "modified_at")
    .validator({ clean: true }),
  run(message) {
    if (!this.userId) throw new Meteor.Error(403, "Not authorized");

    if (Meteor.isServer) {
      const existingMessage = Messages.findOne({ id: message.id });
      if (!existingMessage) {
        console.log("insertMessage");
        Messages.insert(message);
      } else if (
        existingMessage &&
        message.version != existingMessage.version
      ) {
        console.log("updateMessage");
        Messages.update({ _id: existingMessage._id }, { $set: { ...message } });
      }
    }

    return true;
  }
});

export const removeMessage = new ValidatedMethod({
  name: "message.remove",
  validate: Messages.schema.pick("id").validator({ clean: true }),
  run({ id }) {
    if (!this.userId) throw new Meteor.Error(403, "Not authorized");

    if (Meteor.isServer) {
      Messages.remove({ id });
    }

    return true;
  }
});

export const saveMessage = new ValidatedMethod({
  name: "message.saveMessage",
  validate: new SimpleSchema({
    message: Messages.schema.omit("_id", "created_at", "modified_at"),
    conversationId: { type: String, optional: true },
    isNew: { type: Boolean, optional: true },
    isReply: { type: Boolean, optional: true },
    shouldNotifySlack: { type: Boolean, optional: true }
  }).validator({ clean: true }),
  run({ conversationId, isNew, isReply, message, shouldNotifySlack }) {
    if (!this.userId) throw new Meteor.Error(403, "Not authorized");

    NylasAPI.makeRequest({
      path: `/threads/${message.thread_id}`,
      method: "GET",
      accountId: message.account_id
    }).then(thread => {
      if (thread) {
        bound(() => {
          if (Meteor.isServer) {
            const existingThread = Threads.findOne({ id: thread.id });

            const data = {};
            if (conversationId) data.conversationId = conversationId;
            if (isNew) data.assignee = this.userId;
            if (
              isReply &&
              existingThread &&
              existingThread.assignee !== this.userId
            ) {
              const followers = existingThread.followers || [];
              followers.push(this.userId);
              data.followers = followers;
            }
            let mentions;
            if (existingThread) {
              if (thread.unread) data.readByUsers = [];
              Threads.update(
                { id: thread.id },
                { $set: _.extend(thread, data) }
              );

              const members = [existingThread.getAssignee()].concat(
                existingThread.getFollowers()
              );
              mentions = _.uniq(
                members
                  .filter(m => m && m.slack != null)
                  .map(({ slack }) => slack),
                false,
                ({ id }) => id
              );
            } else {
              Threads.insert(_.extend(thread, data));
            }

            const existingMessage = Messages.findOne({ id: message.id });
            if (!existingMessage) {
              Messages.insert(message);
            } else if (existingMessage.version !== message.version) {
              Messages.update(
                { _id: existingMessage._id },
                { $set: { ...message } }
              );
            }

            if (shouldNotifySlack) {
              const nylasAccount = NylasAccounts.findOne({
                accountId: message.account_id
              });
              if (nylasAccount.isTeamAccount) {
                setTimeout(() => {
                  Meteor.call("sendMailToSlack", message, { mentions });
                }, 3 * 60 * 1000); // Send slack notification after 3 minutes to avoid duplicated notification from web hooking
              }
            }
          }
        });
      }
    });
  }
});

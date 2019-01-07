import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import slackClient from "../restful";
import { slack } from "/imports/api/config";
import { NylasAccounts, Conversations, Projects } from "/imports/api/models";

Meteor.methods({
  sendMailAssignToSlack(thread, { assignee, assigner } = {}) {
    check(thread, Object);
    check(assignee, Object);
    check(assigner, Match.Maybe(Object));

    let target;
    if (thread && thread.conversationId) {
      const conversation = Conversations.findOne({
        _id: thread.conversationId
      });
      target = conversation ? conversation.parent() : null;
    } else {
      const nylasAccount = NylasAccounts.findOne({
        accountId: thread.account_id
      });
      target = Projects.findOne({ nylasAccountId: nylasAccount._id });
    }

    let slackChannelId = target ? target.slackChannel.id : null;
    if (!slackChannelId) {
      slackChannelId = Meteor.call("getInboxSlackChannelId");
    }

    if (!slackChannelId)
      throw new Meteor.Error("Could not find slack channel for inbox");

    let slackText = `An email was assigned to <@${assignee.id}|${
      assignee.name
    }>`;
    if (assigner) slackText += ` by <@${assigner.id}|${assigner.name}>`;

    console.log(`=========> Sending mail thread(${thread.id}) to slack`);
    const params = {
      username: slack.botName,
      attachments: [
        {
          fallback: thread.snippet,
          color: "#f6a64f",
          pretext: `${_.pluck(thread.participants, "email").join(", ")}`,
          title: thread.subject,
          title_link: Meteor.absoluteUrl(`emailview?thread_id=${thread.id}`),
          text: thread.snippet,
          image_url: "http://my-website.com/path/to/image.jpg",
          thumb_url: "http://example.com/path/to/thumb.png",
          footer: "Mavrik CRM",
          footer_icon:
            "https://platform.slack-edge.com/img/default_application_icon.png",
          mrkdwn_in: ["text"]
        }
      ],
      as_user: false
    };

    Meteor.call("sendBotMessage", slackChannelId, slackText, params);
  }
});

import {Meteor} from 'meteor/meteor';
import {Match} from 'meteor/check';
import {
    SalesRecords,
    CreatedUsers,
    Quotes,
    Files,
    Events,
    SlackMessages,
    Projects,
    Tasks
} from '../lib/collections';
import {NylasAccounts} from '../models/nylasaccounts/nylas-accounts'
import Contacts from '../models/contacts/contacts'
import Conversations from '../models/conversations/conversations'
import {
    GET_PROJECTS,
    GET_USERS,
    GET_PROJECT,
    GET_SLACK_MSG,
    GET_PROJECT_EVENTS,
    GET_ADMIN_CREATE_USERS,
    GET_QUOTES,
    GET_PROJECT_FILES,
    GET_NYLAS_ACCOUNTS,
    GET_NEW_PROJECTS,
    GET_NEW_PROJECT,
    GET_CONTACTS,
    GET_MY_CONTACTS,
    GET_TASKS,
    GET_CONVERSATIONS
} from '../constants/collections';
import {ADMIN_ROLE_LIST} from '../constants/roles';

Meteor.startup(() => {
    Meteor.publish(GET_USERS, function () {
        return Meteor.users.find({}, {
            fields: {
                "services": 0
            }
        });
    });

    Meteor.publish(GET_PROJECTS, function () {
        if (Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) return SalesRecords.find();
        return SalesRecords.find({"members.userId": this.userId})
    });

    Meteor.publish(GET_QUOTES, function (projectId) {
        Match.test(projectId, String);

        return Quotes.find({projectId})
    });

    Meteor.publish(GET_PROJECT, function (_id) {
        Match.test(_id, String);

        if (Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) return SalesRecords.find({_id});
        return SalesRecords.find({_id, "members.userId": this.userId});
    });

    Meteor.publish(GET_ADMIN_CREATE_USERS, function () {
        if (Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST))
            return CreatedUsers.find({createBy: this.userId});
    });

    Meteor.publish(GET_PROJECT_FILES, function (projectId) {
        Match.test(projectId, String);

        return Files.find({'metadata.projectId': projectId});
    });

    Meteor.publish(GET_PROJECT_EVENTS, function (projectId) {
        Match.test(projectId, String);

        return Events.find({projectId});
    });

    Meteor.publish(GET_SLACK_MSG, function (salesRecordId) {
        Match.test(salesRecordId, String);

        const salesRecord = SalesRecords.findOne(salesRecordId);
        if (salesRecord.slackChanel) {
            return SlackMessages.find({channel: salesRecord.slackChanel, subtype: {$ne: "bot_message"}})
        } else {
            return [];
        }
    })

    Meteor.publish(GET_NYLAS_ACCOUNTS, function () {
        return NylasAccounts.find({});
    });

    Meteor.publish(GET_CONTACTS, function () {
        return Contacts.find({
            $or: [{
                removed: false
            }, {
                removed: null
            }]
        });
    });

    Meteor.publish(GET_MY_CONTACTS, function () {
        if(!this.userId) return []
        const nylasAccounts = Meteor.users.findOne({_id:this.userId}).nylasAccounts();

        return Contacts.find({
            $or: [{
                account_id: {
                    $in:_.pluck(nylasAccounts, 'accountId')
                }
            },{
                userId: this.userId
            }]
        });
    });

    Meteor.publish(GET_NEW_PROJECTS, function () {
        if (Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) return Projects.find();
        return Projects.find({'members.userId': this.userId})
    });

    Meteor.publish(GET_NEW_PROJECT, function (_id) {
        if (!Match.test(_id, String)) return this.ready();
        if (Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) return Projects.find({_id});
        return Projects.find({_id, 'members.userId': this.userId});
    });

    Meteor.publish(GET_TASKS, function (saleProjectId) {
        if (!Match.test(saleProjectId, String)) return this.ready();
        if (Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) return Tasks.find({
            $or: [
                { localProjectId: saleProjectId },
                { localSalesRecordId: saleProjectId }
            ]
        });
        // should use publish composite
        if (Projects.findOne({_id: projectId, 'members.userId': this.userId})) {
            return Tasks.find({ $or:
                [
                    { localProjectId: saleProjectId },
                    { localSalesRecordId: saleProjectId }
                ]
            });
        }
    });

    Meteor.publish(GET_CONVERSATIONS, function (salesRecordId) {
        if (!Match.test(salesRecordId, String)) return this.ready();

        return Conversations.find({salesRecordId})
    });
});



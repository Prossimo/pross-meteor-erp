import _ from 'underscore';
import {Meteor} from 'meteor/meteor';
import  {HTTP} from 'meteor/http';
import {check, Match} from 'meteor/check';
import {
  Messages,
  Files,
  CreatedUsers,
  SalesRecords,
  SlackUsers,
  Quotes,
  SlackMessages,
  Settings,
} from '../lib/collections';
import {EMPLOYEE_ROLE, ADMIN_ROLE_LIST, ADMIN_ROLE, SUPER_ADMIN_ROLE} from '../constants/roles';

import '../lib/extendMatch.js';
import '../models/nylasaccounts/methods';

const SLACK_API_KEY = "xoxp-136423598965-136423599189-142146118262-9e22fb56f47ce5af80c9f3d5ae363666";
const SLACK_BOT_ID = "U477F4M6Y";

Meteor.methods({
  userRegistration(userData){
    check(userData, {
      username: String,
      email: String,
      password: String,
      firstName: String,
      lastName: String,
      googleRefreshToken: Match.Maybe(String)
    });

    const {username, email, password, firstName, lastName, googleRefreshToken} = userData;
    let validation = {};
    if (Accounts.findUserByUsername(username)) validation.username = `Username "${username}" is already exist`;
    if (Accounts.findUserByEmail(email)) validation.email = `Email "${email}" is already exist`;

    if (!_.isEmpty(validation)) {
      userData.validation = validation;
      return userData;
    }

    const userId = Accounts.createUser({
      username,
      email,
      password,
      profile: {
        firstName,
        lastName,
        role: [
          {role: EMPLOYEE_ROLE}
        ]
      },
      nylas: result
    });
    Roles.addUsersToRoles(userId, [EMPLOYEE_ROLE]);

    userData.validation = validation;
    return userData;
  },

  sendEmail(mailData) {
    Match.test(mailData, {
      to: Match.OneOf(String, [String]),
      from: String,
      replyTo: String,
      subject: String,
      attachments: Match.Maybe([String]),
      html: String,
    });
    this.unblock();

    if (_.isArray(mailData.attachments) && mailData.attachments.length) {
      mailData.attachments = Files.find({_id: {$in: mailData.attachments}}).fetch().map(item => {
        return {
          fileName: item.original.name,
          filePath: `${Meteor.absoluteUrl(`cfs/files/files/${item._id}/${item.original.name}`)}`
        }
      });
    }

    Email.send(mailData);
    return "Message is sending";
  },

  createMassage(msgData, files){
    //todo refactor add checking args
    const author = Meteor.users.findOne({_id: this.userId}, {fields: {services: 0}});
    msgData.author = author;
    Messages.insert(msgData, (err, messageId) => {
      if (err) throw new Meteor.Error(err);

      if (files && files.length) {
        files.forEach(item => {
          item.messageId = messageId;
          Files.insert(item);
        });
      }
    });
  },

  adminCreateUser(data){
    if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error("Access denied");
    data.createBy = this.userId;
    data.createAt = new Date();
    data.isActive = false;
    CreatedUsers.insert(data);
  },

  adminEditUser(updatedUserInfo){
    if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error("Access denied");
    CreatedUsers.update({_id: updatedUserInfo._id}, {$set: updatedUserInfo}, (err) => {
      if (err) {
        throw new Meteor.Error(err)
      }   });
  },

  adminRemoveUser(userId){
    if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST))
      throw new Meteor.Error("Access denied");
    CreatedUsers.remove(userId);
  },

  checkCreatedAccount(email){
    return CreatedUsers.find({email}).count();
  },

  initCreatedUser(email, password){
    const createdUser = CreatedUsers.findOne({email, isActive: false});

    const userId = Accounts.createUser({
      username: createdUser.username,
      email,
      password,
      profile: {
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        role: [
          {role: 'user'}
        ]
      }
    });
    Roles.addUsersToRoles(userId, [createdUser.role]);
    CreatedUsers.update({_id: createdUser._id}, {$set: {isActive: true}});
    return userId;
  },

  updateProjectShipping(salesRecordId, shipping) {
    check(salesRecordId, String);
    check(shipping, {
      shippingContactPhone: Match.Maybe(Match.phone),
      shippingContactName: Match.Maybe(String),
      shippingContactEmail: Match.Maybe(String),
      shippingAddress: Match.Maybe(String),
      shippingNotes: Match.Maybe(String),
    });
    // current user belongs to ADMIN LIST
    const isAdmin = Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST);

    // current user belongs to salesRecords
    const salesRecord = SalesRecords.findOne(salesRecordId);
    if (!salesRecord) throw new Meteor.Error('Project does not exists');
    const isMember = !!salesRecord.members.find(({userId}) => userId === this.userId);

    // check permission
    if (!isMember && !isAdmin) throw new Meteor.Error('Access denied');

    return SalesRecords.update(salesRecordId, {
      $set: shipping,
    });
  },

  updateProjectBilling(salesRecordId, billing) {
    check(salesRecordId, String);
    check(billing, {
      billingContactPhone: Match.Maybe(Match.phone),
      billingContactName: Match.Maybe(String),
      billingContactEmail: Match.Maybe(String),
      billingAddress: Match.Maybe(String),
      billingNotes: Match.Maybe(String),
    });
    // current user belongs to ADMIN LIST
    const isAdmin = Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST);

    // current user belongs to salesRecords
    const salesRecord = SalesRecords.findOne(salesRecordId);
    if (!salesRecord) throw new Meteor.Error('Project does not exists');
    const isMember = !!salesRecord.members.find(({userId}) => userId === this.userId);

    // check permission
    if (!isMember && !isAdmin) throw new Meteor.Error('Access denied');
    return SalesRecords.update(salesRecordId, {
      $set: billing,
    });
  },

  updateProjectAttributes(salesRecordId, attributes) {
    check(salesRecordId, String);
    check(attributes, {
      shippingMode: String,
      actualDeliveryDate: Date,
      productionStartDate: Date,
      supplier: Match.Maybe(String),
      shipper: Match.Maybe(String),
    })

    // current user belongs to ADMIN LIST
    const isAdmin = Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST);

    // current user belongs to salesRecords
    const salesRecord = SalesRecords.findOne(salesRecordId);
    if (!salesRecord) throw new Meteor.Error('Project does not exists');
    const isMember = !!salesRecord.members.find(({userId}) => userId === this.userId);

    // check permission
    if (!isMember && !isAdmin) throw new Meteor.Error('Access denied');

    return SalesRecords.update(salesRecordId, {
      $set: attributes,
    });
  },

  initVisiableProjectFields() {
    const setting = Settings.findOne({key: 'salesRecord'});
    if (!setting) {
      Settings.insert({
        key: 'salesRecord',
        show: [
          'name',
          'productionStartDate',
          'actualDeliveryDate',
          'shippingMode',
        ]
      })
    }
  },

  getVisibleProjectFields() {
    const {show}  = Settings.findOne({key: 'salesRecord'});
    return show;
  },

  updateVisibleProjectFields(visibleFields) {
    if (!this.userId) return;
    check(visibleFields, [String]);
    Settings.update({key: 'salesRecord'}, {
      $set: {
        show: visibleFields,
      }
    });
  },

  updateProjectProperty(salesRecordId, property) {
    check(salesRecordId, String);
    check(property, {
      key: String,
      value: Match.OneOf(String, Date)
    });
    const {key, value} = property;

    // current user belongs to ADMIN LIST
    const isAdmin = Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST);

    // current user belongs to salesRecords
    const salesRecord = SalesRecords.findOne(salesRecordId);
    if (!salesRecord) throw new Meteor.Error('Project does not exists');
    const isMember = !!salesRecord.members.find(({userId}) => userId === this.userId);

    // check permission
    if (!isMember && !isAdmin) throw new Meteor.Error('Access denied');

    return SalesRecords.update(salesRecordId, {
      $set: {
        [key]: value,
      }
    });
  },

  addMemberToProject(salesRecordId, member){
    check(salesRecordId, String);
    check(member, {
      userId: String,
      isMainStakeholder: Boolean,
      destination: Match.OneOf(String, null),
      category: Match.OneOf([String], [])
    });

    if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error("Access denied");

    SalesRecords.update(salesRecordId, {$push: {members: member}});
  },

  addUserToSlackChannel(userId, channel){
    check(userId, String);
    check(channel, String);

    const user = Meteor.users.findOne({_id: userId, slack: {$exists: true}});

    if (!user) throw new Meteor.Error("User don`t integrate with slack");

    const res = HTTP.post('https://slack.com/api/channels.invite', {
      params: {
        token: SLACK_API_KEY,
        channel,
        user: user.slack.id
      }
    });
    if (!res.data.ok) {
      if (res.data.error === "already_in_channel") throw new Meteor.Error("User already in channel");
    }
    return res;
  },

  updateUserInfo(user){
    if (user.userId !== this.userId && !Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST))
      throw new Meteor.Error("Access denied");

    Meteor.users.update({_id: user.userId}, {
      $set: {
        username: user.username,
        "profile.firstName": user.firstName,
        "profile.lastName": user.lastName,
        "profile.twitter": user.twitter,
        "profile.facebook": user.facebook,
        "profile.linkedIn": user.linkedIn,
        "profile.companyName": user.companyName,
        "profile.companyPosition": user.companyPosition
      }
    })
  },

  postSlackMessage(channel, message){
    HTTP.post('https://slack.com/api/chat.postMessage', {
      params: {
        token: SLACK_API_KEY,
        channel: channel,
        text: message
      }
    })
  },

  sendEmail(mailData) {
    Match.test(mailData, {
      to: Match.OneOf(String, [String]),
      from: String,
      replyTo: String,
      subject: String,
      attachments: Match.Maybe([String]),
      html: String,
    });
    this.unblock();

    if (_.isArray(mailData.attachments) && mailData.attachments.length) {
      mailData.attachments = Files.find({_id: {$in: mailData.attachments}}).fetch().map(item => {
        return {
          fileName: item.original.name,
          filePath: `${Meteor.absoluteUrl(`cfs/files/files/${item._id}/${item.original.name}`)}`
        }
      });
    }

    Email.send(mailData);
    return "Message is sending";
  },

  createMassage(msgData, files){
    //todo refactor add checking args
    const author = Meteor.users.findOne({_id: this.userId}, {fields: {services: 0}});
    msgData.author = author;
    Messages.insert(msgData, (err, messageId) => {
      if (err) throw new Meteor.Error(err);

      if (files && files.length) {
        files.forEach(item => {
          item.messageId = messageId;
          Files.insert(item);
        });
      }
    });
  },

  adminCreateUser(data){
    if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error("Access denied");
    if (Accounts.findUserByEmail(data.email) || CreatedUsers.findOne({email: data.email}))
      throw new Meteor.Error('validEmail', `Email "${data.email}" is already exist`);
    if (Accounts.findUserByUsername(data.username) || CreatedUsers.findOne({username: data.username}))
      throw new Meteor.Error('validUsername', `"${data.username}" is already exist`);

    data.createBy = this.userId;
    data.createAt = new Date();
    data.isActive = false;
    CreatedUsers.insert(data);
  },

  adminEditUser(updatedUserInfo, unicFields){
    if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error("Access denied");
    if (unicFields.newEmail) {
      if (Accounts.findUserByEmail(updatedUserInfo.email) || CreatedUsers.findOne({email: updatedUserInfo.email}))
        throw new Meteor.Error('validEmail', `Email "${updatedUserInfo.email}" is already exist`);
    }
    if (unicFields.newUsername) {
      if (Accounts.findUserByUsername(updatedUserInfo.username) || CreatedUsers.findOne({username: updatedUserInfo.username}))
        throw new Meteor.Error('validUsername', `"${updatedUserInfo.username}" is already exist`);
    }
    CreatedUsers.update({_id: updatedUserInfo._id}, {$set: updatedUserInfo}, (err) => {
      if (err) {
        throw new Meteor.Error(err)
      }
    });
  },

  adminRemoveUser(userId){
    if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error("Access denied");
    CreatedUsers.remove(userId);
  },

  checkCreatedAccount(email){
    return CreatedUsers.find({email}).count();
  },

  initCreatedUser(email, password){
    const createdUser = CreatedUsers.findOne({email, isActive: false});

    const userId = Accounts.createUser({
      username: createdUser.username,
      email,
      password,
      profile: {
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        role: [
          {role: 'user'}
        ]
      }
    });
    Roles.addUsersToRoles(userId, [createdUser.role]);
    CreatedUsers.update({_id: createdUser._id}, {$set: {isActive: true}});
    return userId;
  },

  updateProjectShipping(salesRecordId, shipping) {
    check(salesRecordId, String);
    check(shipping, {
      shippingContactPhone: Match.Maybe(Match.phone),
      shippingContactName: Match.Maybe(String),
      shippingContactEmail: Match.Maybe(String),
      shippingAddress: Match.Maybe(String),
      shippingNotes: Match.Maybe(String),
    });
    // current user belongs to ADMIN LIST
    const isAdmin = Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST);

    // current user belongs to salesRecords
    const salesRecord = SalesRecords.findOne(salesRecordId);
    if (!salesRecord) throw new Meteor.Error('Project does not exists');
    const isMember = !!salesRecord.members.find(({userId}) => userId === this.userId);

    // check permission
    if (!isMember && !isAdmin) throw new Meteor.Error('Access denied');

    return SalesRecords.update(salesRecordId, {
      $set: shipping,
    });
  },

  updateProjectBilling(salesRecordId, billing) {
    check(salesRecordId, String);
    check(billing, {
      billingContactPhone: Match.Maybe(Match.phone),
      billingContactName: Match.Maybe(String),
      billingContactEmail: Match.Maybe(String),
      billingAddress: Match.Maybe(String),
      billingNotes: Match.Maybe(String),
    });
    // current user belongs to ADMIN LIST
    const isAdmin = Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST);

    // current user belongs to salesRecords
    const salesRecord = SalesRecords.findOne(salesRecordId);
    if (!salesRecord) throw new Meteor.Error('Project does not exists');
    const isMember = !!salesRecord.members.find(({userId}) => userId === this.userId);

    // check permission
    if (!isMember && !isAdmin) throw new Meteor.Error('Access denied');
    return SalesRecords.update(salesRecordId, {
      $set: billing,
    });
  },

  updateProjectAttributes(salesRecordId, attributes) {
    check(salesRecordId, String);
    check(attributes, {
      shippingMode: String,
      actualDeliveryDate: Date,
      productionStartDate: Date,
      supplier: Match.Maybe(String),
      shipper: Match.Maybe(String),
    })

    // current user belongs to ADMIN LIST
    const isAdmin = Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST);

    // current user belongs to salesRecords
    const salesRecord = SalesRecords.findOne(salesRecordId);
    if (!salesRecord) throw new Meteor.Error('Project does not exists');
    const isMember = !!salesRecord.members.find(({userId}) => userId === this.userId);

    // check permission
    if (!isMember && !isAdmin) throw new Meteor.Error('Access denied');

    return SalesRecords.update(salesRecordId, {
      $set: attributes,
    });
  },

  addMemberToProject(salesRecordId, member){
    check(salesRecordId, String);
    check(member, {
      userId: String,
      isMainStakeholder: Boolean,
      destination: Match.OneOf(String, null),
      category: Match.OneOf([String], [])
    });

    if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error("Access denied");

    SalesRecords.update(salesRecordId, {$push: {members: member}});
  },

  addUserToSlackChannel(userId, channel){
    check(userId, String);
    check(channel, String);

    const user = Meteor.users.findOne({_id: userId, slack: {$exists: true}});

    if (!user) throw new Meteor.Error("User don`t integrate with slack");

    const res = HTTP.post('https://slack.com/api/channels.invite', {
      params: {
        token: SLACK_API_KEY,
        channel,
        user: user.slack.id
      }
    });
    if (!res.data.ok) {
      if (res.data.error === "already_in_channel") throw new Meteor.Error("User already in channel");
    }
    return res;
  },

  updateUserInfo(user){
    if (user.userId !== this.userId && !Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST))
      throw new Meteor.Error("Access denied");

    Meteor.users.update({_id: user.userId}, {
      $set: {
        username: user.username,
        "profile.firstName": user.firstName,
        "profile.lastName": user.lastName,
        "profile.twitter": user.twitter,
        "profile.facebook": user.facebook,
        "profile.linkedIn": user.linkedIn,
        "profile.companyName": user.companyName,
        "profile.companyPosition": user.companyPosition
      }
    })
  },

  addProject(data){
    if (!Roles.userIsInRole(this.userId, [EMPLOYEE_ROLE, ...ADMIN_ROLE_LIST])) {
      throw new Meteor.Error("Access denied");
    }
    check(data, {
      name: String,
      shippingMode: String,
      members: [{
        userId: String,
        isMainStakeholder: Boolean,
        destination: String,
        category: [String]
      }],
      actualDeliveryDate: Date,
      productionStartDate: Date,
      estDeliveryRange: [Date],

      shippingContactPhone: Match.Maybe(Match.phone),
      shippingContactName: Match.Maybe(String),
      shippingContactEmail: Match.Maybe(String),
      shippingAddress: Match.Maybe(String),
      shippingNotes: Match.Maybe(String),

      billingContactPhone: Match.Maybe(Match.phone),
      billingContactName: Match.Maybe(String),
      billingContactEmail: Match.Maybe(String),
      billingAddress: Match.Maybe(String),
      billingNotes: Match.Maybe(String),

      estProductionTime: Match.Maybe(Number),
      actProductionTime: Match.Maybe(Number),
      supplier: Match.Maybe(String),
      shipper: Match.Maybe(String),
      stage: Match.Maybe(String),
    });

    let responseCreateChannel = HTTP.post('https://slack.com/api/channels.create', {
      params: {
        token: SLACK_API_KEY,
        name: data.name
      }
    });

    if (!responseCreateChannel.data.ok) {
      if (responseCreateChannel.data.error = 'name_taken') {
        throw new Meteor.Error(`Cannot create slack channel with name ${data.name}`);
      }
      throw new Meteor.Error(`Some problems with created slack channel! Sorry try later`);
    }


    data.slackChanel = responseCreateChannel.data.channel.id;

    const responseInviteBot = HTTP.post('https://slack.com/api/channels.invite', {
      params: {
        token: SLACK_API_KEY,
        channel: responseCreateChannel.data.channel.id,
        user: SLACK_BOT_ID
      }
    });

    if (!responseInviteBot.data.ok) throw new Meteor.Error("Bot cannot add to channel");

    Meteor.users.find({_id: {$in: data.members.map(item => item.userId)}, slack: {$exists: true}})
      .forEach(user => {
        HTTP.post('https://slack.com/api/channels.invite', {
          params: {
            token: SLACK_API_KEY,
            channel: responseCreateChannel.data.channel.id,
            user: user.slack.id
          }
        })
      });

    return SalesRecords.insert(data);
  },

  postSlackMessage(channel, message){
    HTTP.post('https://slack.com/api/chat.postMessage', {
      params: {
        token: SLACK_API_KEY,
        channel: channel,
        text: message
      }
    })
  },

  parseSlackMessage(data){
    data.createAt = new Date();
    switch (data.subtype) {
      case 'file_share':
        Meteor.call("addSlackFileMsg", data);
        break;
      default:
        SlackMessages.insert(data)
    }
  },

  addSlackFileMsg(data){
    if (!data.file && !data.file.id) return;

    data.publicLink = Meteor.call("getPublicPermalink", data.file.id);
    SlackMessages.insert(data);
  },

  getPublicPermalink(fileId){
    check(fileId, String);

    const response = HTTP.get('https://slack.com/api/files.sharedPublicURL', {
      params: {
        token: SLACK_API_KEY,
        file: fileId
      }
    });

    if (!response.data.ok) return;
    console.log(response);

    const file = HTTP.get(response.data.file.url_private_download, {params: {token: SLACK_API_KEY}});

    console.log(file)

    return response.data.file.permalink_public;
  },

  getSlackUsers(){
    HTTP.get('https://slack.com/api/users.list', {
      params: {
        token: SLACK_API_KEY,
      }
    }, requestCb);

    function requestCb(err, res) {
      if (err || !res.data.ok) return;
      const {members} = res.data;
      members.length && members.forEach(item => {
        if (!SlackUsers.findOne({id: item.id})) {
          SlackUsers.insert(item);
        }
      })
    }
  },

  updateUserProfileField(field, data){
    check(field, String);
    check(data, Match.OneOf(String, Number));

    if (!Roles.userIsInRole(this.userId, [ADMIN_ROLE, SUPER_ADMIN_ROLE, EMPLOYEE_ROLE])) {
      throw new Meteor.Error("Access denied");
    }
    Meteor.users.update({_id: this.userId}, {
      $set: {
        [`profile.${field}`]: data
      }
    })
  },

  addNewQuote(data){
    if (!Roles.userIsInRole(this.userId, [ADMIN_ROLE, SUPER_ADMIN_ROLE, EMPLOYEE_ROLE])) {
      throw new Meteor.Error("Access denied");
    }

    data.createBy = this.userId;

    Quotes.insert(data);
  },

  addQuoteRevision(data){
    check(data, {
      revisionNumber: Number,
      quoteId: String,
      totalPrice: Number,
      createBy: String,
      createAt: Date,
      fileName: String,
      fileId: String
    });
    if (!Roles.userIsInRole(this.userId, [ADMIN_ROLE, SUPER_ADMIN_ROLE, EMPLOYEE_ROLE])) {
      throw new Meteor.Error("Access denied");
    }

    const quoteId = data.quoteId;
    delete data.quoteId;

    Quotes.update(quoteId, {
      $push: {
        revisions: data
      }
    })
  },

  updateQuoteRevision(data){
    check(data, {
      revisionNumber: Number,
      quoteId: String,
      totalPrice: Number,
      updateBy: String,
      updateAt: Date,
      fileName: String,
      fileId: String
    });
    if (!Roles.userIsInRole(this.userId, [ADMIN_ROLE, SUPER_ADMIN_ROLE, EMPLOYEE_ROLE])) {
      throw new Meteor.Error("Access denied");
    }
    let oldFileId;

    const quote = Quotes.findOne(data.quoteId);

    const revisions = quote.revisions.map(revision => {
      if (revision.revisionNumber === data.revisionNumber) {
        oldFileId = revision.fileId;

        revision.totalPrice = data.totalPrice;
        revision.updateBy = data.updateBy;
        revision.updateAt = data.updateAt;
        revision.fileName = data.fileName;
        revision.fileId = data.fileId;
      }
      return revision;
    });

    Quotes.update(quote._id, {$set: {revisions}});
    Files.remove(oldFileId);
  },

  editQuoteName(quoteId, name){
    check(quoteId, String);
    check(name, String);
    if (!Roles.userIsInRole(this.userId, [ADMIN_ROLE, SUPER_ADMIN_ROLE, EMPLOYEE_ROLE])) {
      throw new Meteor.Error("Access denied");
    }

    Quotes.update({_id: quoteId}, {
      $set: {name}
    });
  },

  updateUserConversationGroups(group, membersId){
    check(group, String);
    check(membersId, [String]);

    const profile = Meteor.users.findOne({_id: this.userId}).profile;
    if (profile.conversationGroups && profile.conversationGroups.length) {
      const updateGroups = profile.conversationGroups.map(item => {
        if (item.name === group) {
          return {
            name: group,
            members: membersId
          }
        } else {
          return item;
        }
      });
      Meteor.users.update({_id: this.userId}, {
        $set: {
          'profile.conversationGroups': updateGroups
        }
      })
    } else {
      Meteor.users.update({_id: this.userId}, {
        $set: {
          "profile.conversationGroups": [{
            name: group,
            members: membersId
          }]
        }
      })
    }
  },

  getTwilioToken() {
    const twilio = require('twilio')
    const config = require('../config/config')

    let capability = new twilio.Capability(
      config.twilio.accountSid,
      config.twilio.authToken
    );
    capability.allowClientOutgoing(config.twilio.appSid);
    let token = capability.generate();

    return token;
  }
});

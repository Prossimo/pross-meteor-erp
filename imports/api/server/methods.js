import _ from 'underscore';
import {Meteor} from 'meteor/meteor';
import  {HTTP} from 'meteor/http';
import {check, Match} from 'meteor/check';
import {
  Files,
  SlackUsers,
  Quotes,
  SlackMessages,
  Settings,
  Projects
} from '../models';
import {SlackMails, SalesRecords} from '../models'
import {
  EMPLOYEE_ROLE,
  ADMIN_ROLE,
  STAKEHOLDER_ROLE,
  VENDOR_ROLE,
  SHIPPER_ROLE,
  ADMIN_ROLE_LIST,
  SUPER_ADMIN_ROLE,
} from '../constants/roles';
import { prossDocDrive } from '../drive';


import '../lib/extendMatch.js';
import google from 'googleapis';
import config from '../config/config';
import '../models/nylasaccounts/methods';
import '../models/companies/methods';
import '../models/contacts/methods';
import '../models/salesRecords/methods';
import '../models/mailtemplates/methods';
import '../models/messages/methods';
import '../models/threads/methods';
import '../models/slackmails/methods';
import '../models/people/methods';
import { googleServerApiAutToken } from '../../api/server/functions';

const driveScopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.apps.readonly'
];
//googleServerApiAutToken is async but we need token to make req to google drive api
let syncGoogleServerApiAutToken = Meteor.wrapAsync(googleServerApiAutToken);
let googleToken =  syncGoogleServerApiAutToken(driveScopes);

const OAuth2Client = google.auth.OAuth2;
const oauth2Client = new OAuth2Client(
    config.google.clientDriveId,
    config.google.clientDriveSecret,
    config.google.redirectUri);

oauth2Client.setCredentials({
    access_token: googleToken
});

const googleDrive = google.drive({ version: 'v3', auth: oauth2Client });

const SLACK_API_ROOT = config.slack.apiRoot;
const SLACK_API_KEY = config.slack.apiKey;
const SLACK_BOT_ID = config.slack.botId;
const SLACK_BOT_TOKEN = config.slack.botToken;

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
      }
    });
    Roles.addUsersToRoles(userId, [EMPLOYEE_ROLE]);

    userData.validation = validation;

    if (userId) Meteor.call('initVisiableFields', userId);

    return userData;
  },

  initVisiableFields(userId) {
    const salesRecord = Settings.findOne({key: 'salesRecord', userId: userId});
    const newProject = Settings.findOne({key: 'newProject', userId: userId});
    if (!salesRecord) {
      Settings.insert({
        key: 'salesRecord',
        userId: userId,
        show: [
          'name',
          'productionStartDate',
          'actualDeliveryDate',
          'shippingMode',
        ]
      })
    }
    if (!newProject) {
      Settings.insert({
        userId: userId,
        key: 'newProject',
        show: [
          '_id',
          'name',
        ]
      })
    }
  },

  getVisibleFields(key) {
    check(key, String);
    const userId = this.userId;
    let setting  = Settings.findOne({ key, userId });
    if (!setting) {
      Meteor.call('initVisiableFields', userId);
      return Settings.findOne({key, userId}).show;
    } else

    return setting.show;
  },

  updateVisibleFields(key, visibleFields) {
    if (!this.userId) return;
    check(visibleFields, [String]);
    check(key, String);
    const userId = this.userId;
    Settings.update({ key, userId }, {
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

  updateNewProjectProperty(projectId, property) {
    check(projectId, String);
    check(property, {
      key: String,
      value: Match.OneOf(String, Date)
    });
    const {key, value} = property;

    // current user belongs to ADMIN LIST
    const isAdmin = Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST);

    // current user belongs to salesRecords
    const project = Projects.findOne(projectId);
    if (!project) throw new Meteor.Error('Project does not exists');
    const isMember = !!project.members.find(({userId}) => userId === this.userId);

    // check permission
    if (!isMember && !isAdmin) throw new Meteor.Error('Access denied');

    return Projects.update(projectId, {
      $set: {
        [key]: value,
      }
    });
  },

  addUserToSlackChannel(userId, channel){
    check(userId, String);
    check(channel, String);

    const user = Meteor.users.findOne({_id: userId, slack: {$exists: true}});

    if (!user) throw new Meteor.Error("User don`t integrate with slack");

    const res = HTTP.post(`${SLACK_API_ROOT}/channels.invite`, {
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

  adminCreateUser(user) {
    check(user, new SimpleSchema({
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      username: {
        type: String,
      },
      email: {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
      },
      role: {
        type: String,
        allowedValues: [
          EMPLOYEE_ROLE,
          ADMIN_ROLE,
          STAKEHOLDER_ROLE,
          VENDOR_ROLE,
          SHIPPER_ROLE,
        ]
      }
    }));
    if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error('Access denied');
    const { email, username, firstName, lastName, role } = user;
    if (Accounts.findUserByEmail(email))
      throw new Meteor.Error('validEmail', `Email "${email}" is already exist`);
    if (Accounts.findUserByUsername(username))
      throw new Meteor.Error('validUsername', `"${username}" is already exist`);

    const createdUserId = Accounts.createUser({
      username,
      email,
      profile: {
        firstName,
        lastName,
      }
    });

    Meteor.users.update(createdUserId, {
      $set: {
        createdBy: this.userId,
        roles: [role],
      }
    })

    if (userId) Meteor.call('initVisiableFields', userId);

    Meteor.defer(()=> Accounts.sendEnrollmentEmail(createdUserId));
    return createdUserId;
  },

  adminEditUser(userId, userFields){
    check(userId, String);
    check(userFields, {
      firstName: String,
      lastName: String,
      role: String,
    })
    if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error('Access denied');
    if (Roles.userIsInRole(this.userId), ADMIN_ROLE && role === SUPER_ADMIN_ROLE) throw new Meteor.Error('Can not set current user as super admin');
    const { firstName, lastName, role } = userFields;
    Meteor.users.update(userId, {
      $set: {
        'profile.firstName': firstName,
        'profile.lastName': lastName,
        'roles.0': role,
      }
    })
  },

  adminRemoveUser(userIds) {
    check(userIds, [String]);
    if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error('Access denied');
    // can not remove super admin role
    const removeIds = userIds.filter((userId)=> !Roles.userIsInRole(userId, [SUPER_ADMIN_ROLE]));
    Meteor.users.remove({ _id: { $in: removeIds } });
    if (removeIds.length != userIds.length) {
      throw new Meteor.Error('Can not remove super admin account');
    }
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
    shipping.modifiedAt = new Date();
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
    billing.modifiedAt = new Date();
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
      estDeliveryRange: [Date],
      supplier: Match.Maybe(String),
      shipper: Match.Maybe(String),
      estProductionTime: Match.Maybe(Number),
      actProductionTime: Match.Maybe(Number),
    })

    // current user belongs to ADMIN LIST
    const isAdmin = Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST);

    // current user belongs to salesRecords
    const salesRecord = SalesRecords.findOne(salesRecordId);
    if (!salesRecord) throw new Meteor.Error('Project does not exists');
    const isMember = !!salesRecord.members.find(({userId}) => userId === this.userId);

    // check permission
    if (!isMember && !isAdmin) throw new Meteor.Error('Access denied');
    attributes.modifiedAt = new Date();
    return SalesRecords.update(salesRecordId, {
      $set: attributes,
    });
  },

  addStakeholderToSalesRecord(salesRecordId, stakeholder) {
    check(salesRecordId, String);
    check(stakeholder, {
      contactId: String,
      destination: Match.OneOf(String, null),
      category: Match.OneOf([String], []),
      notify: Boolean,
    });
    if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error('Access Denined');
    stakeholder.isMainStakeholder = false;
    SalesRecords.update(salesRecordId, {$push: { stakeholders: stakeholder }});
  },

  addMemberToProject(salesRecordId, member){
    check(salesRecordId, String);
    check(member, {
      userId: String,
      isMainStakeholder: Boolean,
      category: Match.OneOf([String], [])
    });

    if (!Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) throw new Meteor.Error("Access denied");

    SalesRecords.update(salesRecordId, {$push: {members: member}});
    // allow edit folder
    const user = Meteor.users.findOne(member.userId);
    if (user && user.emails && user.emails.length > 0) {
      const email = user.emails[0].address;
      if (email) {
        const salesRecord = SalesRecords.findOne(salesRecordId);
        if (salesRecord && salesRecord.folderId) {
          prossDocDrive.shareWith.call({ fileId: salesRecord.folderId, email });
        }
      }
    }
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
    HTTP.post(`${SLACK_API_ROOT}/chat.postMessage`, {
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

  sendMailToSlack(message, threadId, salesRecordId) {
      const salesRecord = SalesRecords.findOne({_id:salesRecordId})

      let threadable = false
      let slackChannelId = salesRecord ? salesRecord.slackChanel : null

      if(!slackChannelId) {
          const channelsListRes = HTTP.get(`${SLACK_API_ROOT}/channels.list`, {
              params: {
                  token: SLACK_API_KEY,
              }
          })

          if(channelsListRes.statusCode!=200 || !channelsListRes.data.ok || !channelsListRes.data.channels) throw new Meteor.Error('Could not get slack channel')

          const channels = channelsListRes.data.channels
          let inboxChannel = _.find(channels, {name:'inbox'})
          if(!inboxChannel) {
              const channelsCreateRes = HTTP.post(`${SLACK_API_ROOT}/channels.create`, {
                params: {
                  token: SLACK_API_KEY,
                  name: 'inbox',
                  validate: true
                }
              })
              if(channelsCreateRes.statusCode!=200 || !channelsCreateRes.data.ok) throw new Meteor.Error('Could not create inbox slack channel')
              slackChannelId = channelsCreateRes.data.channel.id
          } else {
            slackChannelId = inboxChannel.id
          }
          threadable = true
      }

      if(!slackChannelId) throw new Meteor.Error('Could not find slack channel for inbox')

      let thread_ts = null
      if(threadId) {
          const slackMail = SlackMails.findOne({thread_id: threadId})
          if(slackMail) thread_ts = slackMail.thread_ts
      }

      const { getSlackUsername, getAvatarUrl } = require('../lib/filters')


      const from = message.from[0].email
      let to = []
      message.to.forEach((c)=>{to.push(c.email)})
      message.cc.forEach((c)=>{to.push(c.email)})
      message.bcc.forEach((c)=>{to.push(c.email)})
      const slackText = `An email was sent from ${message.from[0].email} to ${to.join(', ')}`;

      const slackify = require('slackify-html')
      const text = slackify(message.body)
      const params = {
          username: "prossimobot",//getSlackUsername(Meteor.user()),
          //icon_url: getAvatarUrl(Meteor.user()),
          attachments: [
              {
                  "fallback": message.snippet,
                  "color": "#36a64f",
                  //"pretext": "Optional text that appears above the attachment block",
                  //"author_name": "Bobby Tables",
                  //"author_link": "http://flickr.com/bobby/",
                  //"author_icon": "http://flickr.com/icons/bobby.jpg",
                  "title": message.subject,
                  //"title_link": "https://api.slack.com/",
                  "text": text,
                  // "fields": [
                  //     {
                  //         "title": "Priority",
                  //         "value": "High",
                  //         "short": false
                  //     }
                  // ],
                  "image_url": "http://my-website.com/path/to/image.jpg",
                  "thumb_url": "http://example.com/path/to/thumb.png",
                  "footer": "Prossimo CRM",
                  "footer_icon": "https://platform.slack-edge.com/img/default_application_icon.png",
                  "ts": new Date().getTime()/1000
              }
          ],
          as_user: false
      };
      if(threadable && thread_ts) params.thread_ts = thread_ts


      return Meteor.call('sendBotMessage', slackChannelId, slackText, params)
  },
  getPublicPermalink(fileId){
    check(fileId, String);

    const response = HTTP.get(`${SLACK_API_ROOT}/files.sharedPublicURL`, {
      params: {
        token: SLACK_API_KEY,
        file: fileId
      }
    });

    if (!response.data.ok) return;
    //console.log(response);

    const file = HTTP.get(response.data.file.url_private_download, {params: {token: SLACK_API_KEY}});

    //console.log(file)

    return response.data.file.permalink_public;
  },

  getSlackUsers(){
    HTTP.get(`${SLACK_API_ROOT}/users.list`, {
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
    const twilio = require('twilio');
    const config = require('../config/config');

    let capability = new twilio.Capability(
      config.twilio.accountSid,
      config.twilio.authToken
    );
    capability.allowClientOutgoing(config.twilio.appSid);
    let token = capability.generate();

    return token;
  },

  removeProject({ _id, isRemoveFolders, isRemoveSlack }) {
    check({
      _id,
      isRemoveFolders,
      isRemoveSlack,
    }, new SimpleSchema({
      _id: { type: String },
      isRemoveFolders: { type: Boolean },
      isRemoveSlack: { type: Boolean },
    }));

    if (Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) {
      const project = Projects.findOne(_id);
      if (project) {
        const { _id, folderId, slackChanel } = project;
        // Remove Project
        Projects.remove(_id);
        Meteor.defer(()=> {
          // Remove folder
          isRemoveFolders && prossDocDrive.removeFiles.call({ fileId: folderId });
          // Remove slack channel
          isRemoveSlack && HTTP.post(`${SLACK_API_ROOT}/channels.archive`, {
            params: {
              token: SLACK_API_KEY,
              channel: slackChanel,
            },
          });
        });
      }
    }
  },

  createNewProject(project) {
    if (!Roles.userIsInRole(this.userId, [EMPLOYEE_ROLE, ...ADMIN_ROLE_LIST])) {
      throw new Meteor.Error('Access denied');
    }
    check(project, {
      name: String,
      members: [{
        userId: String,
        isAdmin: Boolean,
      }],
    });
    const projectId = Projects.insert(project);
    Meteor.defer(()=> {
      prossDocDrive.createProjectFolder.call({ name: project.name, projectId });
    });
    return projectId;
  },

  async getDriveFileList() {
      const drive = google.drive('v3');
      const driveScopes = [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file',
          'https://www.googleapis.com/auth/drive.appdata',
          'https://www.googleapis.com/auth/drive.apps.readonly'
      ];

      const OAuth2Client = google.auth.OAuth2;
      const oauth2Client = new OAuth2Client(
          config.google.clientDriveId,
          config.google.clientDriveSecret,
          config.google.redirectUri);

      //googleServerApiAutToken is async but we need token to make req to google drive api
      let syncGoogleServerApiAutToken = Meteor.wrapAsync(googleServerApiAutToken);
      let googleToken =  syncGoogleServerApiAutToken(driveScopes);

      oauth2Client.setCredentials({
          access_token: googleToken
      });

      // Create the promise so we can use await later.
      const driveFileListPromise = new Promise((resolve, reject) => {
          googleDrive.files.list({
              auth: oauth2Client,
              pageSize: 10,
              fields: "nextPageToken, files"
              // fields: "nextPageToken, files(id, name)"
          }, (err, response) => {
              if (err) {
                  return reject(err);
              }
              resolve(response);
          });
      });

      // return promise result to React method
      try {
          return await driveFileListPromise;
      } catch (err) {
          console.log(`ERROR: ${err.message}`);
          throw err;
      }
  },

  async saveGoogleDriveFile(fileInfo, fileData) {
      // Create the promise so we can use await later.
      const driveFileListPromise = new Promise((resolve, reject) => {
          googleDrive.files.create({
              resource: {
                  name: fileInfo.name,
                  mimeType: fileInfo.type
              },
              media: {
                  mimeType: fileInfo.type,
                  body: fileData
              }
          }, (err, response) => {
              if (err) {
                  return reject(err);
              }
              resolve(response);
          });
      });

      // return promise result to React method
      try {
          return await driveFileListPromise;
      } catch (err) {
          console.log(`ERROR: ${err.message}`);
          throw err;
      }
  }
});

import _ from 'underscore';
import  {HTTP} from 'meteor/http';
import SalesRecords from './salesRecords'
import {EMPLOYEE_ROLE, ADMIN_ROLE_LIST, ADMIN_ROLE, SUPER_ADMIN_ROLE} from '../../constants/roles';
import config from '../../config/config';
import Conversations from '../conversations/conversations'
import { createTodoistSalesRecord } from '../../tasks';


import {prossDocDrive} from '../../drive';

const SLACK_API_KEY = config.slack.SLACK_API_KEY;
const SLACK_BOT_ID = config.slack.SLACK_BOT_ID;

Meteor.methods({
    changeStageOfSalesRecord(salesRecordId, stage) {
      check(salesRecordId, String);
      check(stage, String);
      const salesRecord = SalesRecords.findOne({ _id: salesRecordId, 'members.userId': this.userId });
      if (salesRecord || Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) {
        SalesRecords.update(salesRecordId, {$set: { stage }});
      }
    },

    removeStakeholderFromSalesRecord(salesRecordId, contactId) {
      check(salesRecordId, String);
      check(contactId, String);

      if (Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) {
        return SalesRecords.update(salesRecordId, {$pull: { stakeholders: { contactId } }});
      }
    },

    removeMemberFromSalesRecord(salesRecordId, userId) {
      check(userId, String);
      check(salesRecordId, String);

      if (Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) {
        return SalesRecords.update(salesRecordId, {$pull: { members: { userId } }});
      }
    },
    // NOTICE: it must be saleRecord
    insertSalesRecord(data, conversations){
        if (!Roles.userIsInRole(this.userId, [EMPLOYEE_ROLE, ...ADMIN_ROLE_LIST])) {
            throw new Meteor.Error("Access denied");
        }
        check(data, {
            name: String,
            shippingMode: String,
            members: [{
                userId: String,
                destination: String,
                category: [String]
            }],
            stakeholders: [{
                contactId: String,
                destination: String,
                category: [String],
                isMainStakeholder: Boolean,
                notify: Boolean,
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
            stage: Match.Maybe(String)
        });

        let responseCreateChannel = HTTP.post('https://slack.com/api/channels.create', {
            params: {
                token: SLACK_API_KEY,
                name: data.name
            }
        });

        console.log("Create slack channel response", responseCreateChannel)
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
        const salesRecordId = SalesRecords.insert(data);

        // create folder in google drive
        prossDocDrive.createSalesRecordFolder.call({name: data.name, salesRecordId});

        // create todoist project
        createTodoistSalesRecord(data.name, salesRecordId);

        // Insert conversations attached
        console.log("Conversations to be attached", conversations)
        if(conversations && conversations.length) {
            conversations.forEach((conversation)=>{
                conversation.salesRecordId = salesRecordId
                Conversations.insert(conversation)
            })
        }

        HTTP.post('http://78.47.83.46:8000/api/login_check', {
            data: {
                "_username": "admin",
                "_password": "12345678"
            }
        }, function( error, response ) {

            if ( error ) {
                console.log( error );
            } else {
                //console.log( response);
                HTTP.post('http://78.47.83.46:8000/api/projects', {
                    data: {
                        "project": {
                            "client_name": data.name,
                            "client_phone": data.billingContactPhone,
                            "client_email": data.billingContactEmail,
                            "client_address": data.billingAddress,
                            "project_name": data.name,
                            "project_address": data.shippingAddress,
                            "files": [],
                            "quote_date": data.productionStartDate,

                        }
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + response.token
                    }
                }, function( err, result ) {
                    if ( err ) {
                        console.log( err );
                    } else {
                        //console.log( result);
                    }
                });
            }
        });
        return salesRecordId;
    },
});

import _ from 'underscore';
import  {HTTP} from 'meteor/http';
import SalesRecords from './salesRecords'
import {EMPLOYEE_ROLE, ADMIN_ROLE_LIST, ADMIN_ROLE, SUPER_ADMIN_ROLE} from '../../constants/roles';
import config from '../../config/config';
import Messages from '../messages/messages'


import {prossDocDrive} from '../../drive';

const SLACK_API_KEY = config.slack.SLACK_API_KEY;
const SLACK_BOT_ID = config.slack.SLACK_BOT_ID;

Meteor.methods({
    // NOTICE: it must be saleRecord
    insertSalesRecord(data, messages){
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

        // Insert conversations attached
        console.log("Messages to be attached", messages)
        if(messages && messages.length) {
            messages.forEach((message)=>{
                message.salesRecordId = salesRecordId
                Messages.insert(message)
            })
        }
        return salesRecordId;
    },
});
import _ from 'underscore'
import {Roles} from 'meteor/alanning:roles'
import {HTTP} from 'meteor/http'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import queryString from 'query-string'
import { slackClient } from '/imports/api/slack'
import NylasAPI from '../../nylas/nylas-api'
import {SalesRecords, Threads, Messages, ROLES, Conversations} from '../index'
import {prossDocDrive} from '../../drive'
import {getSubStages} from '../../lib/filters.js'

import config from '../../config'

const bound = Meteor.bindEnvironment((callback) => callback())
Meteor.methods({
    removeSalesRecord({_id, isRemoveSlack, isRemoveFolders}) {
        new SimpleSchema({
            _id: String,
            isRemoveSlack: Boolean,
            isRemoveFolders: Boolean,
        }).validate({_id, isRemoveSlack, isRemoveFolders})
        if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
            const salesRecord = SalesRecords.findOne(_id)
            if (salesRecord) {
                const {_id, folderId, slackChanel} = salesRecord
                // Remove salesrecord
                SalesRecords.remove(_id)
                Meteor.defer(() => {
                    // Remove folder
                    isRemoveFolders && prossDocDrive.removeFiles.call({fileId: folderId})
                    // Remove slack channel
                    isRemoveSlack && slackClient.channels.archive({ channel: slackChanel })
                })
            }
        }
    },

    changeStageOfSalesRecord(salesRecordId, stage) {
        check(salesRecordId, String)
        check(stage, String)
        const salesRecord = SalesRecords.findOne({_id: salesRecordId, 'members': this.userId})
        if (salesRecord || Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
            const subStage = getSubStages(stage, {gettingFirstStage: true})
            SalesRecords.update(salesRecordId, {$set: {stage, subStage}})
        }
    },

    changeSubStageOfSalesRecord(salesRecordId, subStage) {
        check(salesRecordId, String)
        check(subStage, String)
        const salesRecord = SalesRecords.findOne({_id: salesRecordId, 'members': this.userId})
        if (salesRecord || Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
            SalesRecords.update(salesRecordId, {$set: {subStage}})
        }
    },

    addStakeholderToSalesRecord({_id, peopleId, addToMain}) {
        check(_id, String)
        check(peopleId, String)
        check(addToMain, Boolean)
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Access Denined')

        const salesRecord = SalesRecords.findOne(_id)
        if(!salesRecord) throw new Meteor.Error(`Could not found SalesRecord with _id:${_id}`)

        const stakeholder = {
            peopleId,
            isMainStakeholder: false
        }
        SalesRecords.update(_id, {$push: {stakeholders: stakeholder}})
        if(addToMain) {
            const mainConversationId = salesRecord.conversationIds[0]
            Conversations.update(mainConversationId, {$push:{participants:{peopleId}}})
        }
    },

    removeStakeholderFromSalesRecord(salesRecordId, peopleId) {
        check(salesRecordId, String)
        check(peopleId, String)

        if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
            return SalesRecords.update(salesRecordId, {$pull: {stakeholders: {peopleId}}})
        }
    },

    removeMemberFromSalesRecord(salesRecordId, userId) {
        check(userId, String)
        check(salesRecordId, String)

        if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
            return SalesRecords.update(salesRecordId, {$pull: {members: userId}})
        }
    },
    // NOTICE: it must be saleRecord
    insertSalesRecord({data, thread}){
        if (!this.userId) {
            throw new Meteor.Error('No authorized')
        }
        check(data, {
            name: String,
            shippingMode: String,
            members: [String],
            stakeholders: [{
                isMainStakeholder: Boolean,
                addToMain: Boolean,
                peopleId: String,
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
            subStage: Match.Maybe(String),
        })

        check(thread, Match.Maybe(Object))

        let responseCreateChannel = slackClient.channels.create({ name: `d-${data.name}` })
        //console.log("Create slack channel response", responseCreateChannel)
        if (!responseCreateChannel.data.ok) {
            // RETRY WITH UNIQUE NAME
            responseCreateChannel = slackClient.channels.create({ name: `d-${data.name}-${Random.id()}` })
            if (!responseCreateChannel.data.ok) {
                throw new Meteor.Error('Some problems with created slack channel! Sorry try later')
            }
        }


        data.slackChanel = responseCreateChannel.data.channel.id
        data.slackChannelName = responseCreateChannel.data.channel.name

        const responseInviteBot = slackClient.channels.inviteBot({
          channel: responseCreateChannel.data.channel.id,
        })

        if (!responseInviteBot.data.ok) throw new Meteor.Error('Bot cannot add to channel')

        Meteor.users.find({_id: {$in: data.members}, slack: {$exists: true}})
            .forEach(user => slackClient.channels.invite({
              channel: responseCreateChannel.data.channel.id,
              user: user.slack.id,
            }))


        const salesRecordId = SalesRecords.insert(data)

        // set channel purpose
        slackClient.channels.setPurpose({
          channel: data.slackChanel,
          purpose: Meteor.absoluteUrl(`salesrecord/${salesRecordId}`),
        })
        // create folder in google drive
        Meteor.defer(() => {
            prossDocDrive.createSalesRecordFolder.call({name: data.name, salesRecordId})
        })

        // Insert conversations attached
        if (thread) {
            console.log('thread to be attached', thread)
            thread.salesRecordId = salesRecordId
            Threads.insert(thread)

            const query = queryString.stringify({thread_id: thread.id})
            NylasAPI.makeRequest({
                path: `/messages?${query}`,
                method: 'GET',
                accountId: thread.account_id
            }).then((messages) => {
                if (messages && messages.length) {

                    bound(() => {
                        messages.forEach((message) => {
                            const existingMessage = Messages.findOne({id: message.id})
                            if (!existingMessage) {
                                Messages.insert(message)
                            } else {
                                Messages.update({_id: existingMessage._id}, {$set: message})
                            }
                        })
                    })
                }
            })
        }

        HTTP.post('http://78.47.83.46:8000/api/login_check', {
            data: {
                '_username': 'admin',
                '_password': '12345678'
            }
        }, (error, response) => {

            if (error) {
                console.log(error)
            } else {
                //console.log( response);
                HTTP.post('http://78.47.83.46:8000/api/projects', {
                    data: {
                        'project': {
                            'client_name': data.name,
                            'client_phone': data.billingContactPhone,
                            'client_email': data.billingContactEmail,
                            'client_address': data.billingAddress,
                            'project_name': data.name,
                            'project_address': data.shippingAddress,
                            'files': [],
                            'quote_date': data.productionStartDate,

                        }
                    },
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${  response.token}`
                    }
                }, (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        //console.log( result);
                    }
                })
            }
        })
        return salesRecordId
    },

    updateSalesRecord({_id, data, thread, conversationId}){
        if (!this.userId) {
            throw new Meteor.Error('No authorized')
        }
        check(_id, String)
        check(data, {
            name: String,
            shippingMode: String,
            members: [String],
            stakeholders: [{
                isMainStakeholder: Boolean,
                addToMain: Boolean,
                peopleId: String,
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
            subStage: Match.Maybe(String),
        })
        check(thread, Match.Maybe(Object))
        check(conversationId, Match.Maybe(String))

        const sr = SalesRecords.findOne(_id)
        if(!sr) throw new Meteor.Error(`Not found SR with _id:${_id}`)
        SalesRecords.update({_id}, {$set: data})


        // Insert conversations attached
        if (thread) {
            //console.log('thread to be attached', thread, `conversationId=${conversationId}`)
            if(conversationId && conversationId != -1) {
                thread.conversationId = conversationId
            } else {
                thread.salesRecordId = _id
            }
            const existingThreads = Threads.find({id: thread.id}).fetch()
            if (existingThreads && existingThreads.length) {
                Threads.update({id: thread.id}, {$set: thread})
            } else {
                Threads.insert(thread)
            }

            const query = queryString.stringify({thread_id: thread.id})
            NylasAPI.makeRequest({
                path: `/messages?${query}`,
                method: 'GET',
                accountId: thread.account_id
            }).then((messages) => {
                if (messages && messages.length) {

                    bound(() => {
                        messages.forEach((message) => {
                            const existingMessage = Messages.findOne({id: message.id})
                            if (!existingMessage) {
                                Messages.insert(message)
                            } else {
                                Messages.update({_id: existingMessage._id}, {$set: message})
                            }
                        })
                    })
                }
            })
        }

    },

    updateSalesRecordMembers(salesRecordId, members){
        check(salesRecordId, String)
        check(members, Array)

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Access denied')

        const salesRecord = SalesRecords.findOne(salesRecordId)
        if(!salesRecord) throw new Meteor.Error(`Not found SalesRecord with _id: ${salesRecordId}`)

        if(members && salesRecord.members && members.length == salesRecord.members.length && members.every(m => salesRecord.members.indexOf(m)>-1)) return

        if(members && members.length) {
            Meteor.users.find({
                _id: { $in: members.filter(mid => salesRecord.members.indexOf(mid)==-1) },
                slack: { $exists: true },
            }).forEach(
                ({ slack: { id } }) => {
                    const {data} = slackClient.channels.invite({ channel:salesRecord.slackChanel, user:id })
                    console.log(data)
                }
            )
        }

        SalesRecords.update(salesRecordId, {$set: {members}})

        // allow edit folder
        Meteor.defer(() => {
            _.each(members, (member) => {
                const user = Meteor.users.findOne(member)
                if (user && user.emails && user.emails.length > 0) {
                    const email = user.emails[0].address
                    if (email) {
                        const salesRecord = SalesRecords.findOne(salesRecordId)
                        if (salesRecord && salesRecord.folderId) {
                            prossDocDrive.shareWith.call({fileId: salesRecord.folderId, email})
                        }
                    }
                }
            })
        })
    },

    updateSalesRecordSlackChannel({_id, channel}) {
        check(_id, String)
        check(channel, Object) // slack channel object

        const slackChanel = channel.id
        const slackChannelName = channel.name
        const slackMembers = channel.members

        //if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Access denied')

        const salesRecord = SalesRecords.findOne(_id)
        if(!salesRecord) throw new Meteor.Error(`Not found SalesRecord with _id: ${_id}`)

        if(slackMembers.indexOf(config.slack.botId) == -1) {
            const responseInviteBot = slackClient.channels.inviteBot({
                channel: slackChanel,
            })

            if (!responseInviteBot.data.ok) {
                console.error(slackChanel, responseInviteBot.data)
                throw new Meteor.Error('Bot cannot add to channel')
            }
        }
        SalesRecords.update(_id, {$set:{slackChanel, slackChannelName}})
    },

    updateSalesRecordStatus(salesRecordId, status) {
        check(salesRecordId, String)
        check(status, {
            teamLead: Match.Maybe(String),
            bidDueDate: Match.Maybe(Date),
            priority: Match.Maybe(String),
            expectedRevenue: Match.Maybe(Number),
            totalSquareFootage: Match.Maybe(Number),
            probability: Match.Maybe(String),
            clientStatus: Match.Maybe(String),
            supplierStatus: Match.Maybe(String),
        })

        // current user belongs to ADMIN LIST
        const isAdmin = Roles.userIsInRole(this.userId, [ROLES.ADMIN])

        // current user belongs to salesRecords
        const salesRecord = SalesRecords.findOne(salesRecordId)
        if (!salesRecord) throw new Meteor.Error('Project does not exists')
        const isMember = !!salesRecord.members.find(userId => userId === this.userId)

        // check permission
        if (!isMember && !isAdmin) throw new Meteor.Error('Access denied')

        status.modifiedAt = new Date()
        return SalesRecords.update(salesRecordId, {
            $set: status,
        })
    },

})




export const pushConversationToSalesRecord = new ValidatedMethod({
    name: 'salesRecord.pushConversation',
    validate: new SimpleSchema({_id:SalesRecords.schema.schema('_id'), conversationId:Conversations.schema.schema('_id')}).validator({clean:true}),
    run({_id, conversationId}) {
        if(Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
            const sr = SalesRecords.findOne(_id)
            if(!sr) throw new Meteor.Error(`Could not found project with _id:${_id}`)

            SalesRecords.update(_id, {$push:{conversationIds:conversationId}})
        }
    }
})
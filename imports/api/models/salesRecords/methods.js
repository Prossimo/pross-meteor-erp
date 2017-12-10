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
import {ServerLog} from '/imports/utils/logger'

import config from '../../config'

const bound = Meteor.bindEnvironment((callback) => callback())

const validateSalesRecord = (_id) => {
    const salesRecord = SalesRecords.findOne(_id)
    if(!salesRecord) throw new Meteor.Error(`Not found salesRecord with _id: ${_id}`)

    return salesRecord
}

const validatePermission = (userId, salesRecord) => {
    if(!Roles.userIsInRole(userId, [ROLES.ADMIN, ROLES.SALES, ROLES.MANAGER]) && salesRecord && salesRecord.members.map(({userId}) => userId).indexOf(userId) === -1) {
        throw new Meteor.Error('Access Denied')
    }
}


Meteor.methods({
    removeSalesRecord({_id, isRemoveSlack, isRemoveFolders}) {
        new SimpleSchema({
            _id: String,
            isRemoveSlack: Boolean,
            isRemoveFolders: Boolean,
        }).validate({_id, isRemoveSlack, isRemoveFolders})

        const salesRecord = validateSalesRecord(_id)

        validatePermission(this.userId, salesRecord)

        const {folderId, slackChannel} = salesRecord
        // Remove salesrecord
        SalesRecords.remove(_id)
        Meteor.defer(() => {
            // Remove folder
            isRemoveFolders && prossDocDrive.removeFiles.call({fileId: folderId})
            // Remove slack channel
            isRemoveSlack && slackChannel && slackChannel.id && Meteor.call('archiveSlackChannel', slackChannel)
        })
    },

    changeStageOfSalesRecord(salesRecordId, stage) {
        check(salesRecordId, String)
        check(stage, String)
        const salesRecord = validateSalesRecord(salesRecordId)
        validatePermission(this.userId, salesRecord)

        const subStage = getSubStages(stage, {gettingFirstStage: true})

        const oldStage = salesRecord.stage
        SalesRecords.update(salesRecordId, {$set: {stage, subStage}})

        ServerLog.info(JSON.stringify({salesRecordId, statusName:'stage', oldValue:oldStage, newValue:stage}))
        Meteor.call('sendDealStatusChangeToSlack', {salesRecordId, statusName:'stage', oldValue:oldStage, newValue:stage})
    },

    changeSubStageOfSalesRecord(salesRecordId, subStage) {
        check(salesRecordId, String)
        check(subStage, String)

        const salesRecord = validateSalesRecord(salesRecordId)
        validatePermission(this.userId, salesRecord)

        const oldSubStage = salesRecord.subStage
        SalesRecords.update(salesRecordId, {$set: {subStage}})

        ServerLog.info(JSON.stringify({salesRecordId, statusName:'sub stage', oldValue:oldSubStage, newValue:subStage}))
        Meteor.call('sendDealStatusChangeToSlack', {salesRecordId, statusName:'sub stage', oldValue:oldSubStage, newValue:subStage})
    },

    addStakeholderToSalesRecord({_id, peopleId, addToMain}) {
        check(_id, String)
        check(peopleId, String)
        check(addToMain, Boolean)

        const salesRecord = validateSalesRecord(_id)

        validatePermission(this.userId, salesRecord)

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


        const salesRecord = validateSalesRecord(salesRecordId)
        validatePermission(this.userId, salesRecord)

        return SalesRecords.update(salesRecordId, {$pull: {stakeholders: {peopleId}}})
    },

    removeMemberFromSalesRecord(salesRecordId, userId) {
        check(userId, String)
        check(salesRecordId, String)

        const salesRecord = validateSalesRecord(salesRecordId)
        validatePermission(this.userId, salesRecord)

        return SalesRecords.update(salesRecordId, {$pull: {members: userId}})
    },
    // NOTICE: it must be saleRecord
    insertSalesRecord({data, thread, isPrivateSlackChannel}){
        if (!this.userId) {
            throw new Meteor.Error('No authorized')
        }
        check(data, {
            name: String,
            shippingMode: String,
            members: [String],
            stakeholders: [{
                isMainStakeholder: Boolean,
                addToMain: Match.Maybe(Boolean),
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
            subStage: Match.Maybe(String)
        })
        check(thread, Match.Maybe(Object))
        check(isPrivateSlackChannel, Match.Maybe(Boolean))

        const slackChannel = Meteor.call('createSlackChannel', {name: `d-${data.name}`, isPrivate:isPrivateSlackChannel})

        if(!slackChannel) throw new Meteor.Error('Can not create slack channel')

        data.slackChannel = slackChannel

        const responseInviteBot = Meteor.call('inviteBotToSlackChannel', slackChannel)
        if (!responseInviteBot.data.ok) throw new Meteor.Error('Bot cannot add to channel')

        Meteor.users.find({_id: {$in: data.members}, slack: {$exists: true}})
            .forEach(user => Meteor.call('inviteUserToSlackChannel', {...slackChannel, user:user.slack.id}))


        const mainConversationId = Conversations.insert({name:'Main', participants:data.stakeholders.filter(s => s.addToMain).map(({peopleId,isMainStakeholder}) => ({peopleId, isMain:isMainStakeholder}))})
        data.conversationIds = [mainConversationId]
        const salesRecordId = SalesRecords.insert(data)

        // create folder in google drive
        Meteor.defer(() => {
            const folderId = prossDocDrive.createSalesRecordFolder.call({name: data.name, salesRecordId})
            const {webViewLink, webContentLink} = prossDocDrive.getFiles.call({fileId: folderId})

            // set topic on slack channel
            Meteor.call('setTopicToSlackChannel', {...slackChannel, topic:`${Meteor.absoluteUrl(`deal/${salesRecordId}`)}\n${webViewLink || webContentLink}`})
        })

        // Insert conversations attached
        if (thread) {
            //console.log('thread to be attached', thread)
            Threads.update({_id:thread._id}, {$set:{conversationId:mainConversationId}})

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

            Meteor.call('moveSlackMails', {thread_id: thread.id, channel:slackChannel.id})
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
            name: Match.Maybe(String),
            shippingMode: Match.Maybe(String),
            members: Match.Maybe([String]),
            stakeholders: Match.Maybe([{
                isMainStakeholder: Boolean,
                addToMain: Match.Maybe(Boolean),
                peopleId: String,
            }]),
            actualDeliveryDate: Match.Maybe(Date),
            productionStartDate: Match.Maybe(Date),
            estDeliveryRange: Match.Maybe([Date]),

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

            bidDueDate: Match.Maybe(Date),
            expectedRevenue: Match.Maybe(Number),
            totalSquareFootage: Match.Maybe(Number),
            priority: Match.Maybe(String),
            probability: Match.Maybe(String),
            teamLead: Match.Maybe(String),
            dealer: Match.Maybe(String),
            clientStatus: Match.Maybe(String),
            supplierStatus: Match.Maybe(String),

            archived: Match.Maybe(Boolean)
        })
        check(thread, Match.Maybe(Object))
        check(conversationId, Match.Maybe(String))

        const sr = validateSalesRecord(_id)
        validatePermission(this.userId, sr)


        // Update main conversation participants
        if(sr.conversationIds && sr.conversationIds.length>0 && data.stakeholders) {
            Conversations.update({_id:sr.conversationIds[0]}, {$set:{participants:data.stakeholders.filter(s => s.addToMain).map(({peopleId,isMainStakeholder}) => ({peopleId, isMain:isMainStakeholder}))}})
        }

        // Update SalesRecord
        SalesRecords.update({_id}, {$set: data})

        // Insert conversations attached
        if (thread) {
            //console.log('thread to be attached', thread, `conversationId=${conversationId}`)
            if(!conversationId) throw new Meteor.Error('ConversationID required')

            Threads.update({_id:thread._id}, {$set:{conversationId}})

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

            Meteor.call('moveSlackMails', {thread_id: thread.id, channel:sr.slackChannel.id})
        }

    },

    updateSalesRecordDealer(salesRecordId, dealer) {
        check(salesRecordId, String)
        check(dealer, Match.Maybe(String))

        const salesRecord = validateSalesRecord(salesRecordId)
        validatePermission(this.userId, salesRecord)


        SalesRecords.update({_id:salesRecordId}, {$set:{dealer}})
    },

    updateSalesRecordMembers(salesRecordId, members){
        check(salesRecordId, String)
        check(members, Array)

        const salesRecord = validateSalesRecord(salesRecordId)
        validatePermission(this.userId, salesRecord)

        if(members && salesRecord.members && members.length == salesRecord.members.length && members.every(m => salesRecord.members.indexOf(m)>-1)) return

        if(members && members.length) {
            Meteor.users.find({
                _id: { $in: members.filter(mid => salesRecord.members.indexOf(mid)==-1) },
                slack: { $exists: true },
            }).forEach(
                ({ slack: { id } }) => {
                    Meteor.call('inviteUserToSlackChannel', {...salesRecord.slackChannel, user:id})
                }
            )
        }

        SalesRecords.update(salesRecordId, {$set: {members}})

        // allow edit folder
        Meteor.defer(() => {
            members.filter((m) => salesRecord.members.indexOf(m) === -1).forEach((m) => {
                const user = Meteor.users.findOne(m)
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

        const salesRecord = validateSalesRecord(_id)
        validatePermission(this.userId, salesRecord)

        const slackChannel = {
            id: channel.id,
            name: channel.name,
            isPrivate: channel.isPrivate
        }

        if(channel.members.indexOf(config.slack.botId) == -1) {
            const responseInviteBot = Meteor.call('inviteBotToSlackChannel', slackChannel)

            if (!responseInviteBot.data.ok) {
                ServerLog.error(JSON.stringify(slackChannel), responseInviteBot.data)
                throw new Meteor.Error('Bot cannot add to channel')
            }
        }
        SalesRecords.update(_id, {$set:{slackChannel}})
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


        // current user belongs to salesRecords
        let salesRecord = validateSalesRecord(salesRecordId)
        validatePermission(this.userId, salesRecord)

        const statusValue = (key) => {
            if(key === 'teamLead') {
                const teamLead = salesRecord.getTeamLead()
                if(teamLead) {
                    return teamLead.slack ? `<@${teamLead.slack.id}|${teamLead.slack.name}>` : teamLead.username
                } else {
                    return null
                }
            } else if(key === 'clientStatus') {
                const clientStatus = salesRecord.getClientStatus()
                return clientStatus ? clientStatus.name : null
            } else if(key === 'supplierStatus') {
                const supplierStatus = salesRecord.getSupplierStatus()
                return supplierStatus ? supplierStatus.name : null
            } else {
                return salesRecord[key]
            }
        }
        const oldValues = Object.keys(status).map((key) => statusValue(key))
        status.modifiedAt = new Date()
        SalesRecords.update(salesRecordId, {
            $set: status,
        })
        salesRecord = SalesRecords.findOne(salesRecordId)

        delete status.modifiedAt
        ServerLog.info('sendDealStatusChangeToSlack data for updateSalesRecordStatus', {salesRecordId, statusName:Object.keys(status).join(','), oldValue:oldValues.join(','), newValue:Object.keys(status).map(key => status[key])})
        Meteor.call('sendDealStatusChangeToSlack', {salesRecordId, statusName:Object.keys(status).join(','), oldValue:oldValues.join(','), newValue:Object.keys(status).map(key => statusValue(key)).join(',')})
    },

    archiveSalesRecord(_id, archived) {
        check(_id, String)
        check(archived, Boolean)

        const salesRecord = validateSalesRecord(_id)
        validatePermission(this.userId, salesRecord)

        if(archived) {
            Meteor.call('archiveSlackChannel', salesRecord.slackChannel)
        } else {
            Meteor.call('unarchiveSlackChannel', salesRecord.slackChannel)
        }
        SalesRecords.update(_id, {$set:{archived}})
    }

})


export const pushConversationToSalesRecord = new ValidatedMethod({
    name: 'salesRecord.pushConversation',
    validate: new SimpleSchema({_id:SalesRecords.schema.schema('_id'), conversationId:Conversations.schema.schema('_id')}).validator({clean:true}),
    run({_id, conversationId}) {
        const sr = validateSalesRecord(_id)
        validatePermission(this.userId, sr)

        SalesRecords.update(_id, {$push:{conversationIds:conversationId}})
    }
})
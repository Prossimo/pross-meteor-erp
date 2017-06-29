import {Roles} from 'meteor/alanning:roles'
import  {HTTP} from 'meteor/http'
import SimpleSchema from 'simpl-schema'
import queryString from 'query-string'
import config from '../../config/config'
import NylasAPI from '../../nylas/nylas-api'
import {SalesRecords, Threads, Messages, ROLES} from '../index'
import {prossDocDrive} from '../../drive'
import {getSubStages} from '../../lib/filters.js'

const SLACK_API_ROOT = config.slack.apiRoot
const SLACK_API_KEY = config.slack.apiKey
const SLACK_BOT_ID = config.slack.botId

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
                    isRemoveSlack && HTTP.post(`${SLACK_API_ROOT}/channels.archive`, {
                        params: {
                            token: SLACK_API_KEY,
                            channel: slackChanel,
                        }
                    })
                })
            }
        }
    },

    changeStageOfSalesRecord(salesRecordId, stage) {
        check(salesRecordId, String)
        check(stage, String)
        const salesRecord = SalesRecords.findOne({_id: salesRecordId, 'members.userId': this.userId})
        if (salesRecord || Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
            const subStage = getSubStages(stage, {gettingFirstStage: true})
            SalesRecords.update(salesRecordId, {$set: {stage, subStage}})
        }
    },

    changeSubStageOfSalesRecord(salesRecordId, subStage) {
        check(salesRecordId, String)
        check(subStage, String)
        const salesRecord = SalesRecords.findOne({_id: salesRecordId, 'members.userId': this.userId})
        if (salesRecord || Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
            SalesRecords.update(salesRecordId, {$set: {subStage}})
        }
    },

    addStakeholderToSalesRecord(salesRecordId, stakeholder) {
        check(salesRecordId, String)
        check(stakeholder, {
            peopleId: String,
            notify: Boolean,
        })
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Access Denined')
        stakeholder.isMainStakeholder = false
        SalesRecords.update(salesRecordId, {$push: {stakeholders: stakeholder}})
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
            return SalesRecords.update(salesRecordId, {$pull: {members: {userId}}})
        }
    },
    // NOTICE: it must be saleRecord
    insertSalesRecord(data, thread){
        if (!this.userId) {
            throw new Meteor.Error('No authorized')
        }
        check(data, {
            name: String,
            shippingMode: String,
            members: [{
                userId: String,
                category: [String]
            }],
            stakeholders: [{
                isMainStakeholder: Boolean,
                notify: Boolean,
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

        const responseCreateChannel = HTTP.post(`${SLACK_API_ROOT}/channels.create`, {
            params: {
                token: SLACK_API_KEY,
                name: data.name
            }
        })

        //console.log("Create slack channel response", responseCreateChannel)
        if (!responseCreateChannel.data.ok) {
            if (responseCreateChannel.data.error = 'name_taken') {
                throw new Meteor.Error(`Cannot create slack channel with name ${data.name}`)
            }
            throw new Meteor.Error('Some problems with created slack channel! Sorry try later')
        }


        data.slackChanel = responseCreateChannel.data.channel.id

        const responseInviteBot = HTTP.post(`${SLACK_API_ROOT}/channels.invite`, {
            params: {
                token: SLACK_API_KEY,
                channel: responseCreateChannel.data.channel.id,
                user: SLACK_BOT_ID
            }
        })

        if (!responseInviteBot.data.ok) throw new Meteor.Error('Bot cannot add to channel')

        Meteor.users.find({_id: {$in: data.members.map(item => item.userId)}, slack: {$exists: true}})
            .forEach(user => {
                HTTP.post(`${SLACK_API_ROOT}/channels.invite`, {
                    params: {
                        token: SLACK_API_KEY,
                        channel: responseCreateChannel.data.channel.id,
                        user: user.slack.id
                    }
                })
            })


        const salesRecordId = SalesRecords.insert(data)

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

    updateSalesRecord(_id, data, thread){
        if (!this.userId) {
            throw new Meteor.Error('No authorized')
        }
        check(_id, String)
        check(data, {
            name: String,
            shippingMode: String,
            members: [{
                userId: String,
                category: [String]
            }],
            stakeholders: [{
                isMainStakeholder: Boolean,
                notify: Boolean,
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


        const sr = SalesRecords.findOne(_id)
        if(!sr) throw new Meteor.Error(`Not found SR with _id:${_id}`)
        SalesRecords.update({_id}, {$set: data})


        // Insert conversations attached
        if (thread) {
            console.log('thread to be attached', thread)
            const existingThreads = Threads.find({id: thread.id}).fetch()
            if (existingThreads && existingThreads.length) {
                Threads.update({id: thread.id}, {$set: thread})
            } else {
                thread.salesRecordId = _id
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

    addMembersToProject(salesRecordId, members){
        check(salesRecordId, String)
        check(members, Array)

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Access denied')

        SalesRecords.update(salesRecordId, {$push: {members: {$each: members}}})
        // allow edit folder
        Meteor.defer(() => {
            _.each(members, (member) => {
                const user = Meteor.users.findOne(member.userId)
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
})

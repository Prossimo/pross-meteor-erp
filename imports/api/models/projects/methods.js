import _ from 'underscore'
import {Roles} from 'meteor/alanning:roles'
import SimpleSchema from 'simpl-schema'
import {ValidatedMethod} from 'meteor/mdg:validated-method'
import queryString from 'query-string'
import NylasAPI from '../../nylas/nylas-api'
import {Projects, ROLES, Conversations, Threads, Messages} from '/imports/api/models'
import {prossDocDrive} from '/imports/api/drive'
import {slackClient} from '/imports/api/slack'
import config from '../../config'
import {ErrorLog} from '/imports/utils/logger'

const bound = Meteor.bindEnvironment((callback) => callback())

const validateProject = (_id) => {
    const project = Projects.findOne(_id)
    if (!project) throw new Meteor.Error(`Not found project with _id: ${_id}`)

    return project
}

const validatePermission = (userId, project) => {
    if (!Roles.userIsInRole(userId, [ROLES.ADMIN, ROLES.SALES, ROLES.MANAGER]) && project && project.members.map(({userId}) => userId).indexOf(userId) === -1) {
        throw new Meteor.Error('Access Denied')
    }
}

export const createProject = new ValidatedMethod({
    name: 'project.create',
    validate: Projects.schema.pick('name', 'members', 'stakeholders', 'nylasAccountId').extend({
        thread: {type: Threads.schema, optional: true},
        isServer: {type: Boolean, optional: true},
        isPrivateSlackChannel: {type: Boolean, optional: true}
    }).validator(),
    run({name, members, stakeholders, thread, nylasAccountId, isServer, isPrivateSlackChannel}) {
        const project = {name, members, stakeholders, nylasAccountId}
        // CHECK ROLE
        if (!isServer) {
            validatePermission(this.userId, null)
        }

        let mainConversationId
        if (!nylasAccountId) {   // if it is not inbox project
            stakeholders = stakeholders || []
            mainConversationId = Conversations.insert({
                name: 'Main',
                participants: stakeholders.filter(s => s.addToMain).map(({peopleId, isMainStakeholder}) => ({
                    peopleId,
                    isMain: isMainStakeholder
                }))
            })
            project.conversationIds = [mainConversationId]
        }

        // INSERT
        const projectId = Projects.insert(project)

        // CREATE NEW CHANNEL
        const slackChannel = Meteor.call('createSlackChannel', {
            name: `p-${project.name}`,
            isPrivate: isPrivateSlackChannel
        })
        if (!slackChannel) throw new Meteor.Error('Can not create slack channel')

        // INVITE MEMBERS to CHANNEL
        if (members) {
            Meteor.users.find({
                _id: {$in: members.map(({userId}) => userId)},
                slack: {$exists: true},
            }).forEach(
                ({slack: {id}}) => Meteor.call('inviteUserToSlackChannel', {...slackChannel, user: id})
            )
        }

        // UPDATE slackChannel
        Projects.update(projectId, {
            $set: {slackChannel},
        })

        // INVITE SLACKBOT to CHANNEL
        Meteor.call('inviteBotToSlackChannel', slackChannel)

        Meteor.defer(() => {
            // CREATE DRIVE
            const folderId = prossDocDrive.createProjectFolder.call({name: project.name, projectId})
            const {webViewLink, webContentLink} = prossDocDrive.getFiles.call({fileId: folderId})

            // set topic on slack channel
            Meteor.call('setTopicToSlackChannel', {
                ...slackChannel,
                topic: `${Meteor.absoluteUrl(`project/${projectId}`)}\n${webViewLink || webContentLink}`
            })
        })

        // Insert conversations attached
        if (thread) {
            //console.log('thread to be attached', thread)
            Threads.update({_id: thread._id}, {$set: {conversationId: mainConversationId}})

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

            Meteor.call('moveSlackMails', {thread_id: thread.id, channel: slackChannel.id})
        }

        return projectId
    }
})
export const updateProject = new ValidatedMethod({
    name: 'project.update',
    validate: Projects.schema.extend({
        thread: {type: Threads.schema, optional: true},
        conversationId: {type: String, regEx: SimpleSchema.RegEx.Id, optional: true}
    }).validator(),
    run({_id, name, members, stakeholders, thread, conversationId}) {

        // current user belongs to salesRecords
        const project = validateProject(_id)
        validatePermission(this.userId, project)


        if (members && members.length) {
            Meteor.users.find({
                _id: {$in: _.pluck(members, 'userId').filter(mid => _.pluck(project.members, 'userId').indexOf(mid) == -1)},
                slack: {$exists: true},
            }).forEach(
                ({slack: {id}}) => Meteor.call('inviteUserToSlackChannel', {...project.slackChannel, user: id})
            )
        }
        const data = {
            name: _.isUndefined(name) ? null : name,
            members: _.isUndefined(members) ? [] : members,
            stakeholders: _.isUndefined(stakeholders) ? [] : stakeholders
        }


        Projects.update({_id}, {
            $set: data
        })

        // Insert conversations attached
        if (thread) {
            if (!conversationId) throw new Meteor.Error('ConversationID required')

            Threads.update({_id: thread._id}, {$set: {conversationId}})

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

            Meteor.call('moveSlackMails', {thread_id: thread.id, channel: project.slackChannel.id})
        }
    }
})

export const removeProject = new ValidatedMethod({
    name: 'project.remove',
    validate: new SimpleSchema({
        _id: Projects.schema.schema('_id'),
        isRemoveFolders: {type: Boolean, optional: true},
        isRemoveSlack: {type: Boolean, optional: true}
    }).validator({clean: true}),
    run({_id, isRemoveFolders, isRemoveSlack}) {
        const project = validateProject(_id)

        validatePermission(this.userId, project)

        const {folderId, slackChannel} = project

        // Remove Project
        Projects.remove(_id)

        // Run later
        Meteor.defer(() => {
            // Remove slack channel
            isRemoveSlack && Meteor.call('archiveSlackChannel', slackChannel)
            // Remove folder
            isRemoveFolders && prossDocDrive.removeFiles.call({fileId: folderId})
        })
    }
})

export const pushConversationToProject = new ValidatedMethod({
    name: 'project.pushConversation',
    validate: new SimpleSchema({
        _id: Projects.schema.schema('_id'),
        conversationId: Conversations.schema.schema('_id')
    }).validator({clean: true}),
    run({_id, conversationId}) {
        const project = validateProject(_id)

        validatePermission(this.userId, project)
        Projects.update(_id, {$push: {conversationIds: conversationId}})
    }
})
Meteor.methods({
    updateProjectSlackChannel({_id, channel}) {
        check(_id, String)
        check(channel, Object) // slack channel object

        const project = validateProject(_id)
        validatePermission(this.userId, project)

        const slackChannel = {
            id: channel.id,
            name: channel.name,
            isPrivate: channel.isPrivate
        }


        if (channel.members.indexOf(config.slack.botId) == -1) {
            const responseInviteBot = Meteor.call('inviteBotToSlackChannel', slackChannel)

            if (!responseInviteBot.data.ok) {
                ErrorLog.error(JSON.stringify(slackChannel), responseInviteBot.data)
                throw new Meteor.Error('Bot cannot add to channel')
            }
        }
        Projects.update(_id, {$set: {slackChannel}})
    },
    archiveProject(_id, archived) {
        check(_id, String)
        check(archived, Boolean)

        const project = validateProject(_id)
        validatePermission(this.userId, project)

        if(archived) {
            Meteor.call('archiveSlackChannel', project.slackChannel)
        } else {
            Meteor.call('unarchiveSlackChannel', project.slackChannel)
        }

        Projects.update(_id, {$set: {archived}})
    },

    updateProjectMembers(projectId, members) {
        check(projectId, String)
        check(members, Array)

        const project = validateProject(projectId)
        validatePermission(this.userId, project)

        if (members && project.members && members.length == project.members.length && members.every(m => project.members.indexOf(m) > -1)) return

        if (members && members.length) {
            Meteor.users.find({
                _id: {$in: members.map(({userId}) => userId).filter(userId => project.members.map(({userId}) => userId).indexOf(userId) === -1)},
                slack: {$exists: true},
            }).forEach(
                ({slack: {id}}) => Meteor.call('inviteUserToSlackChannel', {...project.slackChannel, user: id})
            )
        }

        Projects.update(projectId, {$set: {members}})

        // allow edit folder
        Meteor.defer(() => {
            members
                .map(({userId}) => userId)
                .filter(userId => project.members.map(({userId}) => userId).indexOf(userId) === -1)
                .forEach((userId) => {
                    const user = Meteor.users.findOne(userId)
                    if (user && user.emails && user.emails.length > 0) {
                        const email = user.emails[0].address
                        if (email) {
                            if (project && project.folderId) {
                                prossDocDrive.shareWith.call({fileId: project.folderId, email})
                            }
                        }
                    }
                })
        })
    }
})
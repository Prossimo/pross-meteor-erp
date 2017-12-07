import _ from 'underscore'
import {Roles} from 'meteor/alanning:roles'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import queryString from 'query-string'
import NylasAPI from '../../nylas/nylas-api'
import { Projects, ROLES, Conversations, Threads, Messages } from '/imports/api/models'
import { prossDocDrive } from '/imports/api/drive'
import { slackClient } from '/imports/api/slack'
import config from '../../config'
import {ErrorLog} from '/imports/utils/logger'

const bound = Meteor.bindEnvironment((callback) => callback())

const validateProject = (_id) => {
    const project = Projects.findOne(_id)
    if(!project) throw new Meteor.Error(`Not found project with _id: ${_id}`)

    return project
}

const validatePermission = (userId, project) => {
    if(!Roles.userIsInRole(userId, [ROLES.ADMIN, ROLES.SALES, ROLES.MANAGER]) && project && project.members.map(({userId}) => userId).indexOf(userId) === -1) {
        throw new Meteor.Error('Access Denied')
    }
}

export const createProject = new ValidatedMethod({
    name: 'project.create',
    validate: Projects.schema.pick('name', 'members', 'stakeholders', 'nylasAccountId').extend({
        thread:{type:Threads.schema, optional:true},
        isServer: {type:Boolean, optional:true}
    }).validator(),
    run({ name, members, stakeholders, thread, nylasAccountId, isServer }) {
        const project = { name, members, stakeholders, nylasAccountId }
        // CHECK ROLE
        if (!isServer) {
            validatePermission(this.userId, null)
        }

        let mainConversationId
        if(!nylasAccountId) {   // if it is not inbox project
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
        let newName = `p-${project.name}`
        let { data } = slackClient.channels.create({ name: newName })
        // RETRY WITH UNIQUE NAME
        if (!data.ok) {
            newName = `${newName}-${Random.id()}`
            data = slackClient.channels.create({ name: newName }).data
        }

        let slackChanel
        if (data.ok) {
            slackChanel = data.channel.id
            const slackChannelName = data.channel.name
            // INVITE MEMBERS to CHANNEL
            if(members) {

                Meteor.users.find({
                    _id: { $in: members.map(({ userId }) => userId) },
                    slack: { $exists: true },
                }).forEach(
                    ({ slack: { id } }) => slackClient.channels.invite({ channel: slackChanel, user: id })
                )
            }

            // UPDATE slackChanel
            Projects.update(projectId, {
                $set: { slackChanel, slackChannelName },
            })

            // INVITE SLACKBOT to CHANNEL
            slackClient.channels.inviteBot({ channel: slackChanel })

            Meteor.defer(() => {
                // CREATE DRIVE
                const folderId = prossDocDrive.createProjectFolder.call({ name: project.name, projectId })
                const {webViewLink, webContentLink} = prossDocDrive.getFiles.call({fileId: folderId})

                // set topic on slack channel
                slackClient.channels.setTopic({
                    channel: slackChanel,
                    topic: `${Meteor.absoluteUrl(`project/${projectId}`)}\n${webViewLink || webContentLink}`,
                })
            })
        }

        // Insert conversations attached
        if (thread) {
            //console.log('thread to be attached', thread)
            Threads.update({_id:thread._id},{$set:{conversationId:mainConversationId}})

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

            if(slackChanel) {
                Meteor.call('moveSlackMails', {thread_id: thread.id, channel: slackChanel})
            }
        }

        return projectId
    }
})
export const updateProject = new ValidatedMethod({
    name: 'project.update',
    validate: Projects.schema.extend({
        thread:{type:Threads.schema, optional:true},
        conversationId:{type: String, regEx: SimpleSchema.RegEx.Id, optional:true}
    }).validator(),
    run({ _id, name, members, stakeholders, thread, conversationId }) {

        // current user belongs to salesRecords
        const project = validateProject(_id)
        validatePermission(this.userId, project)


        if(members && members.length) {
            Meteor.users.find({
                _id: { $in: _.pluck(members, 'userId').filter(mid => _.pluck(project.members, 'userId').indexOf(mid)==-1) },
                slack: { $exists: true },
            }).forEach(
                ({ slack: { id } }) => {
                    const {data} = slackClient.channels.invite({ channel:project.slackChanel, user:id })
                }
            )
        }
        const data = {
            name: _.isUndefined(name) ? null : name,
            members: _.isUndefined(members) ? [] : members,
            stakeholders: _.isUndefined(stakeholders) ? [] : stakeholders
        }


        Projects.update(_id, {
            $set: data
        })

        // Insert conversations attached
        if (thread) {
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

            Meteor.call('moveSlackMails', {thread_id: thread.id, channel: project.slackChanel})
        }
    }
})

export const removeProject = new ValidatedMethod({
    name: 'project.remove',
    validate: new SimpleSchema({_id:Projects.schema.schema('_id'), isRemoveFolders:{type:Boolean,optional:true}, isRemoveSlack:{type:Boolean,optional:true}}).validator({clean:true}),
    run({_id, isRemoveFolders, isRemoveSlack}) {
        const project = validateProject(_id)

        validatePermission(this.userId, project)

        const { folderId, slackChanel } = project

        // Remove Project
        Projects.remove(_id)

        // Run later
        Meteor.defer(() => {
            // Remove slack channel
            isRemoveSlack && slackClient.channels.archive({ channel: slackChanel })
            // Remove folder
            isRemoveFolders && prossDocDrive.removeFiles.call({ fileId: folderId })
        })
    }
})

export const pushConversationToProject = new ValidatedMethod({
    name: 'project.pushConversation',
    validate: new SimpleSchema({_id:Projects.schema.schema('_id'), conversationId:Conversations.schema.schema('_id')}).validator({clean:true}),
    run({_id, conversationId}) {
        const project = validateProject(_id)

        validatePermission(this.userId, project)
        Projects.update(_id, {$push:{conversationIds:conversationId}})
    }
})
Meteor.methods({
    updateProjectSlackChannel({_id, channel}) {
        check(_id, String)
        check(channel, Object) // slack channel object

        const slackChanel = channel.id
        const slackChannelName = channel.name
        const slackMembers = channel.members

        const project = validateProject(_id)
        validatePermission(this.userId, project)

        if(slackMembers.indexOf(config.slack.botId) == -1) {
            const responseInviteBot = slackClient.channels.inviteBot({
                channel: slackChanel,
            })

            if (!responseInviteBot.data.ok) {
                ErrorLog.error(slackChanel, responseInviteBot.data)
                throw new Meteor.Error('Bot cannot add to channel')
            }
        }
        Projects.update(_id, {$set:{slackChanel, slackChannelName}})
    },
    archiveProject(_id, archived) {
        check(_id, String)
        check(archived, Boolean)

        const project = validateProject(_id)
        validatePermission(this.userId, project)

        Projects.update(_id, {$set:{archived}})
    },

    updateProjectMembers(projectId, members){
        check(projectId, String)
        check(members, Array)

        const project = validateProject(projectId)
        validatePermission(this.userId, project)

        if(members && project.members && members.length == project.members.length && members.every(m => project.members.indexOf(m)>-1)) return

        if(members && members.length) {
            Meteor.users.find({
                _id: { $in: members.filter(({userId}) => project.members.map(({userId}) => userId).indexOf(userId)==-1) },
                slack: { $exists: true },
            }).forEach(
                ({ slack: { id } }) => {
                    const {data} = slackClient.channels.invite({ channel:project.slackChanel, user:id })
                    console.log(data)
                }
            )
        }

        Projects.update(projectId, {$set: {members}})

        // allow edit folder
        Meteor.defer(() => {
            members.filter(({userId}) => project.members.map(({userId}) => userId).indexOf(userId) === -1).forEach((userId) => {
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
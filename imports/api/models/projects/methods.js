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

const bound = Meteor.bindEnvironment((callback) => callback())

export const createProject = new ValidatedMethod({
    name: 'project.create',
    validate: Projects.schema.pick('name', 'members', 'stakeholders', 'nylasAccountId').extend({
        thread:{type:Threads.schema, optional:true},
        isServer: {type:Boolean, optional:true}
    }).validator(),
    run({ name, members, stakeholders, thread, nylasAccountId, isServer }) {
        const project = { name, members, stakeholders, nylasAccountId }
        // CHECK ROLE
        if (!isServer && !Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.SALES]))
            throw new Meteor.Error('Access denied')

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

        if (data.ok) {
            const slackChanel = data.channel.id
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

            // SET SLACK PURPOSE
            slackClient.channels.setPurpose({
                channel: slackChanel,
                purpose: Meteor.absoluteUrl(`project/${projectId}`),
            })

            Meteor.defer(() => {
                // CREATE DRIVE
                prossDocDrive.createProjectFolder.call({ name: newName, projectId })
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
        // current user belongs to ADMIN LIST
        const isAdmin = Roles.userIsInRole(this.userId, ROLES.ADMIN)

        // current user belongs to salesRecords
        const project = Projects.findOne(_id)
        if (!project) throw new Meteor.Error('Project does not exists')
        const isMember = project.members && !!project.members.find(({ userId }) => userId === this.userId)

        // check permission
        if (!isMember && !isAdmin) throw new Meteor.Error('Access denied')

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
        }
    }
})

export const removeProject = new ValidatedMethod({
    name: 'project.remove',
    validate: new SimpleSchema({_id:Projects.schema.schema('_id'), isRemoveFolders:{type:Boolean,optional:true}, isRemoveSlack:{type:Boolean,optional:true}}).validator({clean:true}),
    run({_id, isRemoveFolders, isRemoveSlack}) {
        if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
            const project = Projects.findOne(_id)
            if (project) {
                const { _id, folderId, slackChanel } = project

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
        }
    }
})

export const pushConversationToProject = new ValidatedMethod({
    name: 'project.pushConversation',
    validate: new SimpleSchema({_id:Projects.schema.schema('_id'), conversationId:Conversations.schema.schema('_id')}).validator({clean:true}),
    run({_id, conversationId}) {
        if(Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
            const project = Projects.findOne(_id)
            if(!project) throw new Meteor.Error(`Could not found project with _id:${_id}`)

            Projects.update(_id, {$push:{conversationIds:conversationId}})
        }
    }
})
Meteor.methods({
    updateProjectSlackChannel({_id, channel}) {
        check(_id, String)
        check(channel, Object) // slack channel object

        const slackChanel = channel.id
        const slackChannelName = channel.name
        const slackMembers = channel.members

        //if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Access denied')

        const project = Projects.findOne(_id)
        if(!project) throw new Meteor.Error(`Not found project with _id: ${_id}`)

        if(slackMembers.indexOf(config.slack.botId) == -1) {
            const responseInviteBot = slackClient.channels.inviteBot({
                channel: slackChanel,
            })

            if (!responseInviteBot.data.ok) {
                console.error(slackChanel, responseInviteBot.data)
                throw new Meteor.Error('Bot cannot add to channel')
            }
        }
        Projects.update(_id, {$set:{slackChanel, slackChannelName}})
    },
    archiveProject(_id, archived) {
        check(_id, String)
        check(archived, Boolean)

        const project = Projects.findOne(_id)
        if (!project) throw new Meteor.Error('Project does not exists')
        const isAdmin = Roles.userIsInRole(this.userId, [ROLES.ADMIN])
        const isMember = !!project.members.find(({userId}) => userId === this.userId)

        // check permission
        if (!isMember && !isAdmin) throw new Meteor.Error('Access denied')

        Projects.update(_id, {$set:{archived}})
    },

    updateProjectMembers(projectId, members){
        check(projectId, String)
        check(members, Array)

        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN])) throw new Meteor.Error('Access denied')

        const project = Projects.findOne(projectId)
        if(!project) throw new Meteor.Error(`Not found SalesRecord with _id: ${projectId}`)

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
            _.each(members, ({userId}) => {
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
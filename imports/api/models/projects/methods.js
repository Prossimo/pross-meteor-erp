import _ from 'underscore'
import {Roles} from 'meteor/alanning:roles'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'
import { Projects, ROLES } from '/imports/api/models'
import { prossDocDrive } from '/imports/api/drive'
import { slackClient } from '/imports/api/slack'
import config from '../../config'

export const createProject = new ValidatedMethod({
    name: 'project.create',
    validate: new SimpleSchema({
        name: String,
        members: Array,
        'members.$': Object,
        'members.$.userId': String,
        'members.$.isAdmin': Boolean,
    }).validator(),
    run({ name, members }) {
        const project = { name, members }
        // CHECK ROLE
        if (!Roles.userIsInRole(this.userId, [ROLES.ADMIN, ROLES.SALES]))
            throw new Meteor.Error('Access denied')

        // INSERT
        const projectId = Projects.insert(project)

        // CREATE NEW CHANNEL
        let { data } = slackClient.channels.create({ name: `p-${project.name}` })
        // RETRY WITH UNIQUE NAME
        if (!data.ok) {
            data = slackClient.channels.create({ name: `p-${project.name}-${Random.id()}` })
        }
        if (data.ok) {
            const slackChanel = data.channel.id
            // INVITE MEMBERS to CHANNEL
            Meteor.users.find({
                _id: { $in: project.members.map(({ userId }) => userId) },
                slack: { $exists: true },
            }).forEach(
                ({ slack: { id } }) => slackClient.channels.invite({ channel: slackChanel, user: id })
            )
            // UPDATE slackChanel
            Projects.update(projectId, {
                $set: { slackChanel },
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
                prossDocDrive.createProjectFolder.call({ name: project.name, projectId })
            })
        }

        return projectId
    }
})
export const updateProject = new ValidatedMethod({
    name: 'project.update',
    validate: Projects.schema.validator(),
    run({ _id, name, members }) {
        // current user belongs to ADMIN LIST
        const isAdmin = Roles.userIsInRole(this.userId, ROLES.ADMIN)

        // current user belongs to salesRecords
        const project = Projects.findOne(_id)
        if (!project) throw new Meteor.Error('Project does not exists')
        const isMember = !!project.members.find(({ userId }) => userId === this.userId)

        // check permission
        if (!isMember && !isAdmin) throw new Meteor.Error('Access denied')

        if(members && members.length) {
            Meteor.users.find({
                _id: { $in: _.pluck(members, 'userId').filter(mid => _.pluck(project.members, 'userId').indexOf(mid)==-1) },
                slack: { $exists: true },
            }).forEach(
                ({ slack: { id } }) => {
                    const {data} = slackClient.channels.invite({ channel:project.slackChanel, user:id })
                    console.log(data)
                }
            )
        }
        const data = {
            name: _.isUndefined(name) ? null : name,
            members: _.isUndefined(members) ? null : members
        }
        return Projects.update(_id, {
            $set: data
        })
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
    }
})
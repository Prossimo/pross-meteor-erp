import { HTTP } from 'meteor/http'
import {Roles} from 'meteor/alanning:roles'
import config from '/imports/api/config/config'
import { Projects, ROLES } from '/imports/api/models'
import { prossDocDrive } from '/imports/api/drive'
import SimpleSchema from 'simpl-schema'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

const { slack: { apiRoot, apiKey, botId } } = config
const slackRequest  = ({ action, params }) => {
  check(action, String)
  check(params, Object)
  const { data } = HTTP.post(`${apiRoot}/${action}`, {
    params: {
      token: apiKey,
      ...params,
    },
  })
  return data
}

return new ValidatedMethod({
  name: 'createNewProject',
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

    // RUN LATER
    Meteor.defer(() => {
      // CREATE NEW CHANNEL
      let data = slackRequest({
        action: 'channels.create',
        params: { name: project.name },
      })

      // RETRY WITH UNIQUE NAME
      if (!data.ok) {
        data = slackRequest({
          action: 'channels.create',
          params: { name: `${project.name}-${Random.id()}` },
        })
      }

      if (data.ok) {
        const slackChanel = data.channel.id

        // INVITE MEMBERS to CHANNEL
        Meteor.users.find({
          _id: { $in: project.members.map(({ userId }) => userId) },
          slack: { $exists: true },
        }).forEach(
          ({ slack: { id } }) => slackRequest({
            action: 'channels.invite',
            params: { channel: slackChanel, user: id },
          })
        )

        // INVITE SLACKBOT to CHANNEL
        slackRequest({
          action: 'channels.invite',
          params: { channel: slackChanel, user: botId },
        })

        // CREATE DRIVE
        prossDocDrive.createProjectFolder.call({ name: project.name, projectId })

        // UPDATE slackChanel
        Projects.update(projectId, {
          $set: { slackChanel },
        })
      }

    })
    return projectId
  }
})

import { HTTP } from 'meteor/http'
import {Roles} from 'meteor/alanning:roles'
import config from '/imports/api/config/config'
import { Projects, ROLES } from '/imports/api/models'
import { prossDocDrive } from '/imports/api/drive'

const { slack: { apiRoot, apiKey } } = config
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

Meteor.methods({
  createNewProject(project) {
    check(project, {
      name: String,
      members: [
        {
          userId: String,
          isAdmin: Boolean,
        },
      ],
    })

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

        // CREATE DRIVE
        prossDocDrive.createProjectFolder.call({ name: project.name, projectId })

        // UPDATE slackChanel
        Projects.update(projectId, {
          $set: { slackChanel },
        })
      }

    })
    return projectId
  },
})

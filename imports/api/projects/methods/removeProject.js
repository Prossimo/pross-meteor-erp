import { HTTP } from 'meteor/http'
import {Roles} from 'meteor/alanning:roles'
import SimpleSchema from 'simpl-schema'
import { ROLES, Projects } from '/imports/api/models'
import { prossDocDrive } from '/imports/api/drive'
import config from '/imports/api/config/config'

const SLACK_API_ROOT = config.slack.apiRoot
const SLACK_API_KEY = config.slack.apiKey

Meteor.methods({
  removeProject({ _id, isRemoveFolders, isRemoveSlack }) {
    check({
      _id,
      isRemoveFolders,
      isRemoveSlack,
    }, new SimpleSchema({
      _id: { type: String },
      isRemoveFolders: { type: Boolean },
      isRemoveSlack: { type: Boolean },
    }))

    if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
      const project = Projects.findOne(_id)
      if (project) {
        const { _id, folderId, slackChanel } = project

        // Remove Project
        Projects.remove(_id)

        // Run later
        Meteor.defer(() => {
          // Remove folder
          isRemoveFolders && prossDocDrive.removeFiles.call({ fileId: folderId })

          // Remove slack channel
          isRemoveSlack && HTTP.post(`${SLACK_API_ROOT}/channels.archive`, {
            params: {
              token: SLACK_API_KEY,
              channel: slackChanel,
            },
          })
        })
      }
    }
  },
})

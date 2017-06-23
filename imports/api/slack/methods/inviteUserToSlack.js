import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import slackClient from '../restful'

Meteor.methods({
  inviteUserToSlack(email) {
    new SimpleSchema({
      email: {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
      }
    }).validate({ email })

    return slackClient.admin.invite({ email })
  },
})

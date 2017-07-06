import { Meteor } from 'meteor/meteor'
import SimpleSchema from 'simpl-schema'
import slackClient from '../restful'

Meteor.methods({
  inviteUserToSlack(email) {
    check(email, String)
    new SimpleSchema({
      email: {
        type: String,
        regEx: SimpleSchema.RegEx.Email,
      }
    }).validate({ email })

    return slackClient.users.admin.invite({ email })
  },
})

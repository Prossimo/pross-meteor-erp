import { Meteor } from 'meteor/meteor'
import { users } from '../restful'
import { SlackUsers } from '/imports/api/models'

Meteor.methods({
  getSlackUsers(){
    const { data: { ok, members } } = users.list()
    if (!ok) return
    members.forEach(
      item => SlackUsers.findOne({ id: item.id }) && SlackUsers.insert(item)
    )
  }
})

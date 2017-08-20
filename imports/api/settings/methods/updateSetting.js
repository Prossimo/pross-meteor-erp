import {Roles} from 'meteor/alanning:roles'
import SimpleSchema from 'simpl-schema'
import { ROLES, Settings } from '../../models/'
import { ValidatedMethod } from 'meteor/mdg:validated-method'

export default new ValidatedMethod({
  name: 'settings.update',
  validate: new SimpleSchema({
    key: String,
    value: String,
  }).validator(),
  run({ key, value }) {
    if (Roles.userIsInRole(this.userId, ROLES.ADMIN)) {
      return Settings.update({ key }, { $set: { value } })
    }
  },
})

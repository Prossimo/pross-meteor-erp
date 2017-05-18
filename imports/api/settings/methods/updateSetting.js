import SimpleSchema from 'simpl-schema';
import { Settings } from '../../models/';
import { ADMIN_ROLE_LIST } from '../../constants/roles';

export default new ValidatedMethod({
  name: 'settings.update',
  validate: new SimpleSchema({
    key: String,
    value: String,
  }).validator(),
  run({ key, value }) {
    if (Roles.userIsInRole(this.userId, ADMIN_ROLE_LIST)) {
      return Settings.update({ key }, { $set: { value } });
    }
  },
});

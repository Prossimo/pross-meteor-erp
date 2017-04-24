import SimpleSchema from 'simpl-schema';

export default new ValidatedMethod({
  name: 'task.getEmployee',
  validate: new SimpleSchema({
    employeeId: {
      type: String,
    },
  }).validator(),
  run({ employeeId }) {
    return Meteor.users.findOne({ _id: employeeId, roles: 'employee' }, { fields: { profile: 1 } });
  },
});

import SimpleSchema from 'simpl-schema';

const getEmployees = new ValidatedMethod({
  name: 'task.getEmployees',
  validate: new SimpleSchema({}).validator(),
  run() {
    if (!this.userId) return [];
    return Meteor.users.find({
      roles: 'employee',
    }, {
      fields: {
        _id: 1,
        profile: 1,
      },
    })
    .fetch()
    .map(({ _id, profile: { firstName, lastName } })=> ({ _id, name: `${firstName ? firstName : ''} ${lastName ? lastName : ''}` }));
  },
});

export {
  getEmployees,
};

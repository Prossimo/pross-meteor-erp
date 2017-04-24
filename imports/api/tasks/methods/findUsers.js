import SimpleSchema from 'simpl-schema';

export default new ValidatedMethod({
  name: 'task.findUsers',
  validate: new SimpleSchema({
    keyword: { type: String },
  }).validator(),
  run({ keyword }) {
    if (!this.userId) return [];
    const $regex = new RegExp(keyword, 'i');
    return Meteor.users.find({
      roles: 'employee',
      $or: [
        {
          username: { $regex },
        },
        {
          'emails.address': { $regex },
        },
      ],
    }, {
      fields: { username: 1, emails: 1 },
      limit: 3,
    }).fetch();
  },
});

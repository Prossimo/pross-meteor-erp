import SimpleSchema from 'simpl-schema';
import { Projects, SalesRecords } from '/imports/api/models';

export default new ValidatedMethod({
  name: 'task.findUsers',
  validate: new SimpleSchema({
    keyword: { type: String },
    ignore: { type: String },
    parentId: { type: String },
  }).validator(),
  run({ keyword, ignore, parentId }) {
    if (!this.userId) return [];

    // find users belong to project or saleRecords
    const parent = Projects.findOne(parentId) || SalesRecords.findOne(parentId);
    const memberIds = parent.members ? parent.members.map(({ userId })=> userId) : [];

    const $regex = new RegExp(keyword, 'i');
    return Meteor.users.find({
      _id: {
        $ne: ignore,
        $in: memberIds,
      },
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
      fields: { username: 1, emails: 1, profile: 1 },
      limit: 3,
    }).fetch();
  },
});

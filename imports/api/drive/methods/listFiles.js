import drive from './drive';
import SimpleSchema from 'simpl-schema';

export default new ValidatedMethod({
    name: 'drive.listFiles',
    validate: new SimpleSchema().validator(),
    run() {
        const params = {};
        return Meteor.wrapAsync(drive.files.list)(params);
    }
})



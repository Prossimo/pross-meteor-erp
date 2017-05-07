import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Settings = new Mongo.Collection('Settings');

Settings.schema = new SimpleSchema({
    _id: {
        type: String,
    },
    userId: {
      type: String,
    }
    key: {
        type: String,
        allowedValues: ['salesRecord', 'newProject']
    },
    show: {
        type: Array,
    },
    'show.$': {
        type: String,
    }
});

Settings.attachSchema(Settings.schema);

export default Settings;

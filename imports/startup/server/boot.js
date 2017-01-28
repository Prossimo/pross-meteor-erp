import { Meteor } from 'meteor/meteor';
import { createAdminUser } from '../../api/server/helpers';

Meteor.startup(() => {
    //init admin user
    createAdminUser();

});


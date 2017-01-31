import { Meteor } from 'meteor/meteor';
import { createAdminUser } from '../../api/server/helpers';

Meteor.startup(() => {
    //init admin user
    createAdminUser();

    Meteor.startup(function () {
        process.env.MAIL_URL = 'smtp://postmaster@mg.prossimo.us:483618db5dede3a3287c134eed2df40f@smtp.mailgun.org:587';
    });


});


import React from 'react';
import {Meteor} from 'meteor/meteor';
import {compose} from 'react-komposer';
import getTrackerLoader from './traker';
import {GET_USERS, GET_PROJECTS, GET_MY_CONTACTS, GET_NYLAS_ACCOUNTS, GET_MAILTEMPLATES} from '/imports/api/constants/collections';
import SalesRecords from '/imports/api/models/salesRecords/salesRecords';

import App from '/imports/ui/App';

const reactiveMapper = (props, onData) => {

    if (Meteor.subscribe(GET_USERS).ready() &&
        Meteor.subscribe(GET_PROJECTS).ready() &&
        Meteor.subscribe(GET_NYLAS_ACCOUNTS).ready() &&
        Meteor.subscribe(GET_MY_CONTACTS).ready() &&
        Meteor.subscribe(GET_MAILTEMPLATES).ready()
    ) {
        const currentUser = Meteor.users.findOne(Meteor.userId());
        const salesRecords = SalesRecords.find({}, {sort: {createAt: -1}}).fetch();
        const users = Meteor.users.find().fetch();
        let usersArr = {};
        users.forEach(item => {
            usersArr[item._id] = item
        });
        onData(null, {currentUser, users, usersArr, salesRecords});
    }
};


export default compose(getTrackerLoader(reactiveMapper))(App);


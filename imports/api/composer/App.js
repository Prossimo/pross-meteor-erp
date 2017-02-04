import React from 'react';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import getTrackerLoader from './traker';
import { GET_USERS } from '../constatnts/collections';

import App from '../../ui/App';

const reactiveMapper = (props, onData)=> {

    if (Meteor.subscribe(GET_USERS).ready()) {

        const currentUser = Meteor.users.findOne(Meteor.userId());
        const users = Meteor.users.find().fetch();
        onData(null, { currentUser, users });
    }
};


export default compose(getTrackerLoader(reactiveMapper))(App);


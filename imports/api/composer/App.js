import React from 'react';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import getTrackerLoader from './traker';
import { GET_USERS } from '../constants/collections';

import App from '../../ui/App';

const reactiveMapper = (props, onData)=> {

    if (Meteor.subscribe(GET_USERS).ready()) {

        const currentUser = Meteor.users.findOne(Meteor.userId());
        const users = Meteor.users.find().fetch();
        let usersArr = {};
        users.forEach(item=>{
            usersArr[item._id] = item
        });
        onData(null, { currentUser, users, usersArr });
    }
};


export default compose(getTrackerLoader(reactiveMapper))(App);


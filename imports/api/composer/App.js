import React from 'react';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import getTrackerLoader from './traker';
import { GET_USERS, GET_PROJECTS } from '/imports/api/constants/collections';
import { Projects } from '/imports/api/lib/collections';

import App from '/imports/ui/App';

const reactiveMapper = (props, onData)=> {

    if (Meteor.subscribe(GET_USERS).ready() && Meteor.subscribe(GET_PROJECTS).ready()) {

        const currentUser = Meteor.users.findOne(Meteor.userId());
        const projects = Projects.find({}, {sort: {createAt: -1}}).fetch();
        const users = Meteor.users.find().fetch();
        let usersArr = {};
        users.forEach(item=>{
            usersArr[item._id] = item
        });
        onData(null, { currentUser, users, usersArr, projects });
    }
};


export default compose(getTrackerLoader(reactiveMapper))(App);


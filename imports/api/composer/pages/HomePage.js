import React from 'react';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import getTrackerLoader from '../traker';

import HomePage from '../../../ui/pages/HomePage';

const reactiveMapper = (props, onData)=> {
    if (Meteor.subscribe('users').ready()) {
        let users = Meteor.users.find().fetch();
        onData(null, { users });
    }
};


export default compose(getTrackerLoader(reactiveMapper))(HomePage);


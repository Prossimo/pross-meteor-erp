import React from 'react';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import getTrackerLoader from './traker';

import App from '../../ui/App';

const reactiveMapper = (props, onData)=> {
    if (Meteor.subscribe('users').ready()) {
        let user = Meteor.users.find().fetch();

        onData(null, { user });
    }
};


export default compose(getTrackerLoader(reactiveMapper))(App);


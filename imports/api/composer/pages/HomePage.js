import React from 'react';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import getTrackerLoader from '../traker';
import { Messages } from '../../lib/collections';

import HomePage from '../../../ui/pages/HomePage';

const reactiveMapper = (props, onData)=> {
    if (Meteor.subscribe('messages').ready()) {
        let messages = Messages.find({}, {sort: {createAt: -1}}).fetch();
        onData(null, { messages });
    }
};


export default compose(getTrackerLoader(reactiveMapper))(HomePage);


import React from 'react';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import getTrackerLoader from '../traker';
import { CreatedUsers } from '../../lib/collections';
import { GET_ADMIN_CREATE_USERS } from '../../constatnts/collections';

import AdminPage from '../../../ui/pages/AdminPage';

const reactiveMapper = (props, onData)=> {
    if (Meteor.subscribe(GET_ADMIN_CREATE_USERS).ready()) {
        const createdUsers = CreatedUsers.find({}, {sort: {createAt: -1}}).fetch();
        onData(null, { createdUsers });
    }
};

export default compose(getTrackerLoader(reactiveMapper))(AdminPage);
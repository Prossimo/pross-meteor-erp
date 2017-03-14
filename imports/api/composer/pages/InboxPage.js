import React from 'react';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import getTrackerLoader from '../traker';
import { NylasAccounts } from '../../models/nylasaccounts/nylas-accounts';
import { GET_NYLAS_ACCOUNTS } from '../../constants/collections';

import InboxPage from '../../../ui/pages/InboxPage';

const reactiveMapper = (props, onData)=> {
    if (Meteor.subscribe(GET_NYLAS_ACCOUNTS).ready()) {
        const nylasAccounts = NylasAccounts.find({}).fetch();
        onData(null, { nylasAccounts });
    }
};

export default compose(getTrackerLoader(reactiveMapper))(InboxPage);
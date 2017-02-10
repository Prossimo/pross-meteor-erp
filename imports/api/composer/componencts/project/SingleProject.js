import React from 'react';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import getTrackerLoader from '../../traker';
import { Messages, Projects, Quotes } from '../../../lib/collections';
import { GET_ACTIVITY, GET_PROJECT, GET_QUOTES } from '../../../constants/collections';

import SingleProject from '../../../../ui/components/project/SingleProject';

const reactiveMapper = (props, onData)=> {
    if (Meteor.subscribe(GET_ACTIVITY, FlowRouter.getParam('id')).ready() &&
        Meteor.subscribe(GET_PROJECT, FlowRouter.getParam('id')).ready() &&
        Meteor.subscribe(GET_QUOTES, FlowRouter.getParam('id')).ready()
    ) {
        const messages = Messages.find({}, {sort: {createAt: -1}}).fetch();
        const project = Projects.findOne();
        const quotes = Quotes.find({}, {sort: {createAt: -1}}).fetch();
        onData(null, { messages, project, quotes });
    }
};


export default compose(getTrackerLoader(reactiveMapper))(SingleProject);


import React from 'react';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import getTrackerLoader from '../../traker';
import { Messages, Projects } from '../../../lib/collections';
import { GET_ACTIVITY, GET_PROJECT } from '../../../constatnts/collections';

import SingleProject from '../../../../ui/components/project/SingleProject';

const reactiveMapper = (props, onData)=> {
    if (Meteor.subscribe(GET_ACTIVITY, FlowRouter.getParam('id')).ready() &&
        Meteor.subscribe(GET_PROJECT, FlowRouter.getParam('id')).ready()
    ) {
        const messages = Messages.find({}, {sort: {createAt: -1}}).fetch();
        const project = Projects.findOne();
        onData(null, { messages, project });
    }
};


export default compose(getTrackerLoader(reactiveMapper))(SingleProject);


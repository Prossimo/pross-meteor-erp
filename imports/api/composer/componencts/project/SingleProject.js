import React from 'react';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import getTrackerLoader from '../../traker';
import { Messages, Projects, Quotes, Files, Events } from '../../../lib/collections';
import { GET_ACTIVITY, GET_PROJECT, GET_QUOTES, GET_PROJECT_FILES, GET_PROJECT_EVENTS } from '../../../constants/collections';

import SingleProject from '../../../../ui/components/project/SingleProject';

const reactiveMapper = (props, onData)=> {
    const projectId = FlowRouter.getParam('id');
    if (Meteor.subscribe(GET_ACTIVITY, projectId).ready() &&
        Meteor.subscribe(GET_PROJECT_EVENTS, projectId).ready() &&
        Meteor.subscribe(GET_PROJECT, projectId).ready() &&
        Meteor.subscribe(GET_QUOTES, projectId).ready() &&
        Meteor.subscribe(GET_PROJECT_FILES, projectId).ready()
    ) {
        const files = {};
        Files.find({}).fetch().forEach(item=>files[item._id]=item);
        const msg = Messages.find({}, {sort: {createAt: -1}}).fetch().map(item=>{
            item.type = 'message';
            return item;
        });
        const project = Projects.findOne();
        const quotes = Quotes.find({}, {sort: {createAt: -1}}).fetch().map(item=>{
            item.url = files[item.attachedFile.fileId].url();
            return item;
        });

        const events = Events.find().fetch().map(item=>{
            item.type = 'event';
            item.author = props.usersArr[item.createBy];
            return item;
        });
        const messages = msg.concat(events).sort((a,b)=>{return a.createAt > b.createAt ? -1 : 1});

        onData(null, { messages, project, quotes});
    }
};

export default compose(getTrackerLoader(reactiveMapper))(SingleProject);


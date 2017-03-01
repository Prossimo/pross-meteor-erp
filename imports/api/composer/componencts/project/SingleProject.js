import React from 'react';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import getTrackerLoader from '../../traker';
import { Projects, Quotes, Files, Events, SlackMessages } from '/imports/api/lib/collections';
import { GET_PROJECT, GET_QUOTES, GET_PROJECT_FILES, GET_SLACK_MSG, GET_PROJECT_EVENTS } from '../../../constants/collections';

import SingleProject from '/imports/ui/components/project/SingleProject';
const options = {
    loadingHandler: () => (<p className="page-loader"/>)
};
const reactiveMapper = (props, onData)=> {
    const projectId = FlowRouter.getParam('id');
    if (
        Meteor.subscribe(GET_PROJECT_EVENTS, projectId).ready() &&
        Meteor.subscribe(GET_PROJECT, projectId).ready() &&
        Meteor.subscribe(GET_QUOTES, projectId).ready() &&
        Meteor.subscribe(GET_PROJECT_FILES, projectId).ready() &&
        Meteor.subscribe(GET_SLACK_MSG, projectId).ready()
    ) {
        const files = {};
        Files.find({}).fetch().forEach(item=>files[item._id]=item);
        const msg = SlackMessages.find({}, {sort: {createAt: -1}}).fetch().map(item=>{
            if(item.userId){
                item.author = props.usersArr[item.userId]
            }
            return item;
        });

        let project = Projects.findOne();
        project.members = project.members.map(member=>{
            member.user = props.usersArr[member.userId];
            return member;
        });

        const quotes = Quotes.find({}, {sort: {createAt: -1}}).fetch().map(item=>{
            item.revisions.map(revision=>{
                revision.url = files[revision.fileId].url();
                return revision;
            });
            return item;
        });

        const events = Events.find().fetch().map(item=>{
            item.type = 'event';
            item.author = props.usersArr[item.createBy];
            return item;
        });
        const messages = msg.concat(events).sort((a,b)=>{return a.createAt > b.createAt ? -1 : 1});

        onData(null, { messages, project, quotes})
    }
};

export default compose(getTrackerLoader(reactiveMapper),options)(SingleProject);


import React from 'react';
import { Meteor } from 'meteor/meteor';
import { compose } from 'react-komposer';
import getTrackerLoader from '../traker';
import { Projects } from '../../lib/collections';
import { GET_PROJECTS } from '../../constatnts/collections';

import ProjectsPage from '../../../ui/pages/ProjectsPage';

const reactiveMapper = (props, onData)=> {
    if (Meteor.subscribe(GET_PROJECTS).ready()) {
        const projects = Projects.find({}, {sort: {createAt: -1}}).fetch();
        onData(null, { projects });
    }
};


export default compose(getTrackerLoader(reactiveMapper))(ProjectsPage);
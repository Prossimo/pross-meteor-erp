import React from 'react';
import {mount} from 'react-mounter';
import {FlowRouter} from 'meteor/kadira:flow-router';

import App from '../../api/composer/App';
import AuthenticationPage from '../../ui/pages/AuthenticationPage';
import HomePage from '../../api/composer/pages/HomePage';
import ProjectsPage from '../../ui/pages/ProjectsPage';
import Project from '../../ui/components/projects/Project';

function checkAuth() {
    if(!Meteor.userId()) FlowRouter.go("Root");
}

FlowRouter.route('/', {
    name: 'Root',
    action(){
        if(Meteor.userId()){
            mount(App, {
                content: <HomePage/>,
                login: true
            })
        }else{
            mount(App, {
                content: <AuthenticationPage/>,
                login: false
            })
        }
    }
});

FlowRouter.route('/projects', {
    name: 'Projects',
    action(){
        checkAuth();
        mount(App, {
            content: <ProjectsPage/>,
            login: true
        })
    }
});

FlowRouter.route('/project/:id', {
    name: 'Project',
    action(){
        checkAuth();
        mount(App, {
            content: <Project id={FlowRouter.getParam('id')}/>,
            login: true
        })
    }
});

FlowRouter.notFound = {
    action() {
        FlowRouter.go("Root");
    }
};

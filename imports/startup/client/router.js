import React from 'react';
import {mount} from 'react-mounter';
import {FlowRouter} from 'meteor/kadira:flow-router';

import App from '../../api/composer/App';
import AuthenticationPage from '../../ui/pages/AuthenticationPage';
import AdminPage from '../../api/composer/pages/AdminPage';
import SingleProject from '../../api/composer/componencts/project/SingleProject';
import ProjectsPage from '../../api/composer/pages/ProjectsPage';
import UserAccount from '../../ui/pages/UserAccount';

function checkAuth() {
    if(!Meteor.userId()) FlowRouter.go("Root");
}

FlowRouter.route('/', {
    name: 'Root',
    action(){
        if(Meteor.userId()){
            mount(App, {
                content: <ProjectsPage/>,
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

FlowRouter.route('/project/:id', {
    name: 'Project',
    action(){
        checkAuth();
        mount(App, {
            content: <SingleProject/>,
            login: true
        })
    }
});

FlowRouter.route('/admin', {
    name: 'Admin',
    action(){
        checkAuth();
        mount(App, {
            content: <AdminPage/>,
            login: true
        })
    }
});

FlowRouter.route('/account', {
    name: 'User',
    action(){
        checkAuth();
        mount(App, {
            content: <UserAccount/>,
            login: true
        })
    }
});

FlowRouter.notFound = {
    action() {
        FlowRouter.go("Root");
    }
};

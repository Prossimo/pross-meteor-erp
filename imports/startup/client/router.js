import React from 'react';
import {mount} from 'react-mounter';
import {FlowRouter} from 'meteor/kadira:flow-router';

import App from '../../api/composer/App';
import AuthenticationPage from '../../ui/pages/AuthenticationPage';
import AdminPage from '../../api/composer/pages/AdminPage';
import SingleProject from '../../api/composer/componencts/project/SingleProject';
import ProjectsPage from '../../api/composer/pages/ProjectsPage';
import UserAccount from '../../ui/pages/UserAccount';
import Inbox from '../../ui/pages/InboxPage';

function checkAuth() {
    if(!Meteor.userId()) FlowRouter.go("Root");
}

FlowRouter.route('/', {
    name: 'Root',
    action(){
        if(Meteor.userId()){
            mount(App, {
                content: <ProjectsPage/>,
            })
        }else{
            mount(App, {
                content: <AuthenticationPage/>,
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
        })
    }
});

FlowRouter.route('/inbox', {
    name: 'Inbox',
    action(){
        checkAuth();
        mount(App, {
            content: <Inbox/>,
        })
    }
});

FlowRouter.route('/admin', {
    name: 'Admin',
    action(){
        checkAuth();
        mount(App, {
            content: <AdminPage/>,
        })
    }
});

FlowRouter.route('/account', {
    name: 'User',
    action(){
        checkAuth();
        mount(App, {
            content: <UserAccount/>,
        })
    }
});

FlowRouter.notFound = {
    action() {
        FlowRouter.go("Root");
    }
};

FlowRouter.route('/auth/google/callback', {
    name: 'GoogleCallback',
    action() {
        window.close();
        window.opener.postMessage(FlowRouter.getQueryParam('code'), "http://localhost:3000");
    }
})
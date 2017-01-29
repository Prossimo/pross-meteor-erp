import React from 'react';
import {mount} from 'react-mounter';
import {FlowRouter} from 'meteor/kadira:flow-router';

import App from '../../api/composer/App';
import AuthenticationPage from '../../ui/pages/AuthenticationPage';
import HomePage from '../../api/composer/pages/HomePage';

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

FlowRouter.notFound = {
    action() {
        FlowRouter.go("Root");
    }
};

import React from 'react';
import {mount} from 'react-mounter';
import {FlowRouter} from 'meteor/kadira:flow-router';

import App from '../../api/composer/App';
import AuthenticationPage from '../../ui/pages/AuthenticationPage';
import SingleDeal from '../../api/composer/componencts/project/SingleProject';
import DealPage from '/imports/ui/pages/DealPage';
import UserAccount from '../../ui/pages/UserAccount';
import InboxPage from '../../ui/pages/InboxPage';
import InboxSettingsPage from '../../ui/pages/InboxSettingsPage';
import LeadsPage from '/imports/ui/pages/LeadsPage';
import OrdersPage from '/imports/ui/pages/OrdersPage';
import TicketsPage from '/imports/ui/pages/TicketsPage';
import ContactsPage from '/imports/ui/pages/ContactsPage';
import FinancialPage from '/imports/ui/pages/FinancialPage';
import OpportunitiesPage from '/imports/ui/pages/OpportunitiesPage';
import ProjectsPage from '/imports/ui/pages/ProjectsPage';
import AdminPage from '/imports/ui/pages/AdminPage';
import DashboardPage from '/imports/ui/pages/DashboardPage';
import SingleProjectPage from '/imports/ui/components/project/SingleProject';

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

FlowRouter.route('/dashboard', {
    name: 'Dashboard',
    action(){
        checkAuth();
        mount(App, {
            //todo create Dashboard page component
            content: <DashboardPage/>,
        })
    }
});

FlowRouter.route('/account', {
    name: 'Account',
    action(){
        checkAuth();
        mount(App, {
            content: <UserAccount/>,
        })
    }
});

FlowRouter.route('/inbox', {
    name: 'Inbox',
    action(){
        checkAuth();
        mount(App, {
            content: <InboxPage/>,
        })
    }
});

FlowRouter.route('/inbox_settings', {
    name: 'InboxSettings',
    action(){
        checkAuth();
        mount(App, {
            content: <InboxSettingsPage/>,
        })
    }
});

FlowRouter.route('/projects', {
    name: 'Projects',
    action() {
        checkAuth();
        mount(App, {
            content: <ProjectsPage/>
        })
    }
})

FlowRouter.route('/project/:id', {
    name: 'Project',
    action() {
        checkAuth();
        mount(App, {
            content: <SingleProjectPage/>
        });
    }
})

FlowRouter.route('/Deal/:id', {
    name: 'SalesRecord',
    action(){
        checkAuth();
        mount(App, {
            content: <SingleSalesRecord/>,
        })
    }
});

FlowRouter.route('/leads', {
    name: 'Leads',
    action(){
        checkAuth();
        mount(App, {
            content: <LeadsPage/>,
        })
    }
});

FlowRouter.route('/opportunities', {
    name: 'Opportunities',
    action() {
        checkAuth();
        mount(App, {
            content: <OpportunitiesPage/>
        })
    }
})

FlowRouter.route('/orders', {
    name: 'Orders',
    action(){
        checkAuth();
        mount(App, {
            content: <OrdersPage/>,
        })
    }
});

FlowRouter.route('/tickets', {
    name: 'Tickets',
    action(){
        checkAuth();
        mount(App, {
            content: <TicketsPage/>,
        })
    }
});

FlowRouter.route('/contacts', {
    name: 'Contacts',
    action(){
        checkAuth();
        mount(App, {
            content: <ContactsPage/>,
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

FlowRouter.route('/financial', {
    name: 'Financial',
    action(){
        checkAuth();
        mount(App, {
            content: <FinancialPage/>,
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
        window.opener.postMessage(JSON.stringify({googleAuthCode:FlowRouter.getQueryParam('code')}), Meteor.absoluteUrl());
    }
})

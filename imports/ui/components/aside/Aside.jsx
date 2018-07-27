import React, { Component } from 'react'
import { Roles } from 'meteor/alanning:roles'
import { FlowRouter } from 'meteor/kadira:flow-router'
import classNames from 'classnames'
import findIndex from 'lodash/findIndex'
import '../popup/PopoverStore'
import { ROLES } from '/imports/api/models'

const pages = [{
        label: 'Dashboard',
        route: 'Dashboard'
    }, {
        label: 'Inbox',
        route: 'Inbox'
    },
    {
        label: 'Projects',
        route: 'Projects',
    },
    {
        label: 'Deals',
        route: 'Deals',
        subItems: [{
                label: 'Leads',
                route: 'Leads'
            },
            {
                label: 'Opportunities',
                route: 'Opportunities'
            },
            {
                label: 'Orders',
                route: 'Orders'
            },
            {
                label: 'Tickets',
                route: 'Tickets'
            },
        ]
    },
    {
        label: 'Contacts',
        subItems: [{
                label: 'People',
                route: 'People'
            },
            {
                label: 'Companies',
                route: 'Companies'
            },
            {
                label: 'Email Contacts',
                route: 'Contacts'
            }

        ]
    },
    {
        label: 'Financial',
        route: 'Financial'
    },
    {
        label: 'Settings',
        subItems: [{
                label: 'Account',
                route: 'Account'
            },
            {
                label: 'Inbox',
                route: 'InboxSettings'
            },
        ]
    }
]

class NavigationItem extends Component{

    toggleTopMenu = () => {
        const { item } = this.props

        const $subMenu = $(this.subMenu)
        const $siblings = $subMenu.parent().siblings('.top-nav-item')

        $siblings.find('.sub-nav-items').slideUp()
        $siblings.removeClass('active')
        $subMenu.slideToggle()
        $subMenu.parent().toggleClass('active')

        this.goToRoute(item.route)

    }

    goToRoute = (route) => {
        if (!route) return
        if (typeof route === 'string') {
            FlowRouter.go(FlowRouter.path(route))
        } else {
            FlowRouter.go(FlowRouter.path(route.name, route.params))
        }
    }

    renderTopLevelItem = (item) => {
        const subItemList = item.subItems.map(this.renderLowLevelItem)
        const routesList = item.subItems.map(item => typeof item.route === 'string' ? item.route : item.route.name )
        const curRouteName = FlowRouter.getRouteName()
        return (
            <li className={classNames( 'top-nav-item', { 'active': curRouteName===item.route})}>
                <div onClick={() => this.toggleTopMenu()} className={classNames( 'nav-item-label', {
                    'active': routesList.indexOf(curRouteName) > -1 || curRouteName === item.route})}
                >
                    {item.label}
                </div>
                <ul className="sub-nav-items" ref={node => this.subMenu = node}>{subItemList}</ul>
            </li>
        )
    }

    renderLowLevelItem = (item, index) => {
        const curRouteName = FlowRouter.getRouteName()
        const isActive = typeof item.route === 'string' ? curRouteName === item.route :
            curRouteName === item.route.name && FlowRouter.current().params.id === item.route.params.id
        return (
            <li key={item.label + index}
                onClick={() => this.goToRoute(item.route)}
                className={classNames('sub-item', {'active': isActive})}
            >{item.label}</li>
        )
    }

    renderSimpleItem = ({ route, label }) => {
        return (
            <li onClick={() => this.goToRoute(route)}
                className={classNames('nav-item', {'active': FlowRouter.getRouteName() === route})}
            >{label}</li>
        )
    }

    render(){
        const { item } = this.props

        if (item.subItems) {
            return this.renderTopLevelItem(item)
        } else {
            return this.renderSimpleItem(item)
        }

    }
}

class Aside extends React.Component{
    constructor(props){
        super(props)

        const settingsItemIndex = findIndex(pages, {label: 'Settings'})
        if (settingsItemIndex) {
            //admin & super admin & employer allow
            if(Roles.userIsInRole(props.currentUser._id, [ROLES.ADMIN, ROLES.SALES])) {
                pages[settingsItemIndex].subItems.push({
                    label: 'Admin',
                    route: 'Admin'
                })
            }
            if(Roles.userIsInRole(props.currentUser._id, [ROLES.ADMIN])) {
                pages[settingsItemIndex].subItems.push({
                    label: 'Google Drive',
                    route: 'GoogleDriveSettings'
                }, {
                    label: 'Slack Channel',
                    route: 'SlackChannelSettings'
                })
            }
        }

    }

    renderList = () => {
        return (
            <nav className="nav-list">
                <ul>
                    {pages.map((item, index) => <NavigationItem key={index} item={item}/>)}
                </ul>
            </nav>
        )
    }

    render() {
        const { currentUser } = this.props
        return (
            <aside className={classNames('control-aside',{'active': currentUser})}>
                {this.renderList()}
            </aside>
        )
    }

}
export default Aside

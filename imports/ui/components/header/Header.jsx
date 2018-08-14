import React, { Component } from 'react'
import {FlowRouter} from 'meteor/kadira:flow-router'
import {Roles} from 'meteor/alanning:roles'
import {NavLink} from 'react-router-dom'
import findIndex from 'lodash/findIndex'
import {
    Navbar,
    NavDropdown,
    Nav,
    NavItem,
} from 'react-bootstrap'
import {ROLES} from '/imports/api/models'
import {PAGES} from '/imports/utils/constants'
import {getUserName, getAvatarUrl} from '/imports/api/lib/filters'

class Header extends Component {
    state = {
        pages: PAGES
    }

    componentDidMount() {
        this.setState({pages: this.addAdminMenu(PAGES)})
    }

    addAdminMenu = (pages) => {
        const { user = {}} = this.props
        const settingsItemIndex = findIndex(pages, { label: 'Settings' })
        if (settingsItemIndex) {
            //admin & super admin & employer allow
            if (Roles.userIsInRole(user._id, [ROLES.ADMIN, ROLES.SALES])) {
                pages[settingsItemIndex].subItems.push({
                    label: 'Admin',
                    route: 'Admin'
                })
            }
            if (Roles.userIsInRole(user._id, [ROLES.ADMIN])) {
                pages[settingsItemIndex].subItems.push({
                    label: 'Google Drive',
                    route: 'GoogleDriveSettings'
                }, {
                        label: 'Slack Channel',
                        route: 'SlackChannelSettings'
                    })
            }
        }
        return pages
    }

    logout = () => {
        Meteor.logout((err) => {
            console.error(err)
            if(!err) {
                FlowRouter.reload()
            }
        })
    }

    goToRoute = (route) => {
        if (!route) return
        if (typeof route === 'string') {
            FlowRouter.go(FlowRouter.path(route))
        } else {
            FlowRouter.go(FlowRouter.path(route.name, route.params))
        }
    }

    renderSubMenu = (label, route, subItems, key) => {
        return (
            <NavDropdown title={label} as={NavLink} to={route} onClick={() => this.goToRoute(route)} key={key} id={`dropdown-${route}`}>
                {this.renderMenu(subItems)}
            </NavDropdown>
        )
    }

    renderMenu = (items) => {
        return items.map(({ route, subItems, label }, index) => subItems
            ? this.renderSubMenu(label, route, subItems, index)
            : <NavItem key={index} as={NavLink} to={route} onClick={() => this.goToRoute(route)}>{label}</NavItem>)
    }

    render() {
        const { user } = this.props
        const { pages } = this.state
        const userName = user ? getUserName(user, true) : ''
        return user ? (
                <Navbar fixedTop fluid inverse>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <a href="/">MavricCRM</a>
                        </Navbar.Brand>
                    </Navbar.Header>
                    <Nav>
                        {this.renderMenu(pages)}
                    </Nav>
                    <Nav pullRight>
                        <NavItem onClick={this.logout}>
                            <i className="fa fa-sign-out" />
                        </NavItem>
                    </Nav>
                    <Navbar.Text pullRight className="user-info">
                        <img src={getAvatarUrl(user)} alt={userName} />
                        <span className="username">{userName}</span>
                    </Navbar.Text>
                </Navbar>
        ) : null
    }
}




export default Header
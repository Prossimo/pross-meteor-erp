import React, { Component } from 'react'
import {FlowRouter} from 'meteor/kadira:flow-router'
import {NavLink} from 'react-router-dom'
import classNames from 'classnames'
import {
    Navbar,
    NavDropdown,
    Nav,
    NavItem,
    // NavText,
    MenuItem
} from 'react-bootstrap'
import {PAGES} from '/imports/utils/constants'
import {getUserName, getAvatarUrl} from '/imports/api/lib/filters'

class Header extends Component {

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
        return user ? (
                <Navbar fixedTop fluid inverse>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <a href="/">MavricCRM</a>
                        </Navbar.Brand>
                    </Navbar.Header>
                    <Nav>
                        {this.renderMenu(PAGES)}
                    </Nav>
                    <Nav pullRight>
                        <NavItem onClick={this.logout}>
                            <i className="fa fa-sign-out" />
                        </NavItem>
                    </Nav>
                    <Navbar.Text pullRight className="user-info">
                        <img src={getAvatarUrl(user)} alt={getUserName(user, true)} />
                        <span className="username">{getUserName(user, true)}</span>
                    </Navbar.Text>
                </Navbar>
        ) : null
    }
}




export default Header
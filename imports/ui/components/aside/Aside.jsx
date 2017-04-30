import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames from 'classnames';
import { EMPLOYEE_ROLE, ADMIN_ROLE_LIST } from '../../../api/constants/roles';
import Dialer from '../dialer/Dialer';
import '../popup/PopoverStore';
import PopoverActions from '../popup/PopoverActions';


class NavigationItem extends React.Component{
    constructor(){
        super();
    }

    toggleTopMenu(event) {
        const { subMenu } = this.refs;
        $(subMenu).parent().siblings('.top-nav-item').find('.sub-nav-items').slideUp();
        $(subMenu).parent().siblings('.top-nav-item').removeClass('active');
        $(subMenu).slideToggle();
        $(subMenu).parent().toggleClass('active');
    }

    goToRoute(route){
        if(typeof route === 'string') FlowRouter.go(FlowRouter.path(route));
        else FlowRouter.go(FlowRouter.path(route.name, route.params));
    }

    renderTopLevelItem(item){
        const subItemList = item.subItems.map((subItem,index)=>this.renderLowLevelItem(subItem,index));
        const routesList = item.subItems.map(item=>typeof item.route === 'string' ? item.route : item.route.name );

        return (
            <li className="top-nav-item">
                <div onClick={this.toggleTopMenu.bind(this)}
                      className={classNames("nav-item-label",{"active": routesList.indexOf(FlowRouter.getRouteName())>-1})}>{item.label}</div>
                <ul className="sub-nav-items" ref="subMenu">{subItemList}</ul>
            </li>
        )
    }

    renderLowLevelItem(item,index){
        const isActive = typeof item.route === 'string' ?
            FlowRouter.getRouteName() === item.route :
            FlowRouter.getRouteName() === item.route.name && FlowRouter.current().params.id === item.route.params.id;
        return (
            <li key={item.label+index}
                onClick={this.goToRoute.bind(this,item.route)}
                className={classNames("sub-item", {"active": isActive})}
            >{item.label}</li>
        )
    }

    renderSimpleItem(item){
        return (
            <li onClick={this.goToRoute.bind(this,item.route)}
                className={classNames("nav-item", {"active": FlowRouter.getRouteName() === item.route})}
            >{item.label}</li>
        )
    }

    render(){
        const { item } = this.props;

        if(item.topLevel) return this.renderTopLevelItem(item);

        else return this.renderSimpleItem(item);
    }
}

class Aside extends React.Component{
    constructor(props){
        super(props);

        this.pages = [
            {
                label: "Dashboard",
                route: "Dashboard"
            },
            {
                label: 'Projects',
                route: 'Projects',
            },
            {
                label: "Deals",
                topLevel: true,
                subItems: [
                    {
                        label: "Leads",
                        route: "Leads"
                    },
                    {
                        label: "Opportunities",
                        route: "Opportunities"
                    },
                    {
                        label: "Orders",
                        route: "Orders"
                    },
                    {
                        label: "Tickets",
                        route: "Tickets"
                    },
                ]
            },
            {
                label: "Contacts",
                route: "Contacts"
            },
            {
                label: "Financial",
                route: "Financial"
            },
            {
                label: "Settings",
                topLevel: true,
                subItems: [
                    {
                        label: "Account",
                        route: "Account"
                    },
                    {
                        label: "Inbox",
                        route: "InboxSettings"
                    }
                ]
            }
        ];

        //admin & super admin & employer allow
        if(Roles.userIsInRole(props.currentUser._id, [EMPLOYEE_ROLE,...ADMIN_ROLE_LIST])){
            this.pages = this.pages.map(item=>{
                if(item.label === "Settings"){
                    item.subItems.push({
                        label: "Admin",
                        route: "Admin"
                    })
                }
                return item;
            });
            this.pages.unshift({
                label: "Inbox",
                route: "Inbox"
            })
        }
        //admin & super admin allow
        //if(Roles.userIsInRole( props.currentUser._id, [...ADMIN_ROLE_LIST] )){
            //this.pages.splice(4,0,{
                //label: "Projects",
                //topLevel: true,
                //routes: 'Projects',
                //subItems: [],
            //});
        //}
    }

    renderList(){
        return (
            <nav className="nav-list">
                <ul>
                    {this.pages.map((item,index)=><NavigationItem key={item.label+item.index}
                                                                  item={item}/>)}
                </ul>
            </nav>
        )
    }

    render() {
        const { currentUser } = this.props;
        return (
            <aside className={classNames("control-aside",{"active": currentUser})}>
                {this.renderList()}

                <div className="call-phone" onClick={this.onClickCall}><i className="fa fa-phone"></i></div>

            </aside>
        )
    }

    onClickCall = (evt) => {
        const clientRect = evt.currentTarget.getBoundingClientRect();

        PopoverActions.openPopover(
            <Dialer />,
            {originRect: clientRect, direction: 'up'}
        )

    }
}
export default Aside

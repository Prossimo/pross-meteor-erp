import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames from 'classnames';
import { EMPLOYEE_ROLE, ADMIN_ROLE_LIST } from '../../../api/constants/roles';


class Aside extends React.Component{
    constructor(props){
        super(props);

        this.pages = [
            {
                label: "Projects",
                route: "Root"
            },
            {
                label: "Account",
                route: "User"
            },
        ];
        if(Roles.userIsInRole(props.currentUser._id, [EMPLOYEE_ROLE,...ADMIN_ROLE_LIST])){
            this.pages.push({
                label: "Inbox",
                route: "Inbox"
            })
        }

        if(Roles.userIsInRole( props.currentUser._id, [...ADMIN_ROLE_LIST] )){
            this.pages.push({
                label: "Admin",
                route: "Admin"
            })
        }
    }


    togglePage(item){
        FlowRouter.go(FlowRouter.path(item.route))
    }

    renderList(){
        return (
            <nav className="nav-list">
                <ul>
                    {this.pages.map(item=>{
                        return (
                            <li key={item.label}
                                onClick={this.togglePage.bind(this, item)}
                                className={classNames("nav-item", {"active": FlowRouter.getRouteName() === item.route})}
                            >{item.label}</li>
                        )
                    })}
                </ul>
            </nav>
        )
    }

    render() {
        const { currentUser } = this.props;
        return (
            <aside className={classNames("control-aside",{"active": currentUser})}>
                {this.renderList()}
            </aside>
        )
    }
}
export default Aside
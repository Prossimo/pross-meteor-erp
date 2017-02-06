import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames from 'classnames';
import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from '../../../api/constatnts/roles';


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
            {
                label: "Companies",
                route: "Companies"
            }
        ];

        if(Roles.userIsInRole( props.currentUser._id, [ADMIN_ROLE,SUPER_ADMIN_ROLE] )){
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
        return (
            <aside className="control-aside active">
                {this.renderList()}
            </aside>
        )
    }
}
export default Aside
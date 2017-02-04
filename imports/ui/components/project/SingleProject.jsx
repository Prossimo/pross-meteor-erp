import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames from 'classnames';
import { getUserName, getUserEmail } from '../../../api/lib/filters';

import Activity from '../home/Activity';

class SingleProject extends React.Component{
    constructor(props){
        super(props);

        this.tabs = [
            {
                label: "Activity",
                component: <Activity/>
            },
            {
                label: "Quotes",
                content: <p>Quotes</p>
            },
            {
                label: "Details",
                content: <p>Details</p>
            },
            {
                label: "Invoices",
                content: <p>Invoices</p>
            },
            {
                label: "Documents",
                content: <p>Documents</p>
            }
        ];

        this.state = {
            activeTab: this.tabs[0]
        }
    }


    toggleTab(activeTab){
        this.setState({activeTab})
    }

    getTabs(){
        const { activeTab } = this.state;

        return <ul>
            {this.tabs.map(item=>{
                return (
                    <li key={item.label}
                        onClick={this.toggleTab.bind(this, item)}
                        className={classNames({"active": item === activeTab})}
                    >{item.label}</li>
                )
            })}
        </ul>
    }

    getContent(){
        const { activeTab } = this.state;
        if(activeTab.component){
            return React.cloneElement(activeTab.component, this.props);
        }else{
            return activeTab.content
        }
    }

    renderProjectMembers(){
        const { users } = this.props;

        return (
            <ul className="project-members">
                {users.map(user=>{
                    return(
                        <li key={user._id} className="user-list">

                                <span className="username"> {getUserName(user, true)} </span>
                                <span className="email">{getUserEmail(user)}</span>

                        </li>
                    )
                })}
            </ul>
        )

    }

    render() {
        const { project } = this.props;
        const sidebarTitle = "Project members";
        return (
            <div className="page-container single-project">
                <div className="main-content">
                    <div className="tab-container">
                        <h2 className="page-title">{project.name}</h2>
                        <div className="tab-controls">
                            {this.getTabs()}
                        </div>
                        <div className="tab-content">
                            {this.getContent()}
                        </div>
                    </div>
                </div>
                <aside className="right-sidebar">
                    <h2 className="title">{sidebarTitle}</h2>
                    {this.renderProjectMembers()}
                </aside>
            </div>
        )
    }
}
export default SingleProject;
import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames from 'classnames';
import { getUserName, getUserEmail } from '../../../api/lib/filters';
import Select from 'react-select';
import { ADMIN_ROLE_LIST } from '../../../api/constatnts/roles';
import Popup from '../popup/Popup';
import ContactInfo from '../account/ContactInfo';
import Quotes from './Quotes';

import Activity from './Activity';

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
                content: <Quotes/>
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
            activeTab: this.tabs[0],
            addUserFormActive: false,
            showPopup: false,
            popupData: null,
            selectUsers: props.users.map(item=>{
                if(props.project.members && props.project.members.indexOf(item._id)>-1)
                return{
                    label: getUserName(item, true),
                    value: item._id,
                }
            }),
            selectOptions: props.users.map(item=>{
                return {
                    label: getUserName(item, true),
                    value: item._id,
                }
            })
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
        const { users, project } = this.props;

        return (
            <ul className="project-members">
                {users.map(user=>{
                    if(project.members && project.members.indexOf(user._id)>-1)
                    return(
                        <li key={user._id}
                            onClick={this.showUserInfo.bind(this, user)}
                            className="user-list">
                                <span className="username"> {getUserName(user, true)} </span>
                                <span className="email">{getUserEmail(user)}</span>

                        </li>
                    )
                })}
            </ul>
        )
    }

    renderAddUserForm(){
        const { addUserFormActive, selectOptions, selectUsers } = this.state;
        if(Roles.userIsInRole(Meteor.userId(), ADMIN_ROLE_LIST))
        return(
            <div>
                <button className="add-user-btn" onClick={this.toggleAddUserForm.bind(this)}/>
                <div className={classNames("add-user-form",{"active": addUserFormActive})}>
                    <div className="select-wrap">
                        <span className="label">Select users</span>
                        <Select
                            multi
                            value={selectUsers}
                            onChange={this.changeSelectUser.bind(this)}
                            options={selectOptions}
                            className={"members-select"}
                            clearable={false}
                        />
                        <button onClick={this.assignUsers.bind(this)} className="btn primary-btn">Update</button>
                        <button onClick={this.hideForm.bind(this)} className="btn default-btn">Cancel</button>
                    </div>
                </div>
            </div>
        )
    }

    hideForm(){
        this.setState({addUserFormActive: false})
    }

    toggleAddUserForm(){
        const { addUserFormActive } = this.state;
        this.setState({addUserFormActive: !addUserFormActive})
    }

    changeSelectUser(value){
        this.setState({selectUsers: value})
    }

    assignUsers(){
        const { selectUsers } = this.state;
        const { project } = this.props;
        Meteor.call("assignUsersToProject", project._id, selectUsers.map(item=>item.value), (err,res)=>{
            if(err) return console.log(err);
            this.setState({addUserFormActive: false})
        })
    }

    hidePopup(){
        this.setState({showPopup: false, popupData: null})
    }

    showUserInfo(user){
        this.setState({
            showPopup: true,
            popupData: <ContactInfo user={user}
                                    editable={Roles.userIsInRole(Meteor.userId(), ADMIN_ROLE_LIST)}/>})
    }

    renderPopup(){
        const { popupData, showPopup } = this.state;
        return <Popup active={showPopup}
                      hide={this.hidePopup.bind(this)}
                      content={popupData}/>
    }

    render() {
        const { project } = this.props;
        const sidebarTitle = "Project members";
        return (
            <div className="page-container single-project">
                {this.renderPopup()}
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
                    <div className="header-control">
                        <h2 className="title">{sidebarTitle}</h2>
                        {this.renderAddUserForm()}
                    </div>
                    {this.renderProjectMembers()}
                </aside>
            </div>
        )
    }
}
export default SingleProject;
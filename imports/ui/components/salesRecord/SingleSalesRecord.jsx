import React from 'react';
import classNames from 'classnames';
import { ADMIN_ROLE_LIST, EMPLOYEE_ROLE, ADMIN_ROLE } from '/imports/api/constants/roles';
import { DESIGNATION_LIST, STAKEHOLDER_CATEGORY } from '/imports/api/constants/project';
import { getUserName, getUserEmail } from '/imports/api/lib/filters';
import { info, warning } from '/imports/api/lib/alerts'
import ContactStore from '../../../api/nylas/contact-store'
import Select from 'react-select';
import Popup from '../popup/Popup';
import ContactInfo from '../account/ContactInfo';
import Quotes from './Quotes';
import Details from './Details';
import Activity from './Activity';
import Tasks from '../libs/Tasks';
import Files from '../libs/Files';
import Invoices from './Invoices';
import Documents from './Documents';
import Conversations from './Conversations';

class SingleSalesRecord extends React.Component{
  constructor(props){
    super(props);
    this.tabs = [
      {
        label: "Activity",
        component: <Activity/>
      },
      {
        label: "Quotes",
        component: <Quotes/>
      },
      {
        label: "Conversations",
        component: <Conversations/>
      },
      {
        label: "Details",
        component: <Details/>
      },
      {
        label: "Invoices",
        component: <Invoices/>
      },
      {
        label: "Files",
        component: <Files type='salesRecord'/>
      },
      {
        label: 'Tasks',
        component: <Tasks projectId={props.salesRecord._id}/>
      }
    ];

    this.state = {
      activeTab: this.tabs.find(tab=>tab.label === "Activity"),
      showPopup: false,
      popupData: null,
      member: {
        selectedUser: null,
        selectedCategory: [],
        selectedDesignation: null,
      },
      stakeholder: {
        selectedContact: null,
        selectedCategory: [],
        selectedDesignation: null,
        notify: true,
      }
    }

    this.renderAddMemberForm = this.renderAddMemberForm.bind(this);
    this.renderAddMemberForm = this.renderAddMemberForm.bind(this);
    this.changeState = this.changeState.bind(this);
    this.addMember = this.addMember.bind(this);
    this.addStakeholder = this.addStakeholder.bind(this);
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
  //todo change style
  renderProjectMembers(){
    const { salesRecord } = this.props;
    if(!salesRecord )return null;
    return (
      <ul className="project-members">
        {_.isArray(salesRecord.members) && salesRecord.members.map(member=>{
          if(!member.user) return null;
          return(
            <li key={member.user._id}
                className="member-list">

                            <span onClick={this.showUserInfo.bind(this, member.user)}
                                  className={classNames("memberName", {"main": member.isMainStakeholder}) }>
                                {getUserName(member.user, true)}</span>
                <span className="email">{getUserEmail(member.user)}</span>
                <div>
                  {member.category.map(cat=>{
                    return <span className="member-cat" key={`${cat}${member.user._id}`}>{cat}</span>
                  })}
                </div>
            </li>
          )
        })}
      </ul>
    )
  }

  changeState(subState, propName, propValue) {
    subState[propName] = propValue;
    this.setState((prevState)=> prevState);
  }

  renderAddStakeholderForm() {
    const { stakeholder: { selectedContact, selectedCategory, selectedDesignation, notify}} = this.state;
    const designationOptions = DESIGNATION_LIST.map(item=>({label: item, value: item}));
    const categoryOptions = STAKEHOLDER_CATEGORY.map(item=>({label: item, value: item}));
    const selectContactOptions = ContactStore.getContacts(1)
      .filter(({ _id })=> !this.props.salesRecord.stakeholders.map(({ contactId })=> contactId).includes(_id))
      .map(({ _id, name, email }) => ({
          label: `${email}`,
          value: _id,
      }));

    if(Roles.userIsInRole(Meteor.userId(), ADMIN_ROLE_LIST)) {
        return (
            <div className='form'>
                <div className='form-group'>
                    <Select
                      value={selectedContact}
                      placeholder="Choose stakeholder"
                      onChange={(item)=> this.changeState(this.state.stakeholder, 'selectedContact', item)}
                      options={selectContactOptions}
                      className={"members-select"}
                      clearable={false}
                    />
                </div>
                <div className="form-group">
                    <Select
                      value={selectedDesignation}
                      placeholder="Stakeholder designation"
                      onChange={(item)=> this.changeState(this.state.stakeholder, 'selectedDesignation', item)}
                      options={designationOptions}
                      className={"members-select"}
                      clearable={false}
                    />
                </div>
                <div className="form-group">
                    <Select
                      multi
                      placeholder="Stakehoder categories"
                      value={selectedCategory}
                      onChange={(item)=> this.changeState(this.state.stakeholder, 'selectedCategory', item)}
                      options={categoryOptions}
                      className={"members-select"}
                      clearable={false}
                    />
                </div>
                <div className="checkbox">
                    <label><input
                        type="checkbox"
                        value=""
                        checked={ notify }
                        onChange={(event)=> this.changeState(this.state.stakeholder, 'notify', event.target.checked)}/>
                        Notify
                    </label>
                </div>
                <button onClick={this.addStakeholder} className="btnn primary-btn">Add Stakeholder</button>
            </div>
        )
    }
  }

  renderAddMemberForm(){
    const { salesRecord, users } = this.props;
    const { member: { selectedUser, selectedCategory, selectedDesignation }} = this.state;
    const designationOptions = DESIGNATION_LIST.map(item=>({label: item, value: item}));
    const categoryOptions = STAKEHOLDER_CATEGORY.map(item=>({label: item, value: item}));
    const membersIds = salesRecord.members.map(i=>i.userId);
    const selectOptions = users
      .filter(user => membersIds.indexOf(user._id)<0) // do not contain current user
      .filter(user => Roles.userIsInRole(user._id, [ EMPLOYEE_ROLE, ADMIN_ROLE ])) // must be admin or employee
      .map(user=>{
        return {
          label: `${getUserName(user, true)} ${getUserEmail(user)}`,
          value: user._id,
        }
      });
    if(Roles.userIsInRole(Meteor.userId(), ADMIN_ROLE_LIST))
      return(
        <div>
            <div className="form">
                <div className="form-group">
                    <Select
                      value={selectedUser}
                      placeholder="Choose user"
                      onChange={(item)=> this.changeState(this.state.member, 'selectedUser', item)}
                      options={selectOptions}
                      className={"members-select"}
                      clearable={false}
                    />
                </div>
                <div className="form-group">
                    <Select
                      value={selectedDesignation}
                      placeholder="User designation"
                      onChange={(item)=> this.changeState(this.state.member, 'selectedDesignation', item)}
                      options={designationOptions}
                      className={"members-select"}
                      clearable={false}
                    />
                </div>
                <div className="form-group">
                    <Select
                      multi
                      placeholder="User categories"
                      value={selectedCategory}
                      onChange={(item)=> this.changeState(this.state.member, 'selectedCategory', item)}
                      options={categoryOptions}
                      className={"members-select"}
                      clearable={false}
                    />
                </div>
                <button onClick={this.addMember} className="btnn primary-btn">Add member</button>
            </div>
        </div>
      )
  }

  addStakeholder() {
    const { stakeholder: { selectedContact, selectedDesignation, selectedCategory, notify } } = this.state;
    const { salesRecord } = this.props;
    if(_.isNull(selectedContact)) return warning("Choose stakeholder");
    const stakeholder = {
      contactId: selectedContact.value,
      destination: _.isNull(selectedDesignation) ? null : selectedDesignation.value,
      category: selectedCategory.map(item => item.value),
      notify,
    };
    Meteor.call('addStakeholderToSalesRecord', salesRecord._id, stakeholder, (error, result)=> {
      if(error) return warning(error.reason? error.reason : 'Add member failed!');
      this.setState({
        stakeholder: {
          notify: true,
          selectedContact: null,
          selectedDesignation: null,
          selectedCategory: [],
        }
      });
      info("Add stakeholder to salesRecord success!");
    })
  }

  addMember(){
    const { member: { selectedUser, selectedDesignation, selectedCategory }} = this.state;
    const { salesRecord } = this.props;
    if(_.isNull(selectedUser)) return warning("Choose user");

    const member = {
      userId: selectedUser.value,
      isMainStakeholder: false,
      destination: _.isNull(selectedDesignation) ? null : selectedDesignation.value,
      category: selectedCategory.map(i=>i.value)
    };

    Meteor.call('addMemberToProject', salesRecord._id, member, err=>{
      if(err) return warning(err.reason? err.reason : "Add member failed!");
      this.setState({
        member: {
          selectedUser: null,
          selectedDesignation: null,
          selectedCategory: []
        }
      });
      info("Add member to salesRecord success!");
    });

    Meteor.call("addUserToSlackChannel", member.userId, salesRecord.slackChanel, err=>{
      if(err) return warning(err.error);
      info("User success add to slack channel!");
    })
  }

  hidePopup(){
    this.setState({showPopup: false, popupData: null})
  }

  showUserInfo(user){
    this.setState({
      showPopup: true,
      popupData: <ContactInfo user={user}
                              hide={this.hidePopup.bind(this)}
                              editable={Roles.userIsInRole(Meteor.userId(), ADMIN_ROLE_LIST)}/>})
  }

  renderPopup(){
    const { popupData, showPopup } = this.state;
    return <Popup active={showPopup}
                  title="User info"
                  hide={this.hidePopup.bind(this)}
                  content={popupData}/>
  }

  render() {
    const { salesRecord } = this.props;
    const sidebarTitle = "SalesRecord members";
    const projectName = salesRecord.name;
    return (
      <div className="page-container single-project">
        {this.renderPopup()}
          <div className="main-content">
              <div className="tab-container">
                  <h2 className="page-title">{projectName}</h2>
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
              </div>
            <div className='panel panel-default'>
                <div className='panel-heading'>Add Member</div>
                <div className='panel-body'>
                    {this.renderAddMemberForm()}
                </div>
            </div>
            <div className='panel panel-default'>
                <div className='panel-heading'>Add Stakehoder</div>
                <div className='panel-body'>
                    {this.renderAddStakeholderForm()}
                </div>
            </div>
            {this.renderProjectMembers()}
          </aside>
      </div>
    )
  }
}
export default SingleSalesRecord;

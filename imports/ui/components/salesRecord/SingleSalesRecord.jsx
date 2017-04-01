import React from 'react';
import classNames from 'classnames';
import { ADMIN_ROLE_LIST } from '/imports/api/constants/roles';
import { DESIGNATION_LIST, STAKEHOLDER_CATEGORY } from '/imports/api/constants/project';
import { getUserName, getUserEmail } from '/imports/api/lib/filters';
import { info, warning } from '/imports/api/lib/alerts'
import Select from 'react-select';
import Popup from '../popup/Popup';
import ContactInfo from '../account/ContactInfo';
import Quotes from './Quotes';
import Details from './Details';
import Activity from './Activity';
import Tasks from './Tasks';
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
      }
    ];

    this.state = {
      activeTab: this.tabs.find(tab=>tab.label === "Activity"),
      showPopup: false,
      popupData: null,
      selectUser: null,
      selectedCategory: [],
      selectedDesignation: null,
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

  changeDesignation(selectedDesignation){
    this.setState({selectedDesignation});
  }

  changeCategory(selectedCategory){
    this.setState({selectedCategory});
  }

  renderAddUserForm(){
    const { salesRecord, users } = this.props;
    const { selectUser, selectedCategory, selectedDesignation} = this.state;
    const designationOptions = DESIGNATION_LIST.map(item=>({label: item, value: item}));
    const categoryOptions = STAKEHOLDER_CATEGORY.map(item=>({label: item, value: item}));
    const membersIds = salesRecord.members.map(i=>i.userId);
    const selectOptions = users
      .filter(user=>membersIds.indexOf(user._id)<0)
      .map(user=>{
        return {
          label: `${getUserName(user, true)} ${getUserEmail(user)}`,
          value: user._id,
        }
      });
    if(Roles.userIsInRole(Meteor.userId(), ADMIN_ROLE_LIST))
      return(
        <div>
            <div className="add-member-form">
                <div className="select-wrap">
                    <Select
                      value={selectUser}
                      placeholder="Choose user"
                      onChange={this.changeSelectUser.bind(this)}
                      options={selectOptions}
                      className={"members-select"}
                      clearable={false}
                    />
                </div>
                <div className="select-wrap">
                    <Select
                      value={selectedDesignation}
                      placeholder="User designation"
                      onChange={this.changeDesignation.bind(this)}
                      options={designationOptions}
                      className={"members-select"}
                      clearable={false}
                    />
                </div>
                <div className="select-wrap">
                    <Select
                      multi
                      placeholder="User categories"
                      value={selectedCategory}
                      onChange={this.changeCategory.bind(this)}
                      options={categoryOptions}
                      className={"members-select"}
                      clearable={false}
                    />
                </div>
                <button onClick={this.assignUsers.bind(this)} className="btnn primary-btn">Add member</button>
            </div>
        </div>
      )
  }

  changeSelectUser(selectUser){
    this.setState({selectUser})
  }

  assignUsers(){
    const { selectUser, selectedDesignation, selectedCategory } = this.state;
    const { salesRecord } = this.props;
    if(_.isNull(selectUser)) return warning("Choose user");

    const member = {
      userId: selectUser.value,
      isMainStakeholder: false,
      destination: _.isNull(selectedDesignation) ? null : selectedDesignation.value,
      category: selectedCategory.map(i=>i.value)
    };

    Meteor.call("addMemberToProject", salesRecord._id, member, err=>{
      if(err) return warning(err.reason? err.reason : "Add member failed!");
      this.setState({
        selectUser: null,
        selectedDesignation: null,
        selectedCategory: []
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
                  <h2 className="title">{sidebarTitle}</h2>
              </div>
            {this.renderAddUserForm()}
            {this.renderProjectMembers()}
          </aside>
      </div>
    )
  }
}
export default SingleSalesRecord;

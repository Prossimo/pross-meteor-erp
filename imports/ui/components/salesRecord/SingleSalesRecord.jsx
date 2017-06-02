import {Roles} from 'meteor/alanning:roles'
import React from 'react'
import classNames from 'classnames'
import { DESIGNATION_LIST, STAKEHOLDER_CATEGORY } from '/imports/api/constants/project'
import { getUserName, getUserEmail } from '/imports/api/lib/filters'
import { info, warning } from '/imports/api/lib/alerts'
import ContactStore from '../../../api/nylas/contact-store'
import Select from 'react-select'
import {ROLES} from '/imports/api/models'
import Popup from '../popup/Popup'
import ContactInfo from '../account/ContactInfo'
import Quotes from './Quotes'
import Details from './Details'
import Activity from './Activity'
import Tasks from '../tasks/TaskBoard.jsx'
import Files from '../files/Files'
import Invoices from './Invoices'
import Documents from './Documents'
import Conversations from './conversations/Conversations'
import {Modal} from 'react-bootstrap'

class SingleSalesRecord extends React.Component{
  constructor(props){
    super(props)
    this.tabs = [
      {
        label: 'Activity',
        component: <Activity/>
      },
      {
        label: 'Quotes',
        component: <Quotes/>
      },
      {
        label: 'Conversations',
        component: <Conversations/>
      },
      {
        label: 'Details',
        component: <Details/>
      },
      {
        label: 'Invoices',
        component: <Invoices/>
      },
      {
        label: 'Files',
        component: <Files type='salesRecord'/>
      },
      {
        label: 'Tasks',
        component: <Tasks projectId={props.salesRecord._id}/>
      }
    ]

    this.memberTypeOptions = [
      { label: 'Add Team Member', value: 'member' },
      { label: 'Add Stakeholder', value: 'stakeholder' },
    ]

    this.stageOptions = [
      { label: 'Lead', value: 'lead' },
      { label: 'Opportunity', value: 'opportunity' },
      { label: 'Order', value: 'order' },
      { label: 'Ticket', value: 'ticket' },
    ]

    this.state = {
      activeTab: this.tabs.find(tab => tab.label === 'Activity'),
      showPopup: false,
      popupTitle: '',
      popupData: null,
      member: {
        selectedUser: null,
        selectedCategory: [],
      },
      stakeholder: {
        selectedContact: null,
        selectedCategory: [],
        selectedDesignation: null,
        notify: true,
      },
      memberType: this.memberTypeOptions[0],
      selectedMembers: []
    }

    this.renderStakeholders = this.renderStakeholders.bind(this)
    this.renderAddMemberForm = this.renderAddMemberForm.bind(this)
    this.changeState = this.changeState.bind(this)
    this.addMember = this.addMember.bind(this)
    this.addStakeholder = this.addStakeholder.bind(this)
    this.showContactInfo = this.showContactInfo.bind(this)
    this.removeMember = this.removeMember.bind(this)
    this.removeStakeholder = this.removeStakeholder.bind(this)
    this.changeStage = this.changeStage.bind(this)
    this.addMemberToState = this.addMemberToState.bind(this)
    /*
    * should not publish all contact to client
    * because searching in contact causes lag in UI, index contact list to provide quick search
    * */
    this.contacts = {}
    ContactStore.getContacts(1).forEach((contact) => {
      this.contacts[contact._id] = contact
    })
  }


  toggleTab(activeTab){
    this.setState({activeTab})
  }

  getTabs(){
    const { activeTab } = this.state

    return <ul>
      {this.tabs.map(item => (
          <li key={item.label}
              onClick={this.toggleTab.bind(this, item)}
              className={classNames({'active': item === activeTab})}
          >{item.label}</li>
        ))}
    </ul>
  }

  getContent(){
    const { activeTab } = this.state
    if(activeTab.component){
      return React.cloneElement(activeTab.component, this.props)
    }else{
      return activeTab.content
    }
  }

  removeStakeholder(salesRecordId, contactId, event) {
    event.preventDefault()
    Meteor.call('removeStakeholderFromSalesRecord', salesRecordId , contactId, (error, result) => {
      if(error) return warning(error.reason? error.reason : 'remove stakeholder failed!')
      info('remove stakeholder success!')
    })
  }

  renderStakeholders() {
    const salesRecord = this.props.salesRecord
    const stakeholders = salesRecord && salesRecord.stakeholders ? salesRecord.stakeholders : []
    return (
      <ul className="project-members">
      {
        stakeholders.map(({ contactId, category }) => {
          let email = 'unknown'
          const contact = this.contacts[contactId]
          if (contact && contact.email) {
            if (contact.email.length > 34)
              email = `${contact.email.slice(0, 34)  }...`
            else
              email = contact.email
          }
          return (
            <li key={contactId} className='member-list'>
              {
                Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN) ? (
                  <a href='#' style={{top: '10px', right: '10px', position: 'relative'}} onClick={(event) => this.removeStakeholder(salesRecord._id, contactId, event)}>
                    <span className='fa fa-times pull-right'></span>
                  </a>
                ) : ''
              }
              <span className='memberName' onClick={() => this.showContactInfo(contact)}>{ email }</span>
              <div>
              {
                category.map((name) => (<span className='member-cat' key={name}>{name}</span>))
              }
              </div>
            </li>
          )
        })
      }
      </ul>
    )

  }

  removeMember(salesRecordId, userId, event) {
    event.preventDefault()
    Meteor.call('removeMemberFromSalesRecord', salesRecordId , userId, (error, result) => {
      if(error) return warning(error.reason? error.reason : 'remove member failed!')
      info('remove member success!')
    })
  }

  //todo change style
  renderProjectMembers(){
    const { salesRecord } = this.props
    if(!salesRecord )return null
    return (
      <ul className="project-members">
        {_.isArray(salesRecord.members) && salesRecord.members.map(member => {
          if(!member.user) return null
          return(
            <li key={member.user._id}
                className="member-list">
                {
                  Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN) ? (
                    <a href='#' style={{top: '10px', right: '10px', position: 'relative'}} onClick={(event) => this.removeMember(salesRecord._id, member.userId, event)}>
                      <span className='fa fa-times pull-right'></span>
                    </a>
                  ) : ''
                }
                <span
                  onClick={this.showUserInfo.bind(this, member.user)}
                  className={classNames('memberName', {'main': member.isMainStakeholder}) }>
                  {getUserName(member.user, true)}
                </span>
                <span className="email">
                  {getUserEmail(member.user)}
                </span>
                <div>
                  {member.category.map(cat => <span className="member-cat" key={`${cat}${member.user._id}`}>{cat}</span>)}
                </div>
            </li>
          )
        })}
      </ul>
    )
  }

  changeStage(salesRecordId, item) {
    if (item) {
      Meteor.call('changeStageOfSalesRecord', salesRecordId, item.value, (error) => {
        if (error) return warning(error.reason ? error.reason : 'Change stage failed!')
        info('Change stage sucess')
      })
    }
  }

  changeState(subState, propName, propValue) {
    subState[propName] = propValue
    this.setState((prevState) => prevState)
  }

  renderAddStakeholderForm() {
    const { stakeholder: { selectedContact, selectedCategory, selectedDesignation, notify}} = this.state
    const designationOptions = DESIGNATION_LIST.map(item => ({label: item, value: item}))
    const categoryOptions = STAKEHOLDER_CATEGORY.map(item => ({label: item, value: item}))
    const selectContactOptions = ContactStore.getContacts(1)
      .filter(({ _id }) => !this.props.salesRecord.stakeholders.map(({ contactId }) => contactId).includes(_id))
      .map(({ _id, name, email }) => ({
          label: `${email}`,
          value: _id,
      }))

    if(Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN)) {
        return (
            <div className='form'>
                <div className='form-group'>
                    <Select
                      value={selectedContact}
                      placeholder="Choose stakeholder"
                      onChange={(item) => this.changeState(this.state.stakeholder, 'selectedContact', item)}
                      options={selectContactOptions}
                      className={'members-select'}
                      clearable={false}
                    />
                </div>
                <div className="form-group">
                    <Select
                      value={selectedDesignation}
                      placeholder="Stakeholder designation"
                      onChange={(item) => this.changeState(this.state.stakeholder, 'selectedDesignation', item)}
                      options={designationOptions}
                      className={'members-select'}
                      clearable={false}
                    />
                </div>
                <div className="form-group">
                    <Select
                      multi
                      placeholder="Stakehoder categories"
                      value={selectedCategory}
                      onChange={(item) => this.changeState(this.state.stakeholder, 'selectedCategory', item)}
                      options={categoryOptions}
                      className={'members-select'}
                      clearable={false}
                    />
                </div>
                <div className="checkbox">
                    <label><input
                        type="checkbox"
                        value=""
                        checked={ notify }
                        onChange={(event) => this.changeState(this.state.stakeholder, 'notify', event.target.checked)}/>
                        Notify
                    </label>
                </div>
                <button onClick={this.addStakeholder} className="btnn primary-btn">Add People</button>
            </div>
        )
    }
  }

  addMemberToState(userId) {
    const { selectedMembers } = this.state
    const index = selectedMembers.indexOf(userId)
    if (index > -1) {
      selectedMembers.splice(index, 1)
    } else {
      selectedMembers.push(userId)
    }
    this.setState({selectedMembers})
  }

  renderAddMemberForm(){
    const { salesRecord, users } = this.props
    // const { member: { selectedUser, selectedCategory }} = this.state
    // const categoryOptions = STAKEHOLDER_CATEGORY.map(item => ({label: item, value: item}))
    const membersIds = salesRecord.members.map(i => i.userId)
    const members = users
      .filter(user => membersIds.indexOf(user._id)<0) // do not contain current user
      .filter(user => Roles.userIsInRole(user._id, [ ROLES.ADMIN, ROLES.SALES ])) // must be admin or employee
      .map(user => ({
          label: `${getUserName(user, true)} ${getUserEmail(user)}`,
          value: user._id,
          roles: user.roles.toString()
        }))

    if (_.isEmpty(members)) return (<div>There is no member available now</div>)

    if(Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN))
      return(
        <div>
            <div className="form">
                <div className="form-group">
                  <ul className="list-group">
                    {
                      members.map((member) =>
                       (
                        <li className="list-group-item" key={member.value}>
                          <input type="checkbox" onClick={this.addMemberToState.bind('', `${member.value}-${member.roles}`)}/> &nbsp;
                          {member.label} - {member.roles}
                        </li>
                        )
                      )
                    }
                  </ul>
                </div>
                <button onClick={this.addMember} className="btnn primary-btn">Add</button>
            </div>
        </div>
      )
  }

  renderAddMemeberModal() {
      const {showAddMemeberModal} = this.state

      return (
          <Modal show={showAddMemeberModal} bsSize="large" onHide={() => {
              this.setState({showAddMemeberModal: false})
          }}>
              <Modal.Header closeButton><Modal.Title>Add Team Member</Modal.Title></Modal.Header>
              <Modal.Body>
                  {this.renderAddMemberForm()}
              </Modal.Body>
          </Modal>
      )
  }

  addStakeholder() {
    const { stakeholder: { selectedContact, selectedDesignation, selectedCategory, notify } } = this.state
    const { salesRecord } = this.props
    if(_.isNull(selectedContact)) return warning('Choose stakeholder')
    const stakeholder = {
      contactId: selectedContact.value,
      destination: _.isNull(selectedDesignation) ? null : selectedDesignation.value,
      category: selectedCategory.map(item => item.value),
      notify,
    }
    Meteor.call('addStakeholderToSalesRecord', salesRecord._id, stakeholder, (error, result) => {
      if(error) return warning(error.reason? error.reason : 'Add stakeholder failed!')
      this.setState({
        stakeholder: {
          notify: true,
          selectedContact: null,
          selectedDesignation: null,
          selectedCategory: [],
        }
      })
      info('Add stakeholder to salesRecord success!')
    })
  }

  addMember(){
    const { selectedMembers } = this.state
    const { salesRecord } = this.props
    const members = selectedMembers.map((member) => {
      const splitedMember = member.split('-')
      return {
        userId: splitedMember[0],
        category: splitedMember[1],
        isMainStakeholder: false
      }
    })
    this.props.toggleLoader(true)
    Meteor.call('addMembersToProject', salesRecord._id, members, err => {
      this.props.toggleLoader(false)
      if(err) return warning(err.reason? err.reason : 'Add team member failed!')
      this.setState({showAddMemeberModal: false})
      info('Add team members to saleRecord success!')
    })
    {/*
      const member = {
        userId: selectedUser.value,
        isMainStakeholder: false,
        category: selectedCategory.map(i => i.value)
      }

      Meteor.call('addMemberToProject', salesRecord._id, member, err => {
        if(err) return warning(err.reason? err.reason : 'Add team member failed!')
        this.setState({
          member: {
            selectedUser: null,
            selectedCategory: []
          }
        })
        info('Add team member to salesRecord success!')
      })


    */}
    Meteor.defer(() => {
      _.each(members, (member) => {
        Meteor.call('addUserToSlackChannel', member.userId, salesRecord.slackChanel, (err, res) => {
          if(err) return warning(err.error)
          info(`${res.userEmail} success add to slack channel!`)
        })
      })
    })
  }

  hidePopup(){
    this.setState({showPopup: false, popupData: null})
  }

  showUserInfo(user){
    this.setState({
      showPopup: true,
      popupTitle: 'Team Member Info',
      popupData: <ContactInfo
        user={user}
        hide={this.hidePopup.bind(this)}
        editable={Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN)}/>})
  }

  showContactInfo(contact) {
    this.setState({
      showPopup: true,
      popupTitle: 'Stakeholder Info',
      popupData: (
        <div>
          <div className='form-group'>
            <label>Name</label>
            <p style={{overflow: 'auto'}}>{contact.name}</p>
          </div>
          <div className='form-group'>
            <label>Email</label>
            <p style={{overflow: 'auto'}}>{contact.email}</p>
          </div>
        </div>
      )
    })
  }

  renderPopup(){
    const { popupData, showPopup, popupTitle } = this.state
    return <Popup active={showPopup}
                  title={popupTitle}
                  hide={this.hidePopup.bind(this)}
                  content={popupData}/>
  }

  render() {
    const { salesRecord } = this.props
    const sidebarTitle = 'SalesRecord members'
    const projectName = salesRecord.name
    const defaultStage = this.stageOptions.find(({ value }) => value === salesRecord.stage)
    return (
      <div className="page-container single-project">
        {this.renderPopup()}
          <div className="main-content">
              <div className="tab-container">
                  <div className='page-title'>
                    <div className='row'>
                      <h2 className="col-md-10">{projectName}</h2>
                      <Select
                        className='col-md-2'
                        value={defaultStage}
                        options={this.stageOptions}
                        clearable={false}
                        onChange={(item) => this.changeStage(salesRecord._id, item)}
                      />
                    </div>
                  </div>
                  <div className="tab-controls">
                    {this.getTabs()}
                  </div>
                  <div className="tab-content">
                    {this.getContent()}
                  </div>
              </div>
          </div>
          <aside className="right-sidebar">
            <div className="sidebar-box">
              <button
                className="btnn primary-btn"
                onClick={() => {this.setState({showAddMemeberModal: true})}}
              >Add Team Member</button>
            </div>
            <div className='sidebar-box'>
              <div>
                { this.renderAddStakeholderForm() }
              </div>
            </div>
            <h4>Stakeholders</h4>
            <div className='sidebar-box'>
              { this.renderStakeholders() }
            </div>
            <h4>Vendors</h4>
            <div className='sidebar-box'>
              { this.renderProjectMembers() }
            </div>
          </aside>
          {this.renderAddMemeberModal()}
      </div>
    )
  }
}
export default SingleSalesRecord

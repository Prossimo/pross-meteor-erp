/* global FlowRouter */
import {Roles} from 'meteor/alanning:roles'
import React from 'react'
import classNames from 'classnames'
import {getUserName, getUserEmail} from '/imports/api/lib/filters'
import {info, warning} from '/imports/api/lib/alerts'
import ContactStore from '../../../api/nylas/contact-store'
import Select from 'react-select'
import {ROLES, Users, PeopleDesignations, People, SalesRecords} from '/imports/api/models'
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
import {createContainer} from 'meteor/react-meteor-data'
import SelectSubStage from './components/SelectSubStage'
import {Panel, SlackChannelSelector, Selector} from '../common'

class SingleSalesRecord extends React.Component {
    constructor(props) {
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
                component: <Conversations targetCollection={SalesRecords} targetId={props.salesRecord._id}/>
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
            {label: 'Add Team Member', value: 'member'},
            {label: 'Add Stakeholder', value: 'stakeholder'},
        ]

        this.stageOptions = [
            {label: 'Lead', value: 'lead'},
            {label: 'Opportunity', value: 'opportunity'},
            {label: 'Order', value: 'order'},
            {label: 'Ticket', value: 'ticket'},
        ]

        const salesRecordId = FlowRouter.getParam('id')
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
                selectedPeople: null,
                addToMain: true,
            },
            memberType: this.memberTypeOptions[0],
            selectedMembers: [],

            subscribes: {
                events: Meteor.subscribe('getProjectEvents', salesRecordId),
                project: Meteor.subscribe('getProject', salesRecordId),
                quotes: Meteor.subscribe('getQuotes', salesRecordId),
                files: Meteor.subscribe('getProjectFiles', salesRecordId),
                slackMessages: Meteor.subscribe('getSlackMsg', salesRecordId),
                messages: Meteor.subscribe('getMessages', salesRecordId)
            }
        }

        this.renderPeople = this.renderPeople.bind(this)
        this.changeState = this.changeState.bind(this)
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

    componentDidMount() {
        Meteor.call('getSlackUsers')
    }

    toggleTab(activeTab) {
        this.setState({activeTab})
    }

    getTabs() {
        const {activeTab} = this.state

        return <ul>
            {this.tabs.map(item => (
                <li key={item.label}
                    onClick={this.toggleTab.bind(this, item)}
                    className={classNames({'active': item === activeTab})}
                >{item.label}</li>
            ))}
        </ul>
    }

    getContent() {
        const {activeTab} = this.state
        if (activeTab.component) {
            return React.cloneElement(activeTab.component, this.props)
        } else {
            return activeTab.content
        }
    }

    removeStakeholder(salesRecordId, peopleId, event) {
        event.preventDefault()
        Meteor.call('removeStakeholderFromSalesRecord', salesRecordId, peopleId, (error, result) => {
            if (error) return warning(error.reason ? error.reason : 'remove stakeholder failed!')
            info('remove stakeholder success!')
        })
    }

    renderPeople(user) {
        return (

            <ul className="project-members">
                {
                    this.props.stakeholders.map(people => {
                        const {_id, emails, name, role, designation} = people
                        if (designation && designation.name !== user.designation) return ''
                        const emailString = (emails || []).map(({email}) => email).join('')
                        const nameString = emailString ? `${name}(${emailString})` : name
                        return (
                            <li key={_id} className='member-list'>
                                {
                                    Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN) ? (
                                        <a href='#' style={{top: '10px', right: '10px', position: 'relative'}}
                                           onClick={(event) => this.removeStakeholder(this.props.salesRecord._id, _id, event)}>
                                            <span className='fa fa-times pull-right'></span>
                                        </a>
                                    ) : ''
                                }
                                <span className='memberName'
                                      onClick={() => this.showContactInfo(name, emailString)}>{nameString}</span>
                                <div>
                                    {
                                        <span className='member-cat' key={role}>{role}</span>
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
        Meteor.call('removeMemberFromSalesRecord', salesRecordId, userId, (error, result) => {
            if (error) return warning(error.reason ? error.reason : 'remove member failed!')
            info('remove member success!')
        })
    }

    renderMembers(members) {
        return (
            <div className="list">
                {
                    members.map(m => (
                        <div key={m._id} className="item">
                            <div className="primary-text">{m.name()}</div>
                            <div className="secondary-text">{m.email()}</div>
                        </div>
                    ))
                }
            </div>
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

    changeSubStage(salesRecordId, item) {
        if (item) {
            Meteor.call('changeSubStageOfSalesRecord', salesRecordId, item.value, (error) => {
                if (error) return warning(error.reason ? error.reason : 'Change sub stage failed!')
                info('Change sub stage sucess')
            })
        }
    }

    changeState(subState, propName, propValue) {
        subState[propName] = propValue
        this.setState((prevState) => prevState)
    }

    renderAddStakeholderForm() {
        const {stakeholder: {selectedPeople, addToMain}} = this.state
        const peopleOptions = this.props.candidateStakeholders.map(({name, _id}) => ({value: _id, label: name}))
        if (Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN)) {
            return (
                <div className='form'>
                    <div className='form-group'>
                        <Select
                            value={selectedPeople}
                            placeholder="Choose People"
                            onChange={(item) => this.changeState(this.state.stakeholder, 'selectedPeople', item)}
                            options={peopleOptions}
                            className={'members-select'}
                            clearable={false}
                        />
                    </div>
                    <div className="checkbox">
                        <label><input
                            type="checkbox"
                            value=""
                            checked={addToMain}
                            onChange={(event) => this.changeState(this.state.stakeholder, 'addToMain', event.target.checked)}/>
                            Add To Main
                        </label>
                    </div>
                    <button onClick={this.addStakeholder} className="btnn primary-btn">Add People</button>
                </div>
            )
        }
    }

    addMemberToState(userId) {
        const {selectedMembers} = this.state
        const index = selectedMembers.indexOf(userId)
        if (index > -1) {
            selectedMembers.splice(index, 1)
        } else {
            selectedMembers.push(userId)
        }
        this.setState({selectedMembers})
    }

    addStakeholder() {
        const {stakeholder: {selectedPeople, addToMain}} = this.state
        const {salesRecord} = this.props
        if (!selectedPeople) return warning('Choose stakeholder')

        Meteor.call('addStakeholderToSalesRecord', {
            _id: salesRecord._id,
            peopleId: selectedPeople.value,
            addToMain
        }, (error, result) => {
            if (error) return warning(error.reason ? error.reason : 'Add stakeholder failed!')
            this.setState({
                stakeholder: {
                    addToMain: true,
                    selectedPeople: null,
                }
            })
            info('Add stakeholder to salesRecord success!')
        })
    }

    onSelectMembers = (members) => {
        const {salesRecord} = this.props
        if(members && salesRecord.members && members.length == salesRecord.members.length && members.every(m => salesRecord.members.indexOf(m)>-1)) return

        Meteor.call('updateSalesRecordMembers', salesRecord._id, members.map(m => m.value), err => {
            if (err) return console.error(err)
        })
    }

    hidePopup() {
        this.setState({showPopup: false, popupData: null})
    }

    showUserInfo(user) {
        this.setState({
            showPopup: true,
            popupTitle: 'Team Member Info',
            popupData: <ContactInfo
                user={user}
                hide={this.hidePopup.bind(this)}
                editable={Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN)}/>
        })
    }

    showContactInfo(name, email) {
        this.setState({
            showPopup: true,
            popupTitle: 'Stakeholder Info',
            popupData: (
                <div>
                    <div className='form-group'>
                        <label>Name</label>
                        <p style={{overflow: 'auto'}}>{name}</p>
                    </div>
                    <div className='form-group'>
                        <label>Email</label>
                        <p style={{overflow: 'auto'}}>{email}</p>
                    </div>
                </div>
            )
        })
    }

    updateSlackChannel = (channel) => {
        Meteor.call('updateSalesRecordSlackChannel', {
            _id: this.props.salesRecord._id,
            channel
        }, (err,res) => {
            if(err) {
                console.warn(err)
                warning(err.message || err.reason)
            }
        })
    }

    renderPopup() {
        const {popupData, showPopup, popupTitle} = this.state
        return <Popup active={showPopup}
                      title={popupTitle}
                      hide={this.hidePopup.bind(this)}
                      content={popupData}/>
    }

    render() {
        const {salesRecord} = this.props
        const sidebarTitle = 'Deal members'
        const projectName = salesRecord.name
        const defaultStage = this.stageOptions.find(({value}) => value === salesRecord.stage)
        const slackChannelInfo = null//salesRecord.slackChannelInfo()

        const members = salesRecord.getMembers()
        return (
            <div className="page-container single-project">
                {this.renderPopup()}
                <div className="main-content">
                    <div className="tab-container">
                        <div className='page-title'>
                            <div className='row'>
                                <h2 className="col-md-10">{projectName}</h2>
                                <Select
                                    style={{marginBottom: '5px'}}
                                    className='col-md-2'
                                    value={defaultStage}
                                    options={this.stageOptions}
                                    clearable={false}
                                    onChange={(item) => this.changeStage(salesRecord._id, item)}
                                />
                                <SelectSubStage
                                    update
                                    style={'col-md-2'}
                                    stage={defaultStage.value}
                                    subStage={salesRecord.subStage}
                                    onSelectSubStage={(item) => {
                                        this.changeSubStage(salesRecord._id, item)
                                    }}
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
                        <Panel title="Slack Channel" actions={<SlackChannelSelector channel={salesRecord.slackChanel}
                                                                                    onSelectChannel={this.updateSlackChannel}/>}>
                            {salesRecord.slackChannelName || salesRecord.slackChanel}
                        </Panel>
                    </div>
                    <div className="sidebar-box">
                        <Panel title="Members" actions={<Selector multiple value={members.map(m => ({value:m._id, label:m.name()}))} options={Users.find().map(u => ({value:u._id, label:u.name()}))} onSelect={this.onSelectMembers}/>}>
                            {members&&members.length ? this.renderMembers(members) : <div>There are no members assigned to this project</div>}
                        </Panel>
                    </div>
                    <div className='sidebar-box'>
                        <div>
                            {this.renderAddStakeholderForm()}
                        </div>
                    </div>
                    {
                        this.props.designations.map((d) => {
                            const existPeople = this.props.stakeholders.filter(stake =>
                                stake.designation && stake.designation.name === d.name
                            )
                            if (_.isEmpty(existPeople)) return ''
                            return (
                                <div key={d._id}>
                                    <h4>{d.name}</h4>
                                    <div className="sidebar-box">
                                        {
                                            this.renderPeople({designation: d.name})
                                        }
                                    </div>
                                </div>
                            )
                        })
                    }
                </aside>
            </div>
        )
    }
}

export default createContainer(props => {
    const peopleIds = props.salesRecord.stakeholders.map(({peopleId}) => peopleId)
    const stakeholders = People
        .find({_id: {$in: peopleIds}})
        .fetch()
        .map(p => {
            p.designation = PeopleDesignations.findOne(p.designation_id)
            return p
        })
    const candidateStakeholders = People.find({_id: {$nin: peopleIds}}).fetch()
    const designations = PeopleDesignations.find().fetch()
    return {
        designations,
        stakeholders,
        candidateStakeholders,
    }
}, SingleSalesRecord)

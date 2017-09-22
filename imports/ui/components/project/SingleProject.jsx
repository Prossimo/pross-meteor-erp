/* global FlowRouter */
import _ from 'underscore'
import React, {Component} from 'react'
import {createContainer} from 'meteor/react-meteor-data'
import classNames from 'classnames'
import {info, warning} from '/imports/api/lib/alerts'
import {Users, Projects, People} from '/imports/api/models'
import Activities from './Activities'
import Tasks from '../tasks/TaskBoard.jsx'
import Files from '../files/Files.jsx'
import {Panel, Selector, SlackChannelSelector} from '../common'
import Conversations from '../salesRecord/conversations/Conversations'

class SingleProject extends Component {
    constructor(props) {
        super(props)
        const projectId = FlowRouter.getParam('id')
        this.tabs = [
            {
                label: 'Activity',
                component: <Activities projectId={projectId}/>
            },
            {
                label: 'Conversations',
                component: <Conversations targetCollection={Projects} targetId={projectId}/>
            },
            {
                label: 'Tasks',
                component: <Tasks projectId={projectId}/>
            },
            {
                label: 'Files',
                component: <Files type='project'/>
            },
        ]

        this.state = {
            activeTab: this.tabs.find(tab => tab.label === 'Activity'),
            showPopup: false,
            popupData: null,
            selectUser: null,
            selectedCategory: [],
            selectedDesignation: null,
        }
    }

    componentDidMount() {

    }
    toggleTab(activeTab) {
        this.setState({activeTab})
    }

    onSelectMembers = (members) => {
        const {project} = this.props
        const userIds = _.pluck(project.members, 'userId')
        if (members && project.members && members.length == project.members.length && members.every(m => userIds.indexOf(m.value) > -1)) return

        project.members = members.map(m => ({userId: m.value, isAdmin: false}))
        Meteor.call('project.update', {...this.props.project}, (err, res) => {
            if (err) {
                console.warn(err)
                warning(err.message || err.reason)
            }
        })
    }

    onSelectStakeholders = (stakeholders) => {
        const {project} = this.props
        const peopleIds = _.pluck(project.stakeholders, 'peopleId')
        if (stakeholders && project.stakeholders && stakeholders.length == project.stakeholders.length && stakeholders.every(m => peopleIds.indexOf(m.value) > -1)) return

        project.stakeholders = stakeholders.map(p => {
            const stakeholder = _.findWhere(project.stakeholders, {peopleId: p.value})
            if (stakeholder) return stakeholder

            return {peopleId: p.value, isMainStakeholder: false, addToMain: true}
        })
        Meteor.call('project.update', {...this.props.project}, (err, res) => {
            if (err) {
                console.warn(err)
                warning(err.message || err.reason)
            }
        })
    }

    setAsMainStakeholder = (stakeholder) => {
        const {project} = this.props
        const {stakeholders} = project
        stakeholders.forEach((s) => {
            if (s.peopleId === stakeholder._id) {
                s.isMainStakeholder = true
            } else {
                s.isMainStakeholder = false
            }
        })

        project.stakeholders = stakeholders

        Meteor.call('project.update', {...project}, (err, res) => {
            if (err) {
                console.warn(err)
                warning(err.message || err.reason)
            }
        })
    }

    addToMain = (stakeholder, checked) => {
        const {project} = this.props
        const {stakeholders} = project
        stakeholders.forEach((s) => {
            if (s.peopleId === stakeholder._id) {
                s.addToMain = checked
            }
        })

        project.stakeholders = stakeholders

        Meteor.call('project.update', {...project}, (err, res) => {
            if (err) {
                console.warn(err)
                warning(err.message || err.reason)
            }
        })
    }

    updateSlackChannel = (channel) => {
        Meteor.call('updateProjectSlackChannel', {
            _id: this.props.project._id,
            channel
        }, (err, res) => {
            if (err) {
                console.warn(err)
                warning(err.message || err.reason)
            }
        })
    }

    renderTabs() {
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

    renderContent() {
        const {activeTab} = this.state
        if (activeTab.component) {
            return React.cloneElement(activeTab.component, this.props)
        } else {
            return activeTab.content
        }
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

    renderStakeholders(stakeholders) {
        return (
            <div className="list">
                {
                    stakeholders.map(s => (
                        <div key={s._id} className="item" style={{display:'flex'}}>
                            <div style={{flex:1}}>
                                <div className="primary-text">{s.name}</div>
                                <div className="secondary-text">{s.email}</div>
                                <div className="secondary-text">{`${s.designation}/${s.role}`}</div>
                            </div>
                            <div style={{margin:'auto'}}>
                                <input type="radio" checked={s.isMainStakeholder} onChange={() => {
                                    this.setAsMainStakeholder(s)
                                }}/>
                            </div>
                        </div>
                    ))
                }
            </div>
        )
    }

    render() {
        if (this.props.loading) return (<div>Loading ...</div>)

        const {project} = this.props
        const members = project.getMembers()
        const stakeholders = project.getStakeholders()
        return (
            <div className='page-container single-project'>
                <div className="main-content">
                    <div className='tab-container'>
                        <h2 className='page-title'>{project.name}</h2>
                        <div className='tab-controls'>
                            {this.renderTabs()}
                        </div>
                        <div className='tab-content'>
                            {this.renderContent()}
                        </div>
                    </div>
                </div>
                <aside className="right-sidebar">
                    <div className="sidebar-box">
                        <Panel title="Slack Channel" actions={<SlackChannelSelector channel={project.slackChanel}
                                                                                    onSelectChannel={this.updateSlackChannel}/>}>
                            {project.slackChannelName || project.slackChanel}
                        </Panel>
                    </div>
                    <div className="sidebar-box">
                        <Panel title="Members"
                               actions={<Selector multiple value={members.map(m => ({value: m._id, label: m.name()}))}
                                                  options={Users.find().map(u => ({value: u._id, label: u.name()}))}
                                                  onSelect={this.onSelectMembers}/>}>
                            {members && members.length ? this.renderMembers(members) :
                                <div>There are no members assigned to this project</div>}
                        </Panel>
                    </div>
                    <div className="sidebar-box">
                        <Panel title="Stakeholders" actions={<Selector multiple value={stakeholders.map(p => ({
                            value: p._id,
                            label: p.name
                        }))} options={People.find().map(p => ({value: p._id, label: p.name}))}
                                                                       onSelect={this.onSelectStakeholders}/>}>
                            {stakeholders && stakeholders.length ? this.renderStakeholders(stakeholders) :
                                <div>There are no members assigned to this project</div>}
                        </Panel>
                    </div>
                </aside>
            </div>
        )
    }
}

export default createContainer(() => {
    const projectId = FlowRouter.getParam('id')
    const subscribers = [subsCache.subscribe('slackusers.all'), subsCache.subscribe('projects.one', projectId)]

    return {
        loading: !subscribers.reduce((prev, subscriber) => prev && subscriber.ready(), true),
        project: Projects.findOne(projectId)
    }
}, SingleProject)

/* global FlowRouter */
import React, {Component} from 'react'
import {createContainer} from 'meteor/react-meteor-data'
import classNames from 'classnames'
import {info, warning} from '/imports/api/lib/alerts'
import {Users,Projects} from '/imports/api/models'
import Activities from './Activities'
import Tasks from '../tasks/TaskBoard.jsx'
import Files from '../files/Files.jsx'
import {Panel, Selector, SlackChannelSelector} from '../common'

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


    toggleTab(activeTab) {
        this.setState({activeTab})
    }

    onSelectMembers = (members) => {
        this.props.project.members = members.map(m => ({userId:m.value, isAdmin:false}))
        Meteor.call('project.update', {...this.props.project}, (err,res) => {
            if(err) {
                console.warn(err)
                warning(err.message || err.reason)
            }
        })
    }

    updateSlackChannel = (channel) => {
        Meteor.call('updateProjectSlackChannel', {
            _id: this.props.project._id,
            channel
        }, (err,res) => {
            if(err) {
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
    render() {
        if(this.props.loading) return(<div>Loading ...</div>)

        const {project} = this.props
        const members = project.getMembers()
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
                        <Panel title="Members" actions={<Selector multiple value={members.map(m => ({value:m._id, label:m.name()}))} options={Users.find().map(u => ({value:u._id, label:u.name()}))} onSelect={this.onSelectMembers}/>}>
                            {members&&members.length ? this.renderMembers(members) : <div>There are no members assigned to this project</div>}
                        </Panel>
                    </div>
                </aside>
            </div>
        )
    }
}

export default createContainer(() => {
    const projectId = FlowRouter.getParam('id')
    const subscribers = []
    subscribers.push(Meteor.subscribe('getNewProject', projectId))
    return {
        loading: !subscribers.reduce((prev, subscriber) => prev && subscriber.ready(), true),
        project: Projects.findOne(projectId)
    }
}, SingleProject)

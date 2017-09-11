/* global FlowRouter */
import _ from 'underscore'
import React, { Component } from 'react'
import Select from 'react-select'
import {FormGroup, Radio} from 'react-bootstrap'
import { info, warning } from '/imports/api/lib/alerts'
import 'react-block-ui/style.css'
import { Loader, Types } from 'react-loaders'
import 'loaders.css/loaders.min.css'
import SelectStakeholders from '../salesRecord/components/SelectStakeholders'
import {Conversations, People, Users} from '/imports/api/models'
import NylasUtils from '/imports/api/nylas/nylas-utils'

export default class CreateProject extends Component {
    constructor(props) {
        super(props)
        const curUserName = `${props.currentUser.profile.firstName} ${props.currentUser.profile.lastName}`

        const {project} = props

        this.state = {
            projectName: project ? project.name : '',
            selectedMembers: project ? project.members.map(m => {
                const member = Users.findOne(m.userId)
                return {
                    label: member.name(),
                    value: m.userId,
                    checked: m.isAdmin
                }
            }) : [
                {
                    label: curUserName,
                    value: props.currentUser._id
                }
            ],
            blocking: false,
            people: null,

            selectedConversation: project && project.conversationIds && project.conversationIds.length>0 ? project.conversationIds[0] : null
        }

        if (props.thread) {
            const {participants, account_id} = props.thread
            const people = project ? People.find({_id: {$in: _.pluck(project.stakeholders, 'peopleId')}}).fetch().map((p) => {
                const stakeholder = project.stakeholders.find((s) => s.peopleId === p._id)
                return _.extend(p, {
                    isMainStakeholder: stakeholder.isMainStakeholder
                })
            }) : []
            const threadPeople = People.find({'emails.email': {$in: _.pluck(participants, 'email').filter((email) => !NylasUtils.isOwner(account_id, email))}}).fetch()
            threadPeople.forEach((p) => {
                if (!_.find(people, {_id: p._id})) {
                    people.push(p)
                }
            })
            this.state.people = people
        }
    }

    submit = () => {
        const data = {
            name: this.state.projectName,
            members: this.state.selectedMembers.map(({ label, value, checked }) => ({
                userId: value,
                isAdmin: !!checked,
            })),
            stakeholders: this.state.stakeholders
        }
        this.props.toggleLoader(true)

        const {thread, project} = this.props

        delete thread.object

        if (project) {console.log('Before call project.update', thread)
            const {selectedConversation} = this.state
            Meteor.call('project.update', {_id:project._id, ...data, thread, conversationId:selectedConversation}, (err, res) => {
                this.props.toggleLoader(false)
                if (err) return warning(`Problems with updating new SalesRecord. ${err.error}`)

                info('Success update Deal')
                setTimeout(() => {
                    FlowRouter.go(FlowRouter.path('Project', {id: project._id}))
                }, 300)
            })
        } else {

            Meteor.call('project.create', {...data, thread}, (err,projectId) => {
                this.props.toggleLoader(false)
                if(err) {
                    console.error(err)
                    warning(err.reason || err.message)
                    return
                }
                info('Success add new project')
                FlowRouter.go('Project', { id: projectId })
            })
        }
    }

    changeName = (event) => {
        this.setState({
            projectName: event.target.value,
        })
    }

    changeState = (type, checked, member) => {
        switch(type) {
            case 'isAdmin':
                if (!checked) return
                this.state.selectedMembers.forEach((member) => {
                    member.checked = false
                })
                member.checked = true
                this.setState((prevState) => prevState)
                break
        }

    }

    changeMembers = (members) => {
        const hasChecked = members.reduce((result, { label, value, checked }) => result || checked !== undefined, false)
        if (!hasChecked && members.length > 0) members[0].checked = true
        this.setState({
            selectedMembers: members,
        })
    }

    updateStakeholders = (stakeholders) => {
        this.state.stakeholders = stakeholders
    }

    selectConversation = (e) => {
        this.setState({selectedConversation: e.target.value})
    }

    renderConversationSelector() {
        const {project} = this.props
        if(!project || !project.conversationIds) return ''
        const conversations = Conversations.find({_id: {$in:project.conversationIds}}).fetch()


        if (!conversations || conversations.length == 0) return ''

        const {selectedConversation} = this.state
        return (
            <div className='panel panel-default'>
                <div className='panel-heading'>
                    Select conversation
                </div>
                <div className='panel-body' style={{display:'flex'}}>
                    <FormGroup>
                        {
                            conversations.map(c => (
                                <Radio key={`conversation-radio-${c._id}`} value={c._id} checked={selectedConversation == c._id} onChange={this.selectConversation} inline> {c.name}</Radio>
                            ))
                        }
                    </FormGroup>
                </div>
            </div>
        )
    }
    render() {
        const memberOptions = this.props.users.map(({ profile: { firstName, lastName }, _id }) => {
            const name = `${firstName} ${lastName}`
            return {
                label: name,
                value: _id,
            }
        })
        return (
            <div>
                <div className='form'>
                    <div className='form-group'>
                        <label> Project Name </label>
                        <input
                            type='text'
                            className='form-control'
                            value={this.state.projectName}
                            onChange={this.changeName}
                        />
                    </div>
                    <Select
                        multi
                        value={this.state.selectedMembers}
                        onChange={this.changeMembers}
                        options={memberOptions}
                        className={'members-select'}
                        clearable={false}
                    />
                    <table className='table table-condensed'>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Admin</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.selectedMembers.map((member) => {
                                    const { value, label, checked } = member
                                    return (
                                        <tr key={ value }>
                                            <td>{ label }</td>
                                            <td>
                                                <div className='radio'>
                                                    <label>
                                                        <input
                                                            type='checkbox'
                                                            checked={ checked }
                                                            onChange={(event) => this.changeState('isAdmin', event.target.checked, member)}/>
                                                    </label>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>

                    <SelectStakeholders
                        people={this.state.people}
                        onSelectPeople={this.updateStakeholders}
                    />
                    {
                        this.props.thread && this.props.project && this.renderConversationSelector()
                    }
                    <div className='form-group text-center'>
                        <button className='btn btn-primary' onClick={this.submit}>{this.props.project ? 'Update Project' : 'Add Project'}</button>
                    </div>
                </div>
            </div>
        )
    }
}

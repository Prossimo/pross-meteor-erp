/* global FlowRouter */
import _ from 'underscore'
import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {DropdownButton, MenuItem, FormControl, InputGroup, Button} from 'react-bootstrap'
import ComposeButton from './composer/ComposeButton'
import ThreadArchiveButton from './ThreadArchiveButton'
import ThreadTrashButton from './ThreadTrashButton'
import ThreadToggleUnreadButton from './ThreadToggleUnreadButton'
import ThreadStarButton from './ThreadStarButton'
import MailSearchBox from './MailSearchBox'
import {SalesRecords, Projects, Threads, Conversations, Users} from '/imports/api/models'
import {updateThread} from '/imports/api/models/threads/methods'
import {Selector} from '../common'
import {ClientErrorLog} from '/imports/utils/logger'
import {PAGESIZE} from '/imports/utils/constants'

export default class Toolbar extends TrackerReact(React.Component) {
    static propTypes = {
        thread: React.PropTypes.object,
        onSelectExtraMenu: React.PropTypes.func
    }

    constructor(props) {
        super(props)


        this.state = {
            salesRecords: SalesRecords.find({}, {sort:{name:1}}).fetch(),
            projects: Projects.find({}, {sort:{name:1}}).fetch()
        }
    }

    render() {
        const thread = this.props.thread
        const assignee = thread ? thread.getAssignee() : null
        const assigneeValue = assignee ? {
            value: assignee._id,
            label: assignee.name()
        } : null
        const { threadTotalCount, draftTotalCount } = this.props


        return (
            <div className="toolbar-panel">
                <div style={{minWidth: 250, maxWidth: 250, flex: 1}}>
                    <ComposeButton/>
                </div>
                <div style={{maxWidth: 300}}>
                    <MailSearchBox />
                </div>
                <div style={{flex: 1}}>
                    &nbsp;&nbsp;&nbsp;
                    <ThreadArchiveButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadTrashButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadToggleUnreadButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadStarButton thread={thread}/>
                    &nbsp;&nbsp;&nbsp;
                    <Selector
                        disabled={!thread}
                        value={assigneeValue}
                        options={Users.find().map(u => ({value:u._id, label:u.name()}))}
                        onSelect={this.onSelectAssignee}
                        triggerEl={<Button disabled={!thread}>{assignee ? <div><span style={{fontSize:11}}>Assigned to </span><span>{assignee.name()}</span></div> : 'Assign'}</Button>}
                    />
                    &nbsp;&nbsp;&nbsp;
                    <Button
                        disabled={!thread}
                        onClick={this.onToggleFollow}
                    >
                        {thread && thread.followers && thread.followers.indexOf(Meteor.userId())>-1 ? 'Unfollow' : 'Follow'}
                    </Button>
                </div>
                <div>
                  {
                    (threadTotalCount > 0 || draftTotalCount > 0) && this.renderPagingButtons()
                  }
                </div>
                <div>
                    {this.renderExtraMenu()}
                </div>
            </div>
        )
    }

    renderPagingButtons() {
        const { threadStartIndex, threadTotalCount, draftTotalCount, isDrafts } = this.props

        return (
            <div style={{marginLeft: 'auto', marginRight: 10}}>
              <span>
                { threadStartIndex }-{ isDrafts ? draftTotalCount : _.min([threadStartIndex + PAGESIZE, threadTotalCount]) } of { isDrafts ? draftTotalCount : threadTotalCount }
              </span>
              <Button disabled={(threadStartIndex - PAGESIZE < 1) || isDrafts} onClick={this.props.onPrevPage}><i className="fa fa-chevron-left" /></Button>
              <Button disabled={(threadStartIndex + PAGESIZE >= threadTotalCount) || isDrafts} onClick={this.props.onNextPage}><i className="fa fa-chevron-right" /></Button>
            </div>
        )
    }
    renderExtraMenu() {
        const {thread} = this.props
        if(!thread) return ''

        const existingThread = Threads.findOne({id: thread.id})
        let salesRecord, project
        if(existingThread && existingThread.conversationId) {
            const conversation = Conversations.findOne(existingThread.conversationId)
            if(conversation) {
                const parent = conversation.parent()
                if(parent) {
                    if(parent.type === 'deal') salesRecord = parent
                    else if(parent.type === 'project') project = parent
                }
            }
        }

        if(salesRecord) {
            return (
                <div>
                    <DropdownButton bsStyle="default" bsSize="small" title={salesRecord.name} pullRight id="dropdown-deal">
                        <MenuItem onSelect={() => this.props.onSelectExtraMenu('goto', {type:'deal', _id:salesRecord._id})}>Go to this deal</MenuItem>
                        <MenuItem divider/>
                        <MenuItem onSelect={() => this.props.onSelectExtraMenu('unbind')}>Unbind from this deal</MenuItem>
                    </DropdownButton>
                </div>
            )
        } else if(project) {
            return (
                <div style={{float:'right'}}>
                    <DropdownButton bsStyle="default" bsSize="small" title={project.name} pullRight id="dropdown-project">
                        <MenuItem onSelect={() => this.props.onSelectExtraMenu('goto', {type:'project',_id:project._id})}>Go to this project</MenuItem>
                        <MenuItem divider/>
                        <MenuItem onSelect={() => this.props.onSelectExtraMenu('unbind')}>Unbind from this project</MenuItem>
                    </DropdownButton>
                </div>
            )
        }

        const {salesRecords, projects} = this.state
        return (
            <div style={{float:'right'}}>
                <DropdownButton bsStyle="default" bsSize="small" title="Deal" pullRight id="dropdown-deal">
                    <MenuItem onSelect={() => this.props.onSelectExtraMenu('create', {type:'deal'})}>Create new deal from this thread</MenuItem>
                    <MenuItem divider/>
                    <MenuItem header>Bind this thread to existing deal</MenuItem>
                    <MenuItem header>
                        <InputGroup>
                            <InputGroup.Addon><i className="fa fa-search"/></InputGroup.Addon>
                            <FormControl type="text" placeholder="Search..." onChange={this.onChangeSearchSalesRecord} />
                        </InputGroup>
                    </MenuItem>
                    {
                        salesRecords.map((sr) => <MenuItem key={sr._id} onSelect={() => this.props.onSelectExtraMenu('bind', {type:'deal',doc:sr})}>{sr.name}</MenuItem>)
                    }
                </DropdownButton>&nbsp;
                <DropdownButton bsStyle="default" bsSize="small" title="Project" pullRight id="dropdown-project" disabled={!thread}>
                    <MenuItem onSelect={() => this.props.onSelectExtraMenu('create', {type:'project'})}>Create new project from this thread</MenuItem>
                    <MenuItem divider/>
                    <MenuItem header>Bind this thread to existing project</MenuItem>
                    <MenuItem header>
                        <InputGroup>
                            <InputGroup.Addon><i className="fa fa-search"/></InputGroup.Addon>
                            <FormControl type="text" placeholder="Search..." onChange={this.onChangeSearchProject} />
                        </InputGroup>
                    </MenuItem>
                    {
                        projects.map((pr) => <MenuItem key={pr._id} onSelect={() => this.props.onSelectExtraMenu('bind', {type:'project',doc:pr})}>{pr.name}</MenuItem>)
                    }
                </DropdownButton>
            </div>
        )
    }


    onChangeSearchSalesRecord = (evt) => {
        if(this.searchTimeout) { clearTimeout(this.searchTimeout) }

        const keyword = evt.target.value
        this.searchTimeout = setTimeout(() => {
            if(keyword.length) {
                this.setState({salesRecords: SalesRecords.find({name:{$regex: keyword, $options: 'i'}}, {sort:{name:1}}).fetch()})
            } else {
                this.setState({salesRecords: SalesRecords.find({}, {sort:{name:1}}).fetch()})
            }
        }, 500)
    }

    onChangeSearchProject = (evt) => {
        if(this.searchTimeout) { clearTimeout(this.searchTimeout) }

        const keyword = evt.target.value
        this.searchTimeout = setTimeout(() => {
            if(keyword.length) {
                this.setState({projects: Projects.find({name:{$regex: keyword, $options: 'i'}}, {sort:{name:1}}).fetch()})
            } else {
                this.setState({projects: Projects.find({}, {sort:{name:1}}).fetch()})
            }
        }, 500)
    }

    onSelectAssignee = (assignee) => {
        const {thread} = this.props
        if(assignee && thread.assignee && assignee.value===thread.assignee) return

        const oldAssignee = thread.assignee

        thread.assignee = assignee ? assignee.value : null
        delete thread.created_at
        delete thread.modified_at
        try{
            updateThread.call(thread)

            if(assignee) {
                const assignedUser = Users.findOne(assignee.value)
                if (assignedUser && assignedUser.slack) {
                    Meteor.call('sendMailAssignToSlack', thread, {
                        assignee: assignedUser.slack,
                        assigner: Meteor.user().slack
                    }, (err) => {if(err) ClientErrorLog.error(err)})
                }
            } else if(!assignee && oldAssignee) {
                const unassignedUser = Users.findOne(oldAssignee)
                if (unassignedUser && unassignedUser.slack) {
                    Meteor.call('sendMailUnassignToSlack', thread, {
                        unassignee: unassignedUser.slack,
                        assigner: Meteor.user().slack
                    }, (err) => {if(err) ClientErrorLog.error(err)})
                }
            }
        } catch (err) {
            ClientErrorLog.error(err)
        }
    }

    onToggleFollow = (evt) => {
        const {thread} = this.props
        thread.followers = thread.followers || []
        if(thread.followers.indexOf(Meteor.userId())>-1) {
            thread.followers.splice(thread.followers.indexOf(Meteor.userId()), 1)
        } else {
            thread.followers.push(Meteor.userId())
        }

        delete thread.created_at
        delete thread.modified_at
        try{
            updateThread.call(thread)
        } catch (err) {
            ClientErrorLog.error(err)
        }
    }
}

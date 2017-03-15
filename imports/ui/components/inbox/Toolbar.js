import React from 'react'
import ComposeButton from './composer/ComposeButton'
import ThreadArchiveButton from './ThreadArchiveButton'
import ThreadTrashButton from './ThreadTrashButton'
import ThreadToggleUnreadButton from './ThreadToggleUnreadButton'
import ThreadStarButton from './ThreadStarButton'
import {Button, DropdownButton, MenuItem} from 'react-bootstrap'

import {ADMIN_ROLE_LIST} from '../../../api/constants/roles';

export default class Toolbar extends React.Component {
    static propTypes = {
        thread: React.PropTypes.object,
        onSelectAddInbox: React.PropTypes.func
    }

    constructor(props) {
        super(props);
    }

    render() {
        const thread = this.props.thread
        return (
            <div className="toolbar-container">
                <div style={{order: 0, minWidth: 150, maxWidth: 200, flex: 1}}>
                    <ComposeButton/>
                </div>
                <div style={{order: 1, minWidth: 250, maxWidth: 450, flex: 1}}></div>
                <div style={{order: 2, flex: 1}}>
                    <ThreadArchiveButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadTrashButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadToggleUnreadButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadStarButton thread={thread}/>
                    {this.renderAddInboxButton()}
                </div>
            </div>
        )
    }

    renderAddInboxButton() {
        if (Roles.userIsInRole(this.props.currentUser._id, [...ADMIN_ROLE_LIST])) {
            return (
                <div style={{marginTop:12, float:'right'}}>
                    <DropdownButton bsStyle="primary" bsSize="small" title="Add inbox" id="dropdown-add-inbox">
                        <MenuItem onSelect={() => this.props.onSelectAddInbox(false)}>Individual</MenuItem>
                        <MenuItem onSelect={() => this.props.onSelectAddInbox(true)}>Team</MenuItem>
                    </DropdownButton>
                </div>
            )
        } else {
            return (
                <div style={{marginTop:12, float:'right'}}>
                    <Button bsStyle="primary" bsSize="small" onClick={() => this.props.onSelectAddInbox(false)}>Add inbox</Button>
                </div>
            )
        }
    }
}
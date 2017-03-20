import React from 'react'
import ComposeButton from './composer/ComposeButton'
import ThreadArchiveButton from './ThreadArchiveButton'
import ThreadTrashButton from './ThreadTrashButton'
import ThreadToggleUnreadButton from './ThreadToggleUnreadButton'
import ThreadStarButton from './ThreadStarButton'
import {DropdownButton, MenuItem} from 'react-bootstrap'


export default class Toolbar extends React.Component {
    static propTypes = {
        thread: React.PropTypes.object,
        onSelectMenuSalesRecord: React.PropTypes.func
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
                    {this.renderSalesRecordMenu()}
                </div>
            </div>
        )
    }

    renderSalesRecordMenu() {
        return (
            <div style={{marginTop:12, float:'right'}}>
                <DropdownButton bsStyle="default" bsSize="small" title="SalesRecord" pullRight id="dropdown-sales-record">
                    <MenuItem onSelect={() => this.props.onSelectMenuSalesRecord('create')}>Create new SalesRecord from this thread</MenuItem>
                    <MenuItem onSelect={() => this.props.onSelectMenuSalesRecord('bind')}>Bind this thread to existing SalesRecord</MenuItem>
                </DropdownButton>
            </div>
        )
    }
}
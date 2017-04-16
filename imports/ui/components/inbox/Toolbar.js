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
        onSelectMenuDeal: React.PropTypes.func
    }

    constructor(props) {
        super(props);
    }

    render() {
        const thread = this.props.thread
        return (
            <div className="toolbar-panel">
                <div style={{order: 0, minWidth: 150, maxWidth: 200, flex: 1}}>
                    <ComposeButton/>
                </div>
                <div style={{order: 1, minWidth: 250, maxWidth: 450, flex: 1}}></div>
                <div style={{order: 2, flex: 1}}>
                    <ThreadArchiveButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadTrashButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadToggleUnreadButton thread={thread}/>&nbsp;&nbsp;&nbsp;
                    <ThreadStarButton thread={thread}/>
                    {this.renderDealMenu()}
                </div>
            </div>
        )
    }

    renderDealMenu() {
        const {thread} = this.props
        return (
            <div style={{marginTop:12, float:'right'}}>
                <DropdownButton bsStyle="default" bsSize="small" title="Deal" pullRight id="dropdown-sales-record" disabled={!thread}>
                    <MenuItem onSelect={() => this.props.onSelectMenuDeal('create')}>Create new Deal from this thread</MenuItem>
                    <MenuItem onSelect={() => this.props.onSelectMenuDeal('bind')}>Bind this thread to existing Deal</MenuItem>
                </DropdownButton>
            </div>
        )
    }
}
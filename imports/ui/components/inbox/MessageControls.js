import React from 'react'
import NylasUtils from '../../../api/nylas/nylas-utils'
import ButtonDropdown from '../utils/ButtonDropdown'
import Menu from '../utils/Menu'
import Actions from '../../../api/nylas/actions'


class MessageControls extends React.Component {
    static propTypes = {
        message: React.PropTypes.object.isRequired
    }

    constructor(props) {
        super(props);
    }


    render() {
        items = this._items()

        return (
            <div className="message-actions-wrap">
                <ButtonDropdown
                    primaryItem={<img src={items[0].image} width="16px"/>}
                    primaryTitle={items[0].name}
                    primaryClick={items[0].select}
                    closeOnMenuClick={true}
                    menu={this._dropdownMenu(items.slice(1))}/>
                {/*<div className="message-actions-ellipsis" onClick={this._onShowActionsMenu}>
                    <img src="/icons/inbox/message-actions-ellipsis.png" width="22px"/>
                </div>*/}
            </div>
        )
    }

    _items() {
        reply = {
            name: 'Reply',
            image: '/icons/inbox/ic-dropdown-reply.png',
            select: this._onReply
        }

        replyAll = {
            name: 'Reply All',
            image: '/icons/inbox/ic-dropdown-replyall.png',
            select: this._onReplyAll
        }
        forward = {
            name: 'Forward',
            image: '/icons/inbox/ic-dropdown-forward.png',
            select: this._onForward
        }

        if (NylasUtils.canReplyAll(this.props.message)) {
            defaultReplyType = 'reply-all'//PlanckEnv.config.get('core.sending.defaultReplyType')
            if (defaultReplyType == 'reply-all')
                return [replyAll, reply, forward]
            else
                return [reply, replyAll, forward]
        }

        else
            return [reply, forward]
    }

    _account() {

    }

    _dropdownMenu(items) {
        itemContent = (item) => {
            return (
                <span>
                    <img src={item.image} width="16px"/>
                    &nbsp;&nbsp;{item.name}
                </span>
            )
        }

        return (
            <Menu items={items}
                  itemKey={ (item) => item.name }
                  itemContent={itemContent}
                  onSelect={ (item) => item.select() }
            />
        )
    }


    _onReply = () => {
        const {message, salesRecordId} = this.props
        Actions.composeReply({message, type: 'reply', modal: true, salesRecordId})
    }

    _onReplyAll = () => {
        const {message, salesRecordId} = this.props
        Actions.composeReply({message, type: 'reply-all', modal: true, salesRecordId})
    }

    _onForward = () => {
        const {message} = this.props
        Actions.composeForward({message, modal: true, salesRecordId})
    }

    _onShowActionsMenu() {
        SystemMenu = remote.require('menu')
        SystemMenuItem = remote.require('menu-item')

// Todo: refactor this so that message actions are provided
// dynamically. Waiting to see if this will be used often.
        menu = new SystemMenu()
        menu.append(new SystemMenuItem({label: 'Log Data', click: () => this._onLogData()}))
        menu.append(new SystemMenuItem({label: 'Show Original', click: () => this._onShowOriginal()}))
        menu.append(new SystemMenuItem({label: 'Copy Debug Info to Clipboard', click: () => this._onCopyToClipboard()}))
        menu.append(new SystemMenuItem({type: 'separator'}))
        menu.append(new SystemMenuItem({
            label: 'Report Issue: Quoted Text',
            click: () => this._onReport('Quoted Text')
        }))
        menu.append(new SystemMenuItem({label: 'Report Issue: Rendering', click: () => this._onReport('Rendering')}))
        menu.popup(remote.getCurrentWindow())
    }


    _onReport(issueType) {

    }

    _onShowOriginal() {

    }

    _onLogData() {

    }

    _onCopyToClipboard() {

    }
}

module.exports = MessageControls;
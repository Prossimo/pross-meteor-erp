import React from 'react'
import PropTypes from 'prop-types'
import {Modal} from 'react-bootstrap'
import find from 'lodash/find'
import uniq from 'lodash/uniq'
import NylasUtils from '/imports/api/nylas/nylas-utils'
import ButtonDropdown from '../utils/ButtonDropdown'
import Menu from '../utils/Menu'
import Actions from '/imports/api/nylas/actions'
import PeopleForm from '../people/PeopleForm'
import {People} from '/imports/api/models'
import AccountStore from '/imports/api/nylas/account-store'


class MessageControls extends React.Component {
    static propTypes = {
        message: PropTypes.object.isRequired
    }

    constructor(props) {
        super(props)

        this.state = {
            showPeopleModal: false,
            noStoredParticipants: null
        }
    }


    renderPeopleModal() {
        const {showPeopleModal, noStoredParticipants} = this.state

        if (!noStoredParticipants || noStoredParticipants.length == 0) return ''

        return (
            <Modal bsSize="large" show={showPeopleModal} onHide={() => {
                this.setState({showPeopleModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title><i className="fa fa-vcard-o"/> Add to
                    people</Modal.Title></Modal.Header>
                <Modal.Body>
                    <PeopleForm
                        people={noStoredParticipants}
                        onSaved={this.onSavedPeople}
                    />
                </Modal.Body>
            </Modal>
        )
    }

    render() {
        const items = this._items()
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
                {this.renderPeopleModal()}
            </div>
        )
    }

    _items() {
        const reply = {
            name: 'Reply',
            image: '/icons/inbox/ic-dropdown-reply.png',
            select: this._onReply
        }

        const replyAll = {
            name: 'Reply All',
            image: '/icons/inbox/ic-dropdown-replyall.png',
            select: this._onReplyAll
        }
        const forward = {
            name: 'Forward',
            image: '/icons/inbox/ic-dropdown-forward.png',
            select: this._onForward
        }
        const edit = {
            name: 'Edit',
            image: '/icons/inbox/icon-pencil.png',
            select: this._onEdit
        }
        const remove = {
            name: 'Delete',
            image: '/icons/inbox/ic-category-trash.png',
            select: this._onRemove
        }

        if (this.props.message.object === 'draft') {
            return [edit, remove]
        }

        if (NylasUtils.canReplyAll(this.props.message)) {
            const defaultReplyType = 'reply-all'//PlanckEnv.config.get('core.sending.defaultReplyType')
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
        const itemContent = (item) => (
            <span>
                <img src={item.image} width="16px"/>&nbsp;&nbsp;{item.name}
            </span>
        )

        return (
            <Menu items={items}
                  itemKey={(item) => item.name}
                  itemContent={itemContent}
                  onSelect={(item) => item.select()}
            />
        )
    }

    _checkNoStoredParticipants(cb) {
        const participants = []

        this.props.message.from.forEach((p) => participants.push(p))
        this.props.message.to.forEach((p) => participants.push(p))
        this.props.message.cc.forEach((p) => participants.push(p))
        this.props.message.bcc.forEach((p) => participants.push(p))

        const noStoredParticipants = uniq(participants.filter((p) => People.findOne({'emails.email': new RegExp(`^${p.email}$`, 'i')}) == null && find(AccountStore.accounts(), {emailAddress:p.email}) == null), (p) => p.email)
        if (noStoredParticipants && noStoredParticipants.length) {
            this.setState({
                noStoredParticipants,
                showPeopleModal: true,
                callback: cb
            })
            return
        }
        cb && cb()
    }
    _onReply = () => {
        const {message, conversationId} = this.props

        this._checkNoStoredParticipants(() => Actions.composeReply({message, type: 'reply', modal: true, conversationId}))
    }

    _onReplyAll = () => {
        const {message, conversationId} = this.props
        this._checkNoStoredParticipants(() => Actions.composeReply({message, type: 'reply-all', modal: true, conversationId}))
    }

    _onForward = () => {
        const {message, conversationId} = this.props
        this._checkNoStoredParticipants(() => Actions.composeForward({message, modal: true, conversationId}))
    }

    _onEdit = () => {
        const {message, conversationId} = this.props
        Actions.composeDraft({message, conversationId})
    }

    _onRemove = () => {
        Actions.removeDraft(this.props.message)
    }

    _onReport(issueType) {

    }

    _onShowOriginal() {

    }

    _onLogData() {

    }

    _onCopyToClipboard() {

    }

    onSavedPeople = () => {
        this.setState({
            showPeopleModal: false
        }, () => {
            if(this.state.callback) {
                this.state.callback()
                this.setState({callback:null})
            }
        })
    }
}

module.exports = MessageControls

import React from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'

import ItemMessage from './ItemMessage'

export default class MessageItemContainer extends React.Component {
    static propTypes = {
        message: PropTypes.object.isRequired,
        collapsed: PropTypes.bool,
        isLastMsg: PropTypes.bool,
        isBeforeReplyArea: PropTypes.bool,
        scrollTo: PropTypes.func,
        conversationId: PropTypes.string
    }

    constructor(props) {
        super(props)
        this.state = this._getStateFromStores()
    }


    componentWillReceiveProps(newProps) {
        this.setState(this._getStateFromStores(newProps))
    }

    componentDidMount() {
        /*if(this.props.message.draft)
         this._unlisten = DraftStore.listen(this._onSendingStateChanged)*/
    }

    /*shouldComponentUpdate(nextProps, nextState) {
        return !Utils.isEqualReact(nextProps, this.props) || !Utils.isEqualReact(nextState, this.state)
    }*/

    componentWillUnmount() {
        if (this._unlisten) this._unlisten()
    }

    focus() {
        this.refs.message.focus()
    }

    render() {
        return this._renderMessage({pending: false})
    }


    _renderMessage({pending}) {
        const classnames = this._classNames()
        return (
            <ItemMessage
                ref="message"
                pending={pending}
                message={this.props.message}
                className={classnames}
                collapsed={this.props.collapsed}
                isLastMsg={this.props.isLastMsg}
                conversationId={this.props.conversationId}
                onToggleCollapsed={this.props.onToggleCollapsed}
            />
        )
    }

    _classNames() {
        return classnames({
            'draft': this.props.message.object === 'draft',
            'unread': this.props.message.unread,
            'collapsed': this.props.collapsed,
            'message-item-wrap': true,
            'before-reply-area': this.props.isBeforeReplyArea
        })
    }

    _onSendingStateChanged(draftClientId) {
        if (draftClientId == this.props.message.clientId)
            this.setState(this._getStateFromStores())
    }

    _getStateFromStores(props = this.props) {
        //return {isSending: DraftStore.isSendingDraft(props.message.clientId)}
        return {}
    }
}

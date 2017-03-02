import React from 'react'
import classnames from 'classnames'

import ItemMessage from './ItemMessage'

export default class MessageItemContainer extends React.Component {
    static propTypes = {
        thread: React.PropTypes.object.isRequired,
        message: React.PropTypes.object.isRequired,
        collapsed: React.PropTypes.bool,
        isLastMsg: React.PropTypes.bool,
        isBeforeReplyArea: React.PropTypes.bool,
        scrollTo: React.PropTypes.func
    }

    constructor(props) {
        super(props);
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
        this.refs.message.focus();
    }

    render() {
        if (this.props.message.draft) {
            if (this.state.isSending)
                return this._renderMessage({pending: true})
            else
                return this._renderComposer()
        } else {
            return this._renderMessage({pending: false})
        }
    }


    _renderMessage({pending}) {
        const classnames = this._classNames();
        return <ItemMessage
            ref="message"
            pending={pending}
            thread={this.props.thread}
            message={this.props.message}
            className={classnames}
            collapsed={this.props.collapsed}
            isLastMsg={this.props.isLastMsg}/>
    }

    _renderComposer() {
        /*Composer = ComponentRegistry.findComponentsMatching({role: 'Composer'})[0]
         if (!Composer)
         return <span></span>

         return <Composer
         ref="message"
         draftClientId={@props.message.clientId}
         className={@_classNames()}
         mode={"inline"}
         threadId={@props.thread.id}
         scrollTo={@props.scrollTo}
         />*/
    }


    _classNames() {
        return classnames({
            "draft": this.props.message.draft,
            "unread": this.props.message.unread,
            "collapsed": this.props.collapsed,
            "message-item-wrap": true,
            "before-reply-area": this.props.isBeforeReplyArea
        });
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
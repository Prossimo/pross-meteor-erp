import _ from 'underscore';
import React from 'react';
import NylasUtils from '../../../api/nylas/nylas-utils';
import MessageStore from '../../../api/nylas/message-store';
import MessageItemContainer from './MessageItemContainer';

class MessageList extends React.Component {

    constructor(props) {
        super(props);

        this.onMessageStoreChanged = this.onMessageStoreChanged.bind(this);

        this.state = this._getStateFromStore()
    }

    componentDidMount() {
        this.unsubscribes = [];
        this.unsubscribes.push(MessageStore.listen(this.onMessageStoreChanged));
    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe) => {
            unsubscribe()
        });
    }

    onMessageStoreChanged() {
        this.setState(this._getStateFromStore())
    }

    _getStateFromStore() {
        return {
            messages: MessageStore.messages(),
            messagesExpandedState: MessageStore.messagesExpanded(),
            currentThread: MessageStore.currentThread(),
            loading: MessageStore.loading()
        }
    }

    render() {
        if (!this.state.currentThread) return <span />

        return (
            <div className="list-message">
                {this.renderSubject()}
                {this.renderMessages()}
            </div>
        )
    }

    renderSubject() {
        let subject = this.state.currentThread.subject

        if (!subject || subject.length == 0)
            subject = "(No Subject)";

        return (
            <div className="message-subject-wrap">
                {/*<MailImportantIcon thread={this.state.currentThread}/>*/}
                <div style={{flex: 1}}>
                    <span className="message-subject">{subject}</span>
                    {/*<MailLabelSet removable={true} thread={@state.currentThread} includeCurrentCategories={true} />*/}
                </div>
                {this.renderIcons()}
            </div>
        )
    }

    renderIcons() {
        return (
            <div className="message-icons-wrap">
                {/*{@_renderExpandToggle()}*/}
                {/*<div onClick={@_onPrintThread}>*/}
                {/*<RetinaImg name="print.png" title="Print Thread" mode={RetinaImg.Mode.ContentIsMask}/>*/}
                {/*</div>*/}
            </div>
        )

    }


    renderMessages() {
        let elements = []

        let {messages} = this.state;
        let lastMessage = !_.last(messages);
        let hasReplyArea = !(lastMessage && lastMessage.draft)
        //messages = this._messagesWithMinification(messages)
        messages.forEach((message, idx) => {

            if (message.type == "minifiedBundle") {
                elements.push(this._renderMinifiedBundle(message))
                return;
            }

            collapsed = !this.state.messagesExpandedState[message.id]
            isLastMsg = (messages.length - 1 == idx)
            isBeforeReplyArea = isLastMsg && hasReplyArea

            elements.push(  // Should be replaced message.id to message.clientId in future
                <MessageItemContainer key={message.id}
                                      ref={`message-container-${message.id}`}
                                      thread={this.state.currentThread}
                                      message={message}
                                      collapsed={collapsed}
                                      isLastMsg={isLastMsg}
                                      isBeforeReplyArea={isBeforeReplyArea}
                                      scrollTo={this._scrollTo}/>
            )
        });

        if (hasReplyArea)
            elements.push(this._renderReplyArea())

        return elements
    }

    _renderMinifiedBundle(bundle) {
        BUNDLE_HEIGHT = 36
        lines = [0, ...10].bundle.messages
        h = Math.round(BUNDLE_HEIGHT / lines.length)

        return (
            <div className="minified-bundle"
                 onClick={() => this.setState({minified: false})}
                 key={Utils.generateTempId()}>
                <div className="num-messages">{bundle.messages.length} older messages</div>
                <div className="msg-lines" style={{height: h * lines.length}}>
                    {
                        lines.map((msg, i) =>
                            <div key={msg.id} style={{height: h * 2, top: -h * i}} className="msg-line"></div>)
                    }
                </div>
            </div>
        )
    }

    _renderReplyArea() {
        return (
            <div className="footer-reply-area-wrap" onClick={this._onClickReplyArea} key='reply-area'>
                <div className="footer-reply-area">
                    <img src="/icons/"/>
                    <span className="reply-text">Write a reply…</span>
                </div>
            </div>
        )
    }


    _replyType() {
        defaultReplyType = 'reply-all'; //PlanckEnv.config.get('core.sending.defaultReplyType')
        lastMessage = _.last(_.filer(this.state.messages?this.state.messages:[], (m)=>!m.draft))
        if (!lastMessage) return 'reply';

        if (NylasUtils.canReplyAll(lastMessage)) {
            if (defaultReplyType == 'reply-all')
                return 'reply-all'
            else
                return 'reply'
        } else {
            return 'reply'
        }
    }

}

export default MessageList;

import _ from 'underscore';
import React from 'react';
import NylasUtils from '/imports/api/nylas/nylas-utils';
import MessageItemContainer from '../../inbox/MessageItemContainer';
import {ConversationStore} from '/imports/api/nylas/message-store'

class ConversationList extends React.Component {

    static propTypes = {
        conversations: React.PropTypes.array
    }
    constructor(props) {
        super(props);



        this.MINIFY_THRESHOLD = 3

        this.store = new ConversationStore(props.conversations)

        this.state = this._getStateFromStore()
        this.state.minified = true

        console.log('constructor')
    }

    _getStateFromStore() {
        return {
            messages: this.store.messages(),
            messagesExpandedState: this.store.messagesExpanded()
        }
    }
    componentDidMount() {
        this.unsubscribes = [];
        this.unsubscribes.push(this.store.listen(this.onStoreChanged));
        console.log('componentDidMount')
    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe) => {
            unsubscribe()
        });
    }

    onStoreChanged = () => {
        let newState = this._getStateFromStore();

        this.setState(newState)
    }

    render() {

        return (
            <div className="list-message" style={{marginTop:10}}>
                {this.renderMessages()}
            </div>
        )
    }

    renderMessages() {
        let elements = []

        let {messages} = this.state;
        let lastMessage = _.last(messages);
        let hasReplyArea = lastMessage && !lastMessage.draft
        messages = this._messagesWithMinification(messages)
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

    _messagesWithMinification(messages=[]) {
        if(!this.state.minified) return messages;

        messages = _.clone(messages)
        let minifyRanges = []
        let consecutiveCollapsed = 0

        messages.forEach((message, idx) => {
            if(idx == 0)return

            const expandState = this.state.messagesExpandedState[message.id]

            if(!expandState)
                consecutiveCollapsed += 1
            else
            {
                let minifyOffset
                if(expandState == "default")
                    minifyOffset = 1
                else //if expandState is "explicit"
                    minifyOffset = 0

                if(consecutiveCollapsed >= this.MINIFY_THRESHOLD + minifyOffset)
                    minifyRanges.push({
                        start: idx - consecutiveCollapsed,
                        length: (consecutiveCollapsed - minifyOffset)
                    })
                consecutiveCollapsed = 0
            }
        })

        let indexOffset = 0
        for(range of minifyRanges) {
            start = range.start - indexOffset
            const minified = {
                type: "minifiedBundle",
                messages: messages.slice(start, start + range.length)
            }
            messages.splice(start, range.length, minified)

            indexOffset += (range.length - 1)
        }

        return messages
    }

    _renderMinifiedBundle(bundle) {
        const BUNDLE_HEIGHT = 36
        const lines = bundle.messages.slice(0, 10);
        h = Math.round(BUNDLE_HEIGHT / lines.length)

        return (
            <div className="minified-bundle"
                 onClick={() => this.setState({minified: false})}
                 key={NylasUtils.generateTempId()}>
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
        const icon = `/icons/inbox/${this._replyType()}-footer.png`
        return (
            <div className="footer-reply-area-wrap" onClick={this._onClickReplyArea} key='reply-area'>
                <div className="footer-reply-area">
                    <img src={icon} width="19px"/>
                    <span className="reply-text">Write a reply…</span>
                </div>
            </div>
        )
    }


    _replyType() {
        const defaultReplyType = 'reply-all';
        const lastMessage = _.last(_.filter(this.state.messages?this.state.messages:[], (m)=>!m.draft))
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

export default ConversationList;

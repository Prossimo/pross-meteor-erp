import React from 'react';
import ItemMessage from './ItemMessage';
import MessageStore from '../../../api/nylas/message-store';

class MessageList extends React.Component {

    constructor(props) {
        super(props);

        this.onMessageStoreChanged = this.onMessageStoreChanged.bind(this);

        this.state = {
            messages: []
        }
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
        this.setState({
            currentThread: MessageStore.getCurrentThread(),
            messages: MessageStore.getData(),
            loading: MessageStore.isLoading()
        })
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
        const {messages} = this.state;

        if(!messages || messages.length==0) return <span />
        return messages.map((message) => <ItemMessage key={message.id} message={message}/>)
    }
}

export default MessageList;

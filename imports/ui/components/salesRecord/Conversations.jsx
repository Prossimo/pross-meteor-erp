import React from 'react';
import { createContainer  } from 'meteor/react-meteor-data';
import { GET_CONVERSATIONS } from '/imports/api/constants/collections';
import Conversations from '/imports/api/models/conversations/conversations'

import NylasUtils from '/imports/api/nylas/nylas-utils'
import DraftStore from '/imports/api/nylas/draft-store'
import ComposeButton from '../inbox/composer/ComposeButton'
import ComposeModal from '../inbox/composer/ComposeModal'
import EmailFrame from '../inbox/EmailFrame'

export default class ConversationsView extends React.Component{
    static propTypes = {
        salesRecord: React.PropTypes.object
    }
    constructor(props){
        super(props);

        this.state = {
        }
    }


    componentDidMount() {
        this.unsubscribes = [];
        this.unsubscribes.push(DraftStore.listen(this.onDraftStoreChanged));
    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe) => {
            unsubscribe()
        });
    }
    onDraftStoreChanged = () => {
        this.setState({
            composeState: DraftStore.draftViewStateForModal()
        })
    }

    render() {
        const { composeState } = this.state;

        console.log(this.props)
        const {salesRecord} = this.props
        return (
            <div className="conversations-tab">
                <ComposeButton/>
                <ConversationList conversations={salesRecord.conversations()}/>
                <ComposeModal isOpen={composeState && composeState.show}
                              clientId={composeState && composeState.clientId}
                              salesRecordId={salesRecord._id}
                              onClose={this.onCloseComposeModal}/>
            </div>
        )
    }


    onCloseComposeModal = () => {
        const {composeState} = this.state
        if (!composeState) return

        const draft = DraftStore.draftForClientId(composeState.clientId)

        if (!NylasUtils.isEmptyDraft(draft)) {
            if (confirm('Are you sure to discard?'))
                DraftStore.removeDraftForClientId(draft.clientId)
        } else {
            DraftStore.removeDraftForClientId(draft.clientId)
        }
    }
}

class ConversationList extends React.Component {
    static propTypes = {
        conversations: React.PropTypes.array
    }

    constructor(props) {
        super(props)

        this.state = {
            expanded:[]
        }
    }

    render() {
        const {conversations} = this.props
        if(!conversations || conversations.length==0) return <div>There is no conversation!</div>

        const {expanded} = this.state
        return (
            <div>
                {
                    conversations.map((conversation)=>{
                        return (
                            <div className="conversation-item-container" key={conversation._id}>
                                <div className="conversation-header">
                                    {this.renderToggleIcon(conversation)}
                                    <span className="name">{conversation.from && conversation.from.length ? NylasUtils.contactDisplayName(conversation.from[0]) : ""}</span>
                                    <span className="timestamp">{NylasUtils.shortTimeString(conversation.date)}</span>
                                </div>
                                <div className="conversation-body">
                                    {
                                        expanded[conversation._id] ? <EmailFrame content={conversation.body} showQuotedText={false}/> : <div className="snippet">{conversation.snippet}</div>
                                    }
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        )
    }

    renderToggleIcon(conversation) {
        let expanded = this.state.expanded
        const toggleStyle = {
            padding: 5,
            display: 'inline'
        }
        if (expanded[conversation._id])
            return (
                <div style={toggleStyle}
                     onClick={ (e) => {
                         expanded[conversation._id] = false
                         this.setState({expanded: expanded});
                         e.stopPropagation()
                     }}>
                    <img src="/icons/inbox/message-disclosure-triangle-active.png" style={{width: 11}}/>
                </div>
            )
        else
            return (
                <div style={toggleStyle}
                     onClick={ (e) => {
                         expanded[conversation._id] = true
                         this.setState({expanded: expanded});
                         e.stopPropagation()
                     }}>
                    <img src="/icons/inbox/message-disclosure-triangle.png" style={{width: 9}}/>
                </div>
            )
    }
}



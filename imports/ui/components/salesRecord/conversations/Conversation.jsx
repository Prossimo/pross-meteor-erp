import React from 'react'
import {createContainer} from 'meteor/react-meteor-data'
import TrackerReact from 'meteor/ultimatejs:tracker-react'

import NylasUtils from '/imports/api/nylas/nylas-utils'
import DraftStore from '/imports/api/nylas/draft-store'
import ComposeButton from '../../inbox/composer/ComposeButton'
import ComposeModal from '../../inbox/composer/ComposeModal'
import ConversationList from './ConversationList'
import ParticipantList from './ParticipantList'
import {SalesRecords, Conversations, Projects} from '/imports/api/models'
import {updateConversation} from '/imports/api/models/conversations/methods'

import ParticipantsSelectModal from './ParticipantsSelectModal'

export default class Conversation extends TrackerReact(React.Component) {
    static propTypes = {
        targetCollection: React.PropTypes.oneOf([SalesRecords, Projects]),
        targetId: React.PropTypes.string,   // SalesRecordId or ProjectId
        conversationId: React.PropTypes.string
    }

    constructor(props) {
        super(props)

        this.state = {}
    }


    componentDidMount() {
        this.unsubscribes = []
        this.unsubscribes.push(DraftStore.listen(this.onDraftStoreChanged))
    }

    componentWillUnmount() {
        this.unsubscribes.forEach((unsubscribe) => {
            unsubscribe()
        })
    }

    target = () => {
        const {targetCollection, targetId} = this.props
        if(!targetId) return null

        return targetCollection.findOne(targetId)
    }
    conversation = () => {
        const {conversationId} = this.props
        if(!conversationId) return null

        return Conversations.findOne(conversationId)
    }
    onDraftStoreChanged = () => {
        this.setState({
            composeState: DraftStore.draftViewStateForModal()
        })
    }

    renderComposeModal() {
        const {composeState} = this.state
        if(!composeState) return ''

        const draft = DraftStore.draftForClientId(composeState.clientId)
        if(this.props.conversationId && draft.conversationId != this.props.conversationId) return ''

        return <ComposeModal isOpen={composeState.show}
                      clientId={composeState.clientId}
                      onClose={this.onCloseComposeModal}/>
    }

    renderParticipantsSelectModal() {
        const participants = this.target().people()
        const selections = this.conversation().participants.filter(p => typeof p === 'object')


        const {showParticipantsSelectModal} = this.state

        return (
            <ParticipantsSelectModal show={showParticipantsSelectModal}
                                     onHide={() => this.setState({showParticipantsSelectModal: false})}
                                     participants={participants}
                                     selections={selections}
                                     onUpdateParticipants={this.updateParticipants}
            />
        )
    }

    render() {
        const {composeState} = this.state

        const {conversationId} = this.props

        const participants = Conversations.findOne(conversationId).getParticipants()

        return (
            <div className="conversations-tab">
                <ComposeButton conversationId={conversationId}/>
                <div style={{display: 'flex'}}>
                    <ConversationList style={{flex: 4}} conversationId={conversationId}/>
                    <ParticipantList style={{flex: 1}} participants={participants}
                                     onAddParticipant={() => this.setState({showParticipantsSelectModal: true})}
                                     onChangeParticipants={this.updateParticipants}
                    />
                </div>
                {this.renderComposeModal()}
                {this.renderParticipantsSelectModal()}
            </div>
        )
    }

    updateParticipants = (participants) => {
        const {conversationId} = this.props
        if(conversationId) {
            try {
                const conversation = this.conversation()
                conversation.participants = participants

                updateConversation.call({...conversation})

                this.setState({showParticipantsSelectModal:false})
            } catch(e) {
                console.error(e)
            }
        }
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



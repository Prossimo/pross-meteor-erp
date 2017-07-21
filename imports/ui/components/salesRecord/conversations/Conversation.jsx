import React from 'react'
import {createContainer} from 'meteor/react-meteor-data'
import {Modal} from 'react-bootstrap'

import NylasUtils from '/imports/api/nylas/nylas-utils'
import DraftStore from '/imports/api/nylas/draft-store'
import ComposeButton from '../../inbox/composer/ComposeButton'
import ComposeModal from '../../inbox/composer/ComposeModal'
import ConversationList from './ConversationList'
import ParticipantList from './ParticipantList'
import {SalesRecords, Conversations} from '/imports/api/models'
import ParticipantsSelectModal from './ParticipantsSelectModal'

export default class Conversation extends React.Component {
    static propTypes = {
        salesRecordId: React.PropTypes.string,
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

    onDraftStoreChanged = () => {
        this.setState({
            composeState: DraftStore.draftViewStateForModal()
        })
    }

    renderComposeModal() {
        const {composeState} = this.state
        if(!composeState) return ''

        const draft = DraftStore.draftForClientId(composeState.clientId)
        if(this.props.salesRecordId && draft.salesRecordId != this.props.salesRecordId || this.props.conversationId && draft.conversationId != this.props.conversationId) return ''

        return <ComposeModal isOpen={composeState.show}
                      clientId={composeState.clientId}
                      onClose={this.onCloseComposeModal}/>
    }
    renderParticipantsSelectModal() {
        const {conversationId} = this.props
        if (!conversationId) return ''

        const conversation = Conversations.findOne(conversationId)

        const {showParticipantsSelectModal} = this.state

        return (
            <ParticipantsSelectModal show={showParticipantsSelectModal}
                                     onHide={() => this.setState({showParticipantsSelectModal: false})}
                                     conversation={conversation}/>
        )
    }

    render() {
        const {composeState} = this.state

        const {salesRecordId, conversationId} = this.props

        let participants = []
        if (salesRecordId) {
            participants = SalesRecords.findOne(salesRecordId).people()
        } else if (conversationId) {
            participants = Conversations.findOne(conversationId).getParticipants()
        }
        return (
            <div className="conversations-tab">
                <ComposeButton salesRecordId={salesRecordId} conversationId={conversationId}/>
                <div style={{display: 'flex'}}>
                    <ConversationList style={{flex: 4}} salesRecordId={salesRecordId} conversationId={conversationId}/>
                    <ParticipantList style={{flex: 1}} participants={participants}
                                     addableParticipant={conversationId != null}
                                     onAddParticipant={() => this.setState({showParticipantsSelectModal: true})}/>
                </div>
                {this.renderComposeModal()}
                {this.renderParticipantsSelectModal()}
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



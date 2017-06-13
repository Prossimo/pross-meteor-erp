import React from 'react'
import { createContainer  } from 'meteor/react-meteor-data'

import NylasUtils from '/imports/api/nylas/nylas-utils'
import DraftStore from '/imports/api/nylas/draft-store'
import ComposeButton from '../../inbox/composer/ComposeButton'
import ComposeModal from '../../inbox/composer/ComposeModal'
import ConversationList from './ConversationList'

export default class ConversationsView extends React.Component{
    static propTypes = {
        salesRecord: React.PropTypes.object
    }
    constructor(props){
        super(props)

        this.state = {
        }
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

    render() {
        const { composeState } = this.state

        const {salesRecord} = this.props
        return (
            <div className="conversations-tab">
                <ComposeButton salesRecordId={salesRecord._id}/>
                <ConversationList salesRecord={salesRecord}/>
                <ComposeModal isOpen={composeState && composeState.show}
                              clientId={composeState && composeState.clientId}
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



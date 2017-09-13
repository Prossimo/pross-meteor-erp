import {FlowRouter} from 'meteor/kadira:flow-router'
import React, {PropTypes} from 'react'
import {createContainer} from 'meteor/react-meteor-data'
import {Alert} from 'react-bootstrap'
import ItemMessage from '../components/inbox/ItemMessage'
import NylasAPI from '/imports/api/nylas/nylas-api'
import classnames from 'classnames'
import {Messages} from '/imports/api/models'
import DraftStore from '/imports/api/nylas/draft-store'
import NylasUtils from '/imports/api/nylas/nylas-utils'
import ComposeModal from '../components/inbox/composer/ComposeModal'

class EmailViewPage extends React.Component {
    static propTypes = {
        messageId: PropTypes.string
    }

    constructor(props) {
        super(props)

        const {loading, message} = props

        this.state = {
            loading,
            message
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

    componentWillReceiveProps(newProps) {
        this.setState({
            loading:newProps.loading,
            message:newProps.message
        })
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

    renderComposeModal() {
        const {composeState} = this.state
        if(!composeState) return ''

        const draft = DraftStore.draftForClientId(composeState.clientId)

        return <ComposeModal isOpen={composeState.show}
                             clientId={composeState.clientId}
                             onClose={this.onCloseComposeModal}/>
    }
    render() {
        const loadingAlert = (
            <Alert bsStyle="info">
                <i className="fa fa-spinner fa-spin fa-fw"></i>
            </Alert>
        )

        const {loading, message} = this.state
        if (loading || !message) return loadingAlert


        const classNames = classnames({
            'message-item-wrap': true
        })
        return (
            <div className="inbox-page">
                <div className="list-message">
                    <div className="message-subject-wrap"><span className="message-subject">{message.subject}</span></div>
                    <ItemMessage
                        ref="message"
                        className={classNames}
                        message={message}
                        viewonly
                        conversationId={message.conversationId()}
                    />
                    {this.renderComposeModal()}
                </div>
            </div>
        )
    }
}

export default createContainer(() => {
    const subscribers = [Meteor.subscribe('getNylasAccounts'), Meteor.subscribe('MyMessages')]

    let message
    const messageId = FlowRouter.getQueryParam('message_id')
    if(messageId) {
        message = Messages.findOne({id: messageId})
    } else {
        const threadId = FlowRouter.getQueryParam('thread_id')
        if (threadId) {
            message = Messages.findOne({thread_id: threadId}, {sort:{date:-1}})
        }
    }
    return {
        loading: subscribers.reduce((result, subscriber) => result && !subscriber.ready(), true),
        message
    }
}, EmailViewPage)
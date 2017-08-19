import React from 'react'
import {Tabs, Tab, Modal} from 'react-bootstrap'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import Conversation from './Conversation'
import {Conversations as ConversationsModel, SalesRecords, Projects} from '/imports/api/models'
import ConversationForm from './ConversationForm'

export default class Conversations extends TrackerReact(React.Component) {
    static propTypes = {
        targetCollection: React.PropTypes.oneOf([SalesRecords, Projects]).isRequired,
        targetId: React.PropTypes.string.isRequired
    }
    constructor(props) {
        super(props)

        this.state = {
            key: 1,
            subscriptions: {
                //conversations: Meteor.subscribe('conversations')
            }
        }
    }
    handleSelect = (key) => {
        if(key == -1) {
            this.setState({showModal:true})
        } else {
            this.setState({key})
        }
    }
    render() {
        const {targetCollection, targetId} = this.props
        const target = targetCollection.findOne({_id:targetId})

        console.log(target, JSON.stringify({_id: {$in:target.conversationIds||[]}}))
        const conversations = ConversationsModel.find({_id: {$in:target.conversationIds||[]}}).fetch()
        return (
            <Tabs id="conversation-tab-container" activeKey={this.state.key} onSelect={this.handleSelect} style={{height:'100%'}} >
                {
                    conversations.map((c, i) => <Tab key={`tab-${c._id}`} eventKey={c._id} title={c.name} style={{height:'100%'}}><Conversation targetCollection={targetCollection} targetId={targetId} conversationId={c._id}/></Tab>)
                }
                <Tab eventKey={-1} title="+" style={{height:'100%'}}/>
                {this.renderModal()}
            </Tabs>
        )
    }
    renderModal() {
        const {showModal} = this.state

        return (
            <Modal show={showModal} onHide={() => {
                this.setState({showModal: false})
            }} bsSize="large">
                <Modal.Header closeButton><Modal.Title>Add conversation</Modal.Title></Modal.Header>
                <Modal.Body>
                    <ConversationForm targetCollection={this.props.targetCollection} targetId={this.props.targetId} onSaved={() => this.setState({showModal:false})}/>
                </Modal.Body>
            </Modal>
        )

    }
}
import _ from 'underscore'
import React, {PropTypes} from 'react'
import {Modal, Form, FormGroup, Alert, Button, Col} from 'react-bootstrap'
import ParticipantsSelector from './ParticipantsSelector'
import {updateConversation} from '/imports/api/models/conversations/methods'

export default class ParticipantsSelectModal extends React.Component {
    static propTypes = {
        show: PropTypes.bool,
        onHide: PropTypes.func,
        conversation: PropTypes.object.isRequired
    }

    constructor(props) {
        super(props)

        const conversation = props.conversation
        this.state = {
            show: props.show,
            participants: conversation.salesRecord().people(),
            selections: _.pluck(conversation.getParticipants(), '_id'),
            error: null
        }
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            show: newProps.show
        })
    }

    onChangeParticipants = (participants) => {
        this.setState({selections: participants})
    }

    onSubmit = (evt) => {
        evt.preventDefault()

        const {conversation} = this.props
        const {selections} = this.state
        if(!selections || selections.length == 0) {return this.setState({error:'Should select at least one participant'})}
        try {
            updateConversation.call(Object.assign({...conversation}, {participants:selections}))
            this.props.onHide()
        } catch(e) {
            console.error(e)
            this.setState({error: e.message || e.reason})
        }
    }

    render() {

        const {show, participants, selections, error} = this.state

        return (
            <Modal show={show} onHide={() => this.props.onHide()} bsSize="large">
                <Modal.Header closeButton><Modal.Title>Select participants</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form onSubmit={this.onSubmit} horizontal>
                        {error && <Alert bsStyle='danger'>
                            {error}
                        </Alert>}
                        <ParticipantsSelector participants={participants} selections={selections}
                                              onChange={this.onChangeParticipants}/>

                        <FormGroup>
                            <Col sm={12} style={{textAlign: 'right'}}>
                                <Button type="submit" bsStyle="primary">Save</Button>
                            </Col>
                        </FormGroup>
                    </Form>
                </Modal.Body>
            </Modal>
        )
    }

}
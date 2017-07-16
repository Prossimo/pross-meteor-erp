import React from 'react'
import {Button, Form, FormGroup, FormControl, Col, Alert} from 'react-bootstrap'
import {warning} from '/imports/api/lib/alerts'
import {insertConversation, updateConversation} from '/imports/api/models/conversations/methods'

export default class ConversationForm extends React.Component {
    static propTypes = {
        name: React.PropTypes.string,
        salesRecordId: React.PropTypes.string.isRequired,
        _id: React.PropTypes.string,
        onSaved: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            name: props.name ? props.name : '',
            error: null,
        }
    }

    render() {
        const {name} = this.state
        return (
            <div>
                <Alert bsStyle='danger' className={ !this.state.error ? 'hide' : '' }>
                    {this.state.error}
                </Alert>
                <Form style={{padding: 10}} horizontal onSubmit={this.onSubmit}>
                    <FormGroup controlId="formHorizontalName">
                        <Col sm={12}>
                            <FormControl type="text" placeholder="Conversation name" value={name}
                                         onChange={(evt) => this.setState({name: evt.target.value})}/>
                        </Col>
                    </FormGroup>


                    <FormGroup>
                        <Col sm={12} style={{textAlign: 'right'}}>
                            <Button type="submit" bsStyle="primary">{this.props._id ? 'Update' : 'Create'}</Button>
                        </Col>
                    </FormGroup>
                </Form>
            </div>

        )
    }

    onSubmit = (evt) => {
        evt.preventDefault()
        const {name} = this.state
        const {_id, salesRecordId} = this.props

        try{
            if(_id) {
                updateConversation.call({_id, salesRecordId, name})
            } else {
                insertConversation.call({salesRecordId, name})
            }
            if(this.props.onSaved) this.props.onSaved()
        } catch(e) {
            // warning is displayed under backdrop
            //warning(e.message)
          this.setState({
              error: e.message || e.reason
          })
        }
    }
}

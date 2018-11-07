import React from 'react'
import PropTypes from 'prop-types'
import {Button, Form, FormGroup, FormControl, Col, Alert} from 'react-bootstrap'
import {insertClientStatus, updateClientStatus} from '/imports/api/models/salesRecords/verified-methods'

export default class ClientStatusForm extends React.Component {
    static propTypes = {
        onSaved: PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            name: props.name,
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
                            <FormControl type="text" placeholder="Status name" value={name}
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
        const {_id} = this.props

        try{
            if(_id) {
                updateClientStatus.call({_id,name})
            } else {
                insertClientStatus.call({name})
            }

            if (this.props.onSaved) this.props.onSaved()
        } catch(e) {
          this.setState({
              error: e.message || e.reason
          })
        }
    }
}

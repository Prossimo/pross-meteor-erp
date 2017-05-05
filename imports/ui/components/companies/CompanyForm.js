import React from 'react'
import {Button, Form, FormGroup, FormControl, Col, ControlLabel} from 'react-bootstrap'
import {warning} from "/imports/api/lib/alerts"
import {Companies} from '/imports/api/models'
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import { Loader, Types } from 'react-loaders';
import 'loaders.css/loaders.min.css';



export default class CompanyForm extends React.Component {
    static propTypes = {
        company: React.PropTypes.object,
        onSaved: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            name: props.company ? props.company.name : '',
            website: props.company ? props.company.website : '',
            type: props.company ? props.company.type : '',
            addresses: props.company ? props.company.addresses : '',
            phone_numbers: props.company ? props.company.phone_numbers : [],
            blocking: false
        }
    }

    render() {
        const {name, email, description, phone_numbers} = this.state
        return (
          <BlockUi tag="div" loader={<Loader active type="line-spin-fade-loader" color="#5b8bff"/>} blocking={this.state.blocking}>
            <Form style={{padding: 10}} horizontal onSubmit={this.onSubmit}>
                <FormGroup controlId="formHorizontalName">
                    <Col sm={3}>
                        Name
                    </Col>
                    <Col sm={9}>
                        <FormControl type="text" placeholder="Name" value={name}
                                     onChange={(evt) => this.setState({name: evt.target.value})}/>
                    </Col>
                </FormGroup>
                <FormGroup controlId="formHorizontalEmail">
                    <Col sm={3}>
                        Email
                    </Col>
                    <Col sm={9}>
                        <FormControl type="email" placeholder="Email" value={email}
                                     onChange={(evt) => this.setState({email: evt.target.value})}/>
                    </Col>
                </FormGroup>

                <FormGroup controlId="formHorizontalDescription">
                    <Col sm={12}>
                        <ControlLabel>Description</ControlLabel>
                        <FormControl componentClass="textarea" placeholder="" value={description}
                                     onChange={(evt) => this.setState({description: evt.target.value})}/>
                    </Col>
                </FormGroup>

                <FormGroup>
                    <Col sm={12} style={{textAlign:'right'}}>
                        <Button type="submit" bsStyle="primary">{this.props.company ? "Update" : "Create"}</Button>
                    </Col>
                </FormGroup>
            </Form>
          </BlockUi>

        )
    }

    onSubmit = (evt) => {
        evt.preventDefault()

        let data = {name, email, description, phone_numbers} = this.state

        if (this.props.company) data._id = this.props.company._id
        this.setState({blocking: true});
        delete data.blocking
        Meteor.call('insertOrUpdateCompany', data, (err, companyId) => {
            this.setState({blocking: false});
            if (err) return warning(err.message)

            if (this.props.onSaved) this.props.onSaved(Companies.findOne({_id:companyId}), this.props.company != null)
        })
    }
}

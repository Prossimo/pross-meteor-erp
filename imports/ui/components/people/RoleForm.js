import React from 'react'
import {Button, Form, FormGroup, FormControl, Col} from 'react-bootstrap'
import {warning} from "/imports/api/lib/alerts"
import {updateDesignation} from '/imports/api/models/people/methods'
import {PeopleDesignations} from '/imports/api/models'


export default class RoleForm extends React.Component {
    static propTypes = {
        onSaved: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        this.state = {
            name: props.type ? props.type.name : ''
        }
    }

    render() {
        const {name} = this.state
        return (
            <div>
                <Form style={{padding: 10}} horizontal onSubmit={this.onSubmit}>
                    <FormGroup controlId="formHorizontalName">
                        <Col sm={12}>
                            {this.props.designation.name}
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="formHorizontalName">
                        <Col sm={12}>
                            <FormControl type="text" placeholder="Role name" value={name}
                                         onChange={(evt) => this.setState({name: evt.target.value})}/>
                        </Col>
                    </FormGroup>

                    <FormGroup>
                        <Col sm={12} style={{textAlign: 'right'}}>
                            <Button type="submit" bsStyle="primary">{this.props.type ? "Update" : "Create"}</Button>
                        </Col>
                    </FormGroup>
                </Form>
            </div>

        )
    }

    onSubmit = (evt) => {
        evt.preventDefault()

        const {name} = this.state


        try{
            this.props.designation.roles.push(name)
            updateDesignation.call(this.props.designation)

            if (this.props.onSaved) this.props.onSaved(PeopleDesignations.findOne({_id: this.props.designation._id}), this.props.designation != null)
        } catch(e) {
            console.log(e)
            warning(e.message)
        }
    }
}

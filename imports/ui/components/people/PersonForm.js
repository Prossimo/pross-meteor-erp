import {Roles} from 'meteor/alanning:roles'
import React from 'react'
import {Button, Form, FormGroup, FormControl, Col, Modal} from 'react-bootstrap'
import Select from 'react-select'
import {warning} from '/imports/api/lib/alerts'
import {PeopleDesignations, Companies, People, ROLES} from '/imports/api/models'
import {insertPerson, updatePerson} from '/imports/api/models/people/methods'
import PhoneNumbersInput from './PhoneNumbersInput'
import EmailsInput from './EmailsInput'
import RoleForm from './RoleForm'


export default class PersonForm extends React.Component {
    static propTypes = {
        person: React.PropTypes.object,
        onSaved: React.PropTypes.func
    }

    constructor(props) {
        super(props)

        const person = props.person ? props.person : (props.person_id ? People.findOne(props.person_id) : null)
        const name = person ? person.name : props.name
        const emails = person ? person.emails : (props.email ? [{email:props.email, is_default:true}] : [])

        this.state = {
            name: name || '',
            twitter: person ? person.twitter || '' : '',
            facebook: person ? person.facebook || '' : '',
            linkedin: person ? person.linkedin || '' : '',
            designation_id: person ? person.designation_id : '',
            role: person ? person.role || '' : '',
            emails,
            phone_numbers: person ? person.phone_numbers : [],
            company_id: person ? person.company_id : '',
            position: person ? person.position || '' : '',

            contact_id: props.contactId,

            designations: PeopleDesignations.find().fetch(),
            companies: Companies.find().fetch(),
            showRoleModal: false
        }

        this.person = person
    }

    render() {
        const {name, twitter, facebook, linkedin, designation_id, role, emails, phone_numbers, company_id, position, designations, companies} = this.state

        const designationOptions = designations.map(d => ({value: d._id, label: d.name}))
        let designation, designationValue, roleOptions = [], roleValue, roleAddable = false
        if (designation_id) {
            designation = PeopleDesignations.findOne({_id: designation_id})
            if (designation) {
                designationValue = {value: designation._id, label: designation.name}
                roleOptions = designation.roles.map(r => ({value: r, label: r}))
                roleValue = designation.roles.indexOf(role) > -1 ? {value: role, label: role} : null
                roleAddable = designation.role_addable && Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN])
            }
        }

        const companyOptions = companies.map(c => ({value: c._id, label: c.name}))
        let companyValue
        if (company_id) {
            const company = Companies.findOne({_id: company_id})
            if (company) companyValue = {value: company._id, label: company.name}
        }
        return (
            <div>
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
                    <FormGroup controlId="formHorizontalTwitter">
                        <Col sm={3}>
                            Twitter
                        </Col>
                        <Col sm={9}>
                            <FormControl type="url" placeholder="Twitter" value={twitter}
                                         onChange={(evt) => this.setState({twitter: evt.target.value})}/>
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="formHorizontalFacebook">
                        <Col sm={3}>
                            Facebook
                        </Col>
                        <Col sm={9}>
                            <FormControl type="url" placeholder="Facebook" value={facebook}
                                         onChange={(evt) => this.setState({facebook: evt.target.value})}/>
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="formHorizontalLinkedin">
                        <Col sm={3}>
                            LinkedIn
                        </Col>
                        <Col sm={9}>
                            <FormControl type="url" placeholder="LinkedIn" value={linkedin}
                                         onChange={(evt) => this.setState({linkedin: evt.target.value})}/>
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="formHorizontalDesignation">
                        <Col sm={3}>
                            Designation
                        </Col>
                        <Col sm={9}>
                            <Select
                                options={designationOptions}
                                value={designationValue}
                                onChange={this.onChangeDesignation}
                                required
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="formHorizontalRole">
                        <Col sm={3}>
                            Role
                        </Col>
                        <Col sm={9}>
                            <div style={{display: 'flex', flexDirection: 'row'}}>
                                <div style={{flex:1}}>
                                    <Select
                                    options={roleOptions}
                                    value={roleValue}
                                    onChange={this.onChangeRole}
                                    required
                                /></div>
                                {roleAddable && <Button onClick={this.onClickAddRole}><i className="fa fa-plus"/></Button>}
                            </div>
                        </Col>
                    </FormGroup>
                    <PhoneNumbersInput phoneNumbers={phone_numbers}
                                       onChange={(data) => this.setState({phone_numbers: data})}/>
                    <EmailsInput emails={emails} onChange={(data) => this.setState({emails: data})}/>
                    <FormGroup controlId="formHorizontalCompany">
                        <Col sm={3}>
                            Company
                        </Col>
                        <Col sm={9}>
                            <Select
                                options={companyOptions}
                                value={companyValue}
                                onChange={this.onChangeCompany}
                            />
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="formHorizontalPosition">
                        <Col sm={3}>
                            Position
                        </Col>
                        <Col sm={9}>
                            <FormControl type="text" placeholder="Position" value={position}
                                         onChange={(evt) => this.setState({position: evt.target.value})}/>
                        </Col>
                    </FormGroup>
                    <FormGroup>
                        <Col sm={12} style={{textAlign: 'right'}}>
                            <Button type="submit" bsStyle="primary">{this.person ? 'Update' : 'Create'}</Button>
                        </Col>
                    </FormGroup>
                </Form>
                {this.renderRoleModal(designation)}
            </div>

        )
    }

    renderRoleModal(designation) {
        if(!designation) return ''

        const {showRoleModal} = this.state
        const title = 'Add role'

        return (
            <Modal show={showRoleModal} bsSize="small" onHide={() => {
                this.setState({showRoleModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <RoleForm designation={designation} onSaved={this.onSavedRole}/>
                </Modal.Body>
            </Modal>
        )
    }

    onSavedRole = (role, updating) => {
        this.setState({
            showRoleModal: false,
            designations: PeopleDesignations.find().fetch()
        })
    }
    onChangeDesignation = (item) => {
        this.setState({
            designation_id: item ? item.value : null,
            role: null
        })
    }
    onChangeRole = (item) => {
        this.setState({
            role: item ? item.value : null
        })
    }
    onClickAddRole = () => {
        this.setState({
            showRoleModal: true
        })
    }
    onChangeCompany = (item) => {
        this.setState({
            company_id: item ? item.value : null
        })
    }
    onSubmit = (evt) => {
        evt.preventDefault()

        const data = {
            name,
            twitter,
            facebook,
            linkedin,
            designation_id,
            role,
            emails,
            phone_numbers,
            company_id,
            position,
            contact_id
        } = this.state

        let personId
        try {
            if (this.person) {
                personId = this.person._id
                data._id = personId
                updatePerson.call(data)
            } else {
                personId = insertPerson.call(data)
            }

            if (this.props.onSaved) this.props.onSaved(personId)
        } catch (e) {
            console.log(e)
            warning(e.error)
        }

    }
}

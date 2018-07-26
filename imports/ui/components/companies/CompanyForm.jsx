import React, { Component } from 'react'
import map from 'lodash/map'
import PropTypes from 'prop-types'
import {Button, Form, FormGroup, FormControl, Col, ControlLabel} from 'react-bootstrap'
import Select from 'react-select'
import {Modal} from 'react-bootstrap'
import {warning} from '/imports/api/lib/alerts'
import {Companies, CompanyTypes} from '/imports/api/models'
import {insertCompany, updateCompany} from '/imports/api/models/companies/methods'
import BlockUi from 'react-block-ui'
import 'react-block-ui/style.css'
import {Loader, Types} from 'react-loaders'
import 'loaders.css/loaders.min.css'
import AddressInput from './AddressInput'
import PhoneNumberInput from './PhoneNumberInput'
import CompanyTypeForm from './CompanyTypeForm'
import {ClientErrorLog} from '/imports/utils/logger'


const URL_PATTERN = '^(https?:\/\/)?([\da-z1-9\.-]+)\.([a-z1-9\.]{2,6})([\/\w \.-]*)*\/?$'
const HTTP_PROTOCOL = 'http://'
const HTTPS_PROTOCOL = 'https://'


class CompanyForm extends Component {
    static propTypes = {
        company: PropTypes.object,
        onSaved: PropTypes.func
    }

    state = {
        typeOptions: CompanyTypes.find({}).fetch().map((t) => ({ value: t._id, label: t.name })),
        name: this.props.company ? this.props.company.name : this.props.name,
        website: this.props.company ? this.props.company.website : '',
        type_ids: this.props.company ? this.props.company.type_ids : [],
        addresses: this.props.company ? this.props.company.addresses : [],
        phone_numbers: this.props.company ? this.props.company.phone_numbers : [],
        blocking: false,

        showCompanyTypeModal: false,
        creatingType: false,
        selectedCompanyType: null
    }

    onClickAddCompanyType = () => {
        this.setState({
            showCompanyTypeModal: true,
            creatingType: true,
            selectedCompanyType: null
        })
    }
    render() {
        const {name, website, typeOptions, type_ids, addresses, phone_numbers} = this.state
        const types = type_ids && type_ids.length ? CompanyTypes.find({_id:{$in:type_ids}}).fetch().map(t => ({value:t._id,label:t.name})) : null
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
                    <FormGroup controlId="formHorizontalWebsite">
                        <Col sm={3}>
                            Website
                        </Col>
                        <Col sm={9}>
                            <FormControl type="text" placeholder="Website" value={website}
                                         onChange={(evt) => this.setState({website: evt.target.value})} pattern={URL_PATTERN}/>
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="formHorizontalType">
                        <Col sm={3}>
                            Type
                        </Col>
                        <Col sm={8}>
                            <Select
                                multi
                                value={types}
                                onChange={(items) => this.setState({type_ids: map(items,'value')})}
                                options={typeOptions}
                                clearable={true}
                            />
                        </Col>
                        <Col sm={1}>
                            <Button onClick={this.onClickAddCompanyType}><i className="fa fa-plus"/></Button>
                        </Col>
                    </FormGroup>
                    <AddressInput addresses={addresses} onChange={(data) => this.setState({addresses:data})}/>
                    <PhoneNumberInput phoneNumbers={phone_numbers} onChange={(data) => this.setState({phone_numbers:data})}/>


                    <FormGroup>
                        <Col sm={12} style={{textAlign: 'right'}}>
                            <Button type="submit" bsStyle="primary">{this.props.company ? 'Update' : 'Create'}</Button>
                        </Col>
                    </FormGroup>
                </Form>
                {this.renderCompanyTypeModal()}
            </div>

        )
    }

    renderCompanyTypeModal = () => {
        const {showCompanyTypeModal, selectedCompanyType, creatingType} = this.state
        const title = selectedCompanyType&&!creatingType ? 'Edit Company Type' : 'Create Company Type'

        return (
            <Modal show={showCompanyTypeModal} bsSize="small" onHide={() => {
                this.setState({showCompanyTypeModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title>{title}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <CompanyTypeForm
                        type={!creatingType ? selectedCompanyType : null}
                        onSaved={this.onSavedCompanyType}
                    />
                </Modal.Body>
            </Modal>
        )
    }

    onSavedCompanyType = (companyType, updating) => {
        this.setState({
            showCompanyTypeModal: false,
            typeOptions: CompanyTypes.find({}).fetch().map((t) => ({value: t._id, label: t.name}))
        })
        if(updating) {
            this.setState({
                selectedCompanyType: companyType
            })
        }
    }

    onSubmit = (evt) => {
        evt.preventDefault()

        var {name, website, type_ids, addresses, phone_numbers} = this.state

        if(website && website.length>0 && website.indexOf(HTTP_PROTOCOL) == -1 && website.indexOf(HTTPS_PROTOCOL) == -1) website = `http://${website}`

        const data= {name, website, type_ids, addresses, phone_numbers}

        const {company, toggleLoader, onSaved} = this.props
        if(toggleLoader) toggleLoader(true)
        delete data.blocking

        try{
            let companyId
            if (company && company._id) {
                companyId = company._id
                data._id = companyId
                updateCompany.call(data)
            } else {
                companyId = insertCompany.call(data)
                console.log(companyId)
            }

            if(toggleLoader) toggleLoader(false)
            if (onSaved) onSaved(Companies.findOne({_id: companyId}), company != null)
        }catch(e){
            ClientErrorLog.error(e)
            if(toggleLoader) toggleLoader(false)
            warning(e.message)
        }
    }
}

export default CompanyForm;

import React from 'react'
import {Button, Form, FormGroup, FormControl, Col, ControlLabel} from 'react-bootstrap'
import Select from 'react-select'
import {warning} from "/imports/api/lib/alerts"
import {Companies} from '/imports/api/models'
import {insertCompany, updateCompany} from '/imports/api/models/companies/methods'
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import {Loader, Types} from 'react-loaders';
import 'loaders.css/loaders.min.css';
import AddressInput from './AddressInput'
import PhoneNumberInput from './PhoneNumberInput'

const companyTypeOptions = []//Companies.TYPES.map((t) => ({value: t, label: t}))

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
            addresses: props.company ? props.company.addresses : [],
            phone_numbers: props.company ? props.company.phone_numbers : [],
            blocking: false
        }

    }

    render() {
        const {name, website, type, addresses, phone_numbers} = this.state
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
                            <FormControl type="url" placeholder="Website" value={website}
                                         onChange={(evt) => this.setState({website: evt.target.value})}/>
                        </Col>
                    </FormGroup>
                    <FormGroup controlId="formHorizontalType">
                        <Col sm={3}>
                            Type
                        </Col>
                        <Col sm={9}>
                            <Select
                                value={{value:type,label:type}}
                                onChange={(item) => this.setState({type: item.value})}
                                options={companyTypeOptions}
                                clearable={true}
                            />
                        </Col>
                    </FormGroup>
                    <AddressInput addresses={addresses} onChange={(data)=>this.setState({addresses:data})}/>
                    <PhoneNumberInput phoneNumbers={phone_numbers} onChange={(data)=>this.setState({phone_numbers:data})}/>


                    <FormGroup>
                        <Col sm={12} style={{textAlign: 'right'}}>
                            <Button type="submit" bsStyle="primary">{this.props.company ? "Update" : "Create"}</Button>
                        </Col>
                    </FormGroup>
                </Form>
            </div>

        )
    }

    onSubmit = (evt) => {
        evt.preventDefault()

        let data = {name, website, type, addresses, phone_numbers} = this.state

        this.props.toggleLoader(true);
        delete data.blocking

        try{
            let companyId
            if (this.props.company) {
                companyId = this.props.company._id
                data._id = companyId
                updateCompany.call(data)
            } else {
                companyId = insertCompany.call(data)
                console.log(companyId)
            }

            this.props.toggleLoader(false);
            if (this.props.onSaved) this.props.onSaved(Companies.findOne({_id: companyId}), this.props.company != null)
        }catch(e){
            console.log(e)
            this.props.toggleLoader(false)
            warning(e.message)
        }
    }
}

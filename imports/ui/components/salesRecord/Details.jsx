/* global moment*/
import {Roles} from 'meteor/alanning:roles'
import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {Modal} from 'react-bootstrap'
import {info, warning} from '/imports/api/lib/alerts'
import {SHIPPING_MODE_LIST, STATES} from '/imports/api/constants/project'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import {DEAL_PRIORITY, DEAL_PROBABILITY} from '/imports/api/models/salesRecords/salesRecords'
import {ClientStatus, SupplierStatus, ROLES, Companies, CompanyTypes} from '/imports/api/models'
import ClientStatusForm from './components/ClientStatusForm'
import SupplierStatusForm from './components/SupplierStatusForm'
import {removeClientStatus, removeSupplierStatus} from '/imports/api/models/salesRecords/verified-methods'
import {ClientErrorLog} from '/imports/utils/logger'

class Details extends TrackerReact(React.Component) {
    constructor(props) {
        super(props)

        this.salesRecord = props.salesRecord
        this.state = {
            salesRecord: this.salesRecord,
        }
        this.changeState = this.changeState.bind(this)
        this.changeStateElem = this.changeStateElem.bind(this)
        this.saveAttributes = this.saveAttributes.bind(this)
        this.saveBilling = this.saveBilling.bind(this)
        this.saveShipping = this.saveShipping.bind(this)
    }

    changeStateElem(field, value, index) {
        const values = this.state.salesRecord[field] || []

        values[index] = value

        this.state.salesRecord[field] = values
        this.setState({
            salesRecord: this.state.salesRecord,
        })
    }

    changeState(field, value) {
        this.state.salesRecord[field] = value
        this.setState({
            salesRecord: this.state.salesRecord,
        })
    }

    saveBilling() {
        const salesRecordId = this.state.salesRecord._id
        const billing = _.pick(
            this.state.salesRecord,
            'billingContactName',
            'billingContactEmail',
            'billingContactPhone',
            'billingAddress',
            'billingNotes',
        )
        Meteor.call('updateProjectBilling', salesRecordId, billing, (error, result) => {
            if (error) return warning(`Problems with updating project. ${error.error}`)
            return info('Success update project')
        })
    }

    saveShipping() {
        const salesRecordId = this.state.salesRecord._id
        const shipping = _.pick(
            this.state.salesRecord,
            'shippingContactName',
            'shippingContactName',
            'shippingContactPhone',
            'shippingAddress',
            'shippingNotes',
        )
        Meteor.call('updateProjectShipping', salesRecordId, shipping, (error, result) => {
            if (error) return warning(`Problems with updating project. ${error.error}`)
            return info('Success update project')
        })
    }

    saveStatus = () => {
        const salesRecordId = this.state.salesRecord._id
        const status = _.pick(
            this.state.salesRecord,
            'teamLead',
            'bidDueDate',
            'priority',
            'expectedRevenue',
            'totalSquareFootage',
            'probability',
            'clientStatus',
            'supplierStatus',
        )
        Meteor.call('saveSalesRecordStatus', salesRecordId, status, (error, result) => {
            if (error) return warning(`Problems with updating project. ${error.error}`)
            return info('Success update project')
        })
    }

    saveAttributes() {
        const salesRecordId = this.state.salesRecord._id
        const attributes = _.pick(
            this.state.salesRecord,
            'shippingMode',
            'productionStartDate',
            'supplier',
            'shipper',
            'estProductionTime',
            'estLeadTime',
            'estProductionCompletion',
            'estDeliveryRange',
            'actClientPaymentReceived',
            'actProductionCompletion',
            'actShippingDate',
            'actualDeliveryDate',
        )
        Meteor.call('updateProjectAttributes', salesRecordId, attributes, (error, result) => {
            if (error) return warning(`Problems with updating project. ${error.error}`)
            return info('Success update project')
        })
    }

    handleAddClientStatus = () => {
        this.setState({showClientStatusModal: true})
    }

    handleAddSupplierStatus = () => {
        this.setState({showSupplierStatusModal: true})

    }

    onSavedClientStatus = () => {
        this.setState({showClientStatusModal: false})
    }

    onSavedSupplierStatus = () => {
        this.setState({showSupplierStatusModal: false})
    }

    onRemoveOption = (field, _id) => {
        try {
            if (field === 'clientStatus') {
                removeClientStatus.call({_id})
            } else if (field === 'supplierStatus') {
                removeSupplierStatus.call({_id})
            }
        } catch (e) {
            ClientErrorLog.error(e)
        }
    }

    saveSalesRecord = () => {
        console.log('saveSalesRecord')

        const salesRecord = _.clone(this.state.salesRecord)

        if(!_.isEqual(this.salesRecord, salesRecord)) {

            console.log('salesRecord', salesRecord)
            Meteor.call('updateSalesRecord', {
                _id: salesRecord._id,
                data: {..._.omit(salesRecord, ['_id', 'createdAt', 'modifiedAt', 'stakeholders', 'folderId', 'slackChannel', 'conversationIds', 'taskFolderId'])}
            }, (err) => {
                if (err) {
                    ClientErrorLog.error(err)
                }
            })

            this.salesRecord = salesRecord
        }
    }

    onKeyDownInput = (evt) => {
        if(evt.key === 'Enter') {
            this.saveSalesRecord()
        }
    }
    renderRowType(field, type, value, selectOptions) {
        switch (type) {
            case 'checkbox':
                return (
                    <input type="checkbox" checked={value}
                           onChange={e => this.changeState(field, e.target.checked)}
                           onBlur={this.saveSalesRecord}/>

            )
            case 'date':
                return (
                    <DatePicker
                        selected={value ? moment(value) : null}
                        onChange={((date) => this.changeState(field, date.toDate()))}
                        onBlur={this.saveSalesRecord}
                    />
                )
            case 'select':
                return (
                    <Select
                        value={value}
                        onChange={({value}) => this.changeState(field, value, true)}
                        onBlur={this.saveSalesRecord}
                        options={selectOptions}
                        optionRenderer={Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN]) ? (option) => <div style={{display: 'flex'}}><span style={{flex: 1}}>{option.label}</span>{option.editable &&
                        <span onMouseDown={(evt) => {
                            evt.stopPropagation()
                            evt.preventDefault()
                            this.onRemoveOption(field, option.value)
                        }}>×</span>}</div> : null}
                        className={'select-role'}
                        clearable={false}
                    />
                )
            case 'textarea':
                return (
                    <textarea
                        rows='2'
                        value={value}
                        style={{width: '100%'}}
                        onChange={(event) => this.changeState(field, event.target.value)}
                        onBlur={this.saveSalesRecord}
                    />
                )
            case 'number':
            case 'currency':
                return (
                    <input
                        type={'number'}
                        value={value}
                        style={{width: '100%'}}
                        onChange={(event) => this.changeState(field, parseFloat(event.target.value))}
                        onBlur={this.saveSalesRecord}
                        onKeyDown={this.onKeyDownInput}
                    />
                )
            case 'daterange':
                return (
                    <div>
                        <DatePicker
                            className='form-control'
                            selected={value && value.length > 0 && moment(value[0])}
                            selectsStart
                            startDate={value && value.length > 0 && moment(value[0])}
                            endDate={value && value.length > 0 && moment(value[1])}
                            onChange={(date) => this.changeStateElem(field, date ? date.toDate() : null, 0)}
                            onBlur={this.saveSalesRecord}/>
                        &nbsp;
                        to
                        &nbsp;
                        <DatePicker
                            className='form-control'
                            selected={value && value.length > 0 && moment(value[1])}
                            selectsStart
                            startDate={value && value.length > 0 && moment(value[0])}
                            endDate={value && value.length > 0 && moment(value[1])}
                            onChange={(date) => this.changeStateElem(field, date ? date.toDate() : null, 1)}
                            onBlur={this.saveSalesRecord}/>
                    </div>
                )
            default:
                return (
                    <input
                        type={type}
                        value={value}
                        style={{width: '100%'}}
                        onChange={(event) => this.changeState(field, event.target.value)}
                        onBlur={this.saveSalesRecord}
                        onKeyDown={this.onKeyDownInput}
                    />
                )
        }
    }

    renderTableRows(rows, data, name) {
        return _.map(rows, ({type, field, label}) => {
            const value = data[field]
            let displayValue = value
            let selectOptions
            if (type === 'select') {
                if (field === 'shippingMode') {
                    selectOptions = SHIPPING_MODE_LIST.map((value) => ({label: value, value}))
                } else if (field === 'teamLead') {
                    const members = this.props.salesRecord.getMembers()
                    selectOptions = members.map(m => ({label: m.name(), value: m._id}))
                    displayValue = value && _.findWhere(members, {_id: value}).name()
                } else if (field === 'priority') {
                    selectOptions = Object.values(DEAL_PRIORITY).map(value => ({label: value, value}))
                } else if (field === 'probability') {
                    selectOptions = Object.values(DEAL_PROBABILITY).map(value => ({label: value, value}))
                } else if (field === 'clientStatus') {
                    const statuses = ClientStatus.find().fetch()
                    selectOptions = statuses.map(s => ({label: s.name, value: s._id, editable: s.editable}))
                    const status = _.findWhere(statuses, {_id: value})
                    displayValue = status && status.name
                } else if (field === 'supplierStatus') {
                    const statuses = SupplierStatus.find().fetch()
                    selectOptions = statuses.map(s => ({label: s.name, value: s._id, editable: s.editable}))
                    const status = _.findWhere(statuses, {_id: value})
                    displayValue = status && status.name
                } else if (field === 'dealState') {
                    selectOptions = Object.values(STATES).map(state => ({label:`${state.countryCode}/${state.state}`, value:state.stateCode}))
                    const state = _.findWhere(STATES, {stateCode:value})
                    displayValue = state ? `${state.countryCode}/${state.state}` : ''
                } else if (field === 'supplier') {
                    const companyType = CompanyTypes.findOne({name:'Window Producer'})
                    const companyFilters = {}
                    if(companyType) companyFilters.type_ids = companyType._id
                    const componies = Companies.find(companyFilters).fetch()
                    selectOptions = componies.map((c) => ({value: c._id, label: c.name}))
                    const company = _.findWhere(componies, {_id: value})
                    displayValue = company && company.name
                } else if (field === 'shipper') {
                    const companyType = CompanyTypes.findOne({name:'Freight Forwarder'})
                    const companyFilters = {}
                    if(companyType) companyFilters.type_ids = companyType._id
                    const componies = Companies.find(companyFilters).fetch()
                    selectOptions = componies.map((c) => ({value: c._id, label: c.name}))
                    const company = _.findWhere(componies, {_id: value})
                    displayValue = company && company.name
                }
            }

            if(field === 'slackChannel') displayValue = value.name

            if(name !== 'others') {
                return (
                    <tr key={field}>
                        <td>{label}</td>
                        <td style={{display: 'flex'}}>
                            <div
                                style={{flex: 1}}>{this.renderRowType(field, type, value, type === 'select' && selectOptions)}</div>
                            <div>
                                {field === 'clientStatus' && Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN]) &&
                                <button className="btn btn-default" onClick={this.handleAddClientStatus}>+</button>}
                                {field === 'supplierStatus' && Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN]) &&
                                <button className="btn btn-default" onClick={this.handleAddSupplierStatus}>+</button>}
                            </div>
                        </td>
                    </tr>
                )
            }
            if (_.isNull(value) || _.isUndefined(value)) return null
            if (type === 'date') displayValue = moment(value).format('MM/DD/YYYY')
            if (type === 'daterange') displayValue = `from ${moment(_.first(value)).format('MM/DD/YYYY')} to ${moment(_.last(value)).format('MM/DD/YYYY')}`
            if (type === 'currency') displayValue = `$ ${parseFloat(value).toLocaleString('en-US', {
                minimunFractionDigits: 2,
                maximumFractionDigits: 2
            })}`
            return (
                <tr key={field}>
                    <td>{label}</td>
                    <td>{displayValue}</td>
                </tr>
            )
        })
    }

    renderClientStatusModal() {
        const {showClientStatusModal} = this.state

        return (
            <Modal show={showClientStatusModal} bsSize="small" onHide={() => {
                this.setState({showClientStatusModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title>Add new client status</Modal.Title></Modal.Header>
                <Modal.Body>
                    <ClientStatusForm onSaved={this.onSavedClientStatus}/>
                </Modal.Body>
            </Modal>
        )
    }

    renderSupplierStatusModal() {
        const {showSupplierStatusModal} = this.state

        return (
            <Modal show={showSupplierStatusModal} bsSize="small" onHide={() => {
                this.setState({showSupplierStatusModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title>Add new supplier status</Modal.Title></Modal.Header>
                <Modal.Body>
                    <SupplierStatusForm onSaved={this.onSavedSupplierStatus}/>
                </Modal.Body>
            </Modal>
        )
    }

    render() {
        const {salesRecord} = this.state
        const statusRows = [
            {label: 'Active/Archived', field: 'archived', type: 'checkbox'},
            {label: 'Deal State', field: 'dealState', type: 'select'},
            {label: 'Team Lead', field: 'teamLead', type: 'select'},
            {label: 'Bid Due Date', field: 'bidDueDate', type: 'date'},
            {label: 'Priority', field: 'priority', type: 'select'},
            {label: 'Expected Revenue', field: 'expectedRevenue', type: 'currency'},
            {label: 'Total Square Footage', field: 'totalSquareFootage', type: 'currency'},
            {label: 'Probability', field: 'probability', type: 'select'},
            {label: 'Client Status', field: 'clientStatus', type: 'select'},
            {label: 'Supplier Status', field: 'supplierStatus', type: 'select'},
        ]
        const attrRows = [
            {label: 'Shipping mode', field: 'shippingMode', type: 'select'},
            {label: 'Act. Production Start Date', field: 'productionStartDate', type: 'date'},
            {label: 'Supplier', field: 'supplier', type: 'select'},
            {label: 'Forwarder', field: 'shipper', type: 'select'},
            {label: 'Est. Production time', field: 'estProductionTime', type: 'number'},
            {label: 'Est. Lead time', field: 'estLeadTime', type: 'number'},
            {label: 'Est. Production completion', field: 'estProductionCompletion', type: 'date'},
            {label: 'Est. Delivery Window', field: 'estDeliveryRange', type: 'daterange'},
            {label: 'Act. Client Payment Received', field: 'actClientPaymentReceived', type: 'date'},
            {label: 'Act. Production Completion', field: 'actProductionCompletion', type: 'date'},
            {label: 'Act. Shipping Date', field: 'actShippingDate', type: 'date'},
            {label: 'Act. Delivery Date', field: 'actualDeliveryDate', type: 'date'},
        ]
        const shippingRows = [
            {label: 'Contact name', field: 'shippingContactName', type: 'text'},
            {label: 'Contact email', field: 'shippingContactEmail', type: 'email'},
            {label: 'Contact phone', field: 'shippingContactPhone', type: 'text'},
            {label: 'Address', field: 'shippingAddress', type: 'text'},
            {label: 'Notes', field: 'shippingNotes', type: 'textarea'},
        ]
        const billingRows = [
            {label: 'Contact name', field: 'billingContactName', type: 'text'},
            {label: 'Contact email', field: 'billingContactEmail', type: 'email'},
            {label: 'Contact phone', field: 'billingContactPhone', type: 'text'},
            {label: 'Address', field: 'billingAddress', type: 'text'},
            {label: 'Notes', field: 'billingNotes', type: 'textarea'},
        ]
        const otherRows = [
            {label: 'ID', field: '_id', type: 'text'},
            {label: 'Created At', field: 'createdAt', type: 'date'},
            {label: 'Modified At', field: 'modifiedAt', type: 'date'},
            {label: 'Slack Chanel', field: 'slackChannel', type: 'text'},
            {label: 'Folder Id', field: 'folderId', type: 'text'},
        ]

        return (
            <div className="details-inbox-tab">
                {this.renderClientStatusModal()}
                {this.renderSupplierStatusModal()}
                <div className="row">
                    <div className="col-md-6">
                        <div className="panel panel-default">
                            <div className='panel-heading'>
                                Deal Status
                            </div>
                            <div className='panel-body'>
                                <table className="table table-condensed">
                                    <tbody>
                                    {this.renderTableRows(statusRows, salesRecord, 'status')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="col-md-6">
                        <div className="panel panel-default">
                            <div className='panel-heading'>
                                Production/Delivery Info
                            </div>
                            <div className='panel-body'>
                                <table className="table table-condensed">
                                    <tbody>
                                    {this.renderTableRows(attrRows, salesRecord, 'attributes')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6">
                        <div className='panel panel-default'>
                            <div className='panel-heading'>
                                Shipping
                            </div>
                            <div className='panel-body'>
                                <table className="table table-condensed">
                                    <tbody>
                                    {this.renderTableRows(shippingRows, salesRecord, 'shipping')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className='panel panel-default'>
                            <div className='panel-heading'>
                                Billing
                            </div>
                            <div className='panel-body'>
                                <table className="table table-condensed">
                                    <tbody>
                                    {this.renderTableRows(billingRows, salesRecord, 'billing')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                <div className='panel panel-default'>
                    <div className='panel-heading'>
                        Others
                    </div>
                    <div className='panel-body'>
                        <table className="table table-condensed">
                            <tbody>
                            {this.renderTableRows(otherRows, salesRecord, 'others')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}

export default Details

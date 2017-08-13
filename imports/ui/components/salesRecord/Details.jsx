/* global moment*/
import {Roles} from 'meteor/alanning:roles'
import React from 'react'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {Modal} from 'react-bootstrap'
import { info, warning  } from '/imports/api/lib/alerts'
import { SHIPPING_MODE_LIST } from '/imports/api/constants/project'
import DatePicker from 'react-datepicker'
import Select from 'react-select'
import {DEAL_PRIORITY, DEAL_PROBABILITY} from '/imports/api/models/salesRecords/salesRecords'
import {ClientStatus, SupplierStatus, ROLES} from '/imports/api/models'
import ClientStatusForm from './components/ClientStatusForm'
import SupplierStatusForm from './components/SupplierStatusForm'
import {removeClientStatus, removeSupplierStatus} from '/imports/api/models/salesRecords/verified-methods'

class Details extends TrackerReact(React.Component) {
    constructor(props) {
        super(props)
        this.state = {
            isEditingStatus: false,
            isEditingAttributes: false,
            isEditingShipping: false,
            isEditingBilling: false,
            salesRecord: props.salesRecord,
        }
        this.toggleEditAttributes = this.toggleEditAttributes.bind(this)
        this.toggleEditShipping = this.toggleEditShipping.bind(this)
        this.toggleEditBilling = this.toggleEditBilling.bind(this)
        this.changeState = this.changeState.bind(this)
        this.changeStateElem = this.changeStateElem.bind(this)
        this.saveAttributes = this.saveAttributes.bind(this)
        this.saveBilling = this.saveBilling.bind(this)
        this.saveShipping = this.saveShipping.bind(this)
    }

    changeStateElem(field, value, index) {
        this.state.salesRecord[field][index] = value
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
            if(error) return warning(`Problems with updating project. ${error.error}`)
            this.toggleEditBilling()
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
            if(error) return warning(`Problems with updating project. ${error.error}`)
            this.toggleEditShipping()
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
        Meteor.call('updateSalesRecordStatus', salesRecordId, status, (error, result) => {
            if(error) return warning(`Problems with updating project. ${error.error}`)
            this.toggleEditStatus()
            return info('Success update project')
        })
    }

    saveAttributes() {
        const salesRecordId = this.state.salesRecord._id
        const attributes = _.pick(
            this.state.salesRecord,
            'shippingMode',
            'actualDeliveryDate',
            'productionStartDate',
            'supplier',
            'shipper',
            'estProductionTime',
            'actProductionTime',
            'estDeliveryRange',
        )
        Meteor.call('updateProjectAttributes', salesRecordId, attributes, (error, result) => {
            if(error) return warning(`Problems with updating project. ${error.error}`)
            this.toggleEditAttributes()
            return info('Success update project')
        })
    }

    toggleEditStatus = () => {
        this.setState(({ isEditingStatus }) => ({
            isEditingStatus: !isEditingStatus
        }))
    }

    toggleEditAttributes() {
        this.setState(({ isEditingAttributes }) => ({
            isEditingAttributes: !isEditingAttributes
        }))
    }

    toggleEditShipping() {
        this.setState(({ isEditingShipping}) => ({
            isEditingShipping: !isEditingShipping
        }))
    }

    toggleEditBilling() {
        this.setState(({ isEditingBilling }) => ({
            isEditingBilling: !isEditingBilling
        }))
    }

    handleAddClientStatus = () => {
        this.setState({showClientStatusModal:true})
    }

    handleAddSupplierStatus = () => {
        this.setState({showSupplierStatusModal:true})

    }

    onSavedClientStatus = () => {
        this.setState({showClientStatusModal: false})
    }

    onSavedSupplierStatus = () => {
        this.setState({showSupplierStatusModal: false})
    }

    onRemoveOption = (field, _id) => {
        try {
            if(field === 'clientStatus') {
                removeClientStatus.call({_id})
            } else if(field === 'supplierStatus') {
                removeSupplierStatus.call({_id})
            }
        } catch(e) {
            console.error(e)
        }
    }

    renderEditAttributesButton(edittingStatus, toggle, saveCallback) {
        if (edittingStatus) return (
            <button
                className='btn btn-default btn-sm pull-right'
                onClick={saveCallback}>
                <i className='fa fa-floppy-o'/> Save
            </button>
        )
        return (
            <button className='btn btn-default btn-sm btn-primary pull-right' onClick={toggle}>
                <i className='fa fa-pencil'/> Edit
            </button>
        )
    }

    renderRowType(field, type, value, selectOptions) {
        switch(type) {
            case 'date':
                return (
                    <DatePicker
                        selected={moment(value)}
                        onChange={((date) => this.changeState(field, date.toDate()))}
                    />
                )
            case 'select':
                return (
                    <Select
                       value={value}
                       onChange={({ value }) => this.changeState(field, value)}
                       options={selectOptions}
                       optionRenderer={Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN]) ? (option) => <div style={{display:'flex'}}><span style={{flex:1}}>{option.label}</span>{option.editable&&<span onMouseDown={(evt) => {evt.stopPropagation(); evt.preventDefault(); this.onRemoveOption(field, option.value)}}>×</span>}</div> : null}
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
                    />
                )
            case 'daterange':
                return (
                    <div>
                        <DatePicker
                            className='form-control'
                            selected={moment(value[0])}
                            selectsStart
                            startDate={moment(value[0])}
                            endDate={moment(value[1])}
                            onChange={(date) => this.changeStateElem(field, date.toDate(), 0)} />
                        &nbsp;
                        to
                        &nbsp;
                        <DatePicker
                            className='form-control'
                            selected={moment(value[1])}
                            selectsStart
                            startDate={moment(value[0])}
                            endDate={moment(value[1])}
                            onChange={(date) => this.changeStateElem(field, date.toDate(), 1)} />
                    </div>
                )
            default:
                return (
                    <input
                        type={type}
                        value={value}
                        style={{width: '100%'}}
                        onChange={(event) => this.changeState(field, event.target.value)}
                    />
                )
        }
    }

    renderTableRows(rows, data, name){
         return _.map(rows, ({ type, field, label }) => {
            let value = data[field]
            let displayValue = value
            let selectOptions
            if(type === 'select') {
                if(field === 'shippingMode') {
                    selectOptions = SHIPPING_MODE_LIST.map((value) => ({label: value, value}))
                } else if(field === 'teamLead') {
                    const members = this.props.salesRecord.getMembers()
                    selectOptions = members.map(m => ({label: m.name(), value:m._id}))
                    displayValue = value && _.findWhere(members, {_id:value}).name()
                } else if(field === 'priority') {
                    selectOptions = Object.values(DEAL_PRIORITY).map(value => ({label: value, value}))
                } else if(field === 'probability') {
                    selectOptions = Object.values(DEAL_PROBABILITY).map(value => ({label: value, value}))
                } else if(field === 'clientStatus') {
                    const statuses = ClientStatus.find().fetch()
                    selectOptions = statuses.map(s => ({label:s.name, value:s._id, editable:s.editable}))
                    const status = _.findWhere(statuses, {_id:value})
                    displayValue = status && status.name
                } else if(field === 'supplierStatus') {
                    const statuses = SupplierStatus.find().fetch()
                    selectOptions = statuses.map(s => ({label:s.name, value:s._id, editable:s.editable}))
                    const status = _.findWhere(statuses, {_id:value})
                    displayValue = status && status.name
                }
            }

            if ((this.state.isEditingStatus && name == 'status')
                || (this.state.isEditingAttributes && name == 'attributes')
                || (this.state.isEditingShipping && name == 'shipping')
                || (this.state.isEditingBilling && name == 'billing')
            ) {
                return (
                    <tr key={field}>
                        <td>{label}</td>
                        <td style={{display:'flex'}}>
                            <div style={{flex:1}}>{this.renderRowType(field, type, value, type==='select'&&selectOptions)}</div>
                            <div>
                            {field==='clientStatus'&&Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN])&&<button className="btn btn-default" onClick={this.handleAddClientStatus}>+</button>}
                            {field==='supplierStatus'&&Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN])&&<button className="btn btn-default" onClick={this.handleAddSupplierStatus}>+</button>}
                            </div>
                        </td>
                    </tr>
                )
            }
            if (_.isNull(value) || _.isUndefined(value)) return null
            if (type === 'date') displayValue = moment(value).format('MM/DD/YYYY')
            if (type === 'daterange') displayValue = `from ${moment(_.first(value)).format('MM/DD/YYYY')} to ${moment(_.last(value)).format('MM/DD/YYYY')}`
            if (type === 'currency') displayValue = `$ ${parseFloat(value).toLocaleString('en-US', {minimunFractionDigits:2, maximumFractionDigits:2})}`
            return (
                <tr key={field}>
                    <td>{label}</td>
                    <td>{displayValue}</td>
                </tr>
            )
             return null
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
                this.setState({showClientStatusModal: false})
            }}>
                <Modal.Header closeButton><Modal.Title>Add new supplier status</Modal.Title></Modal.Header>
                <Modal.Body>
                    <SupplierStatusForm onSaved={this.onSavedSupplierStatus}/>
                </Modal.Body>
            </Modal>
        )
    }
    render() {
        const { salesRecord } = this.state
        const statusRows = [
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
            {label: 'Actual delivery date', field: 'actualDeliveryDate', type: 'date'},
            {label: 'Production start date', field: 'productionStartDate', type: 'date'},
            {label: 'Supplier', field: 'supplier', type: 'text'},
            {label: 'Shipper', field: 'shipper', type: 'text'},
            {label: 'EST Production Time', field: 'estProductionTime', type: 'number'},
            {label: 'ACT Production Time', field: 'actProductionTime', type: 'number'},
            {label: 'EST Delivery Range', field: 'estDeliveryRange', type: 'daterange'},
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
            { label: 'ID', field: '_id', type: 'text' },
            { label: 'Created At', field: 'createdAt', type: 'date' },
            { label: 'Modified At', field: 'modifiedAt', type: 'date' },
            { label: 'Slack Chanel', field: 'slackChanel', type: 'text' },
            { label: 'Folder Id', field: 'folderId', type: 'text' },
        ]

        return (
            <div className="details-inbox-tab">
                {this.renderClientStatusModal()}
                {this.renderSupplierStatusModal()}
                <div className='panel panel-default'>
                    <div className='panel-heading'>
                        Deal Status
                        { this.renderEditAttributesButton(this.state.isEditingStatus, this.toggleEditStatus, this.saveStatus) }
                    </div>
                    <div className='panel-body'>
                        <table className="table table-condensed">
                            <tbody>
                            {this.renderTableRows(statusRows, salesRecord, 'status')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className='panel panel-default'>
                    <div className='panel-heading'>
                        Project Attributes
                        { this.renderEditAttributesButton(this.state.isEditingAttributes, this.toggleEditAttributes, this.saveAttributes) }
                    </div>
                    <div className='panel-body'>
                        <table className="table table-condensed">
                            <tbody>
                            {this.renderTableRows(attrRows, salesRecord, 'attributes')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className='panel panel-default'>
                    <div className='panel-heading'>
                        Shipping
                        { this.renderEditAttributesButton(this.state.isEditingShipping, this.toggleEditShipping, this.saveShipping) }
                    </div>
                    <div className='panel-body'>
                        <table className="table table-condensed">
                            <tbody>
                            {this.renderTableRows(shippingRows, salesRecord, 'shipping')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className='panel panel-default'>
                    <div className='panel-heading'>
                        Billing
                        { this.renderEditAttributesButton(this.state.isEditingBilling, this.toggleEditBilling, this.saveBilling) }
                    </div>
                    <div className='panel-body'>
                        <table className="table table-condensed">
                           <tbody>
                           {this.renderTableRows(billingRows, salesRecord , 'billing')}
                           </tbody>
                        </table>
                    </div>
                </div>
                <div className='panel panel-default'>
                    <div className='panel-heading'>
                        Others
                    </div>
                    <div className='panel-body'>
                        <table className="table table-condensed">
                            <tbody>
                            {this.renderTableRows(otherRows, salesRecord, 'shipping')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        )
    }
}

export default Details

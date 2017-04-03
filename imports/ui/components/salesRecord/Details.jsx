import React from 'react';
import { info, warning  } from '/imports/api/lib/alerts';
import { SHIPPING_MODE_LIST } from '/imports/api/constants/project';
import DatePicker from 'react-datepicker';
import Select from 'react-select';

class Details extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            isEditingAttributes: false,
            isEditingShipping: false,
            isEditingBilling: false,
            salesRecord: props.salesRecord,
        }
        this.toggleEditAttributes = this.toggleEditAttributes.bind(this);
        this.toggleEditShipping = this.toggleEditShipping.bind(this);
        this.toggleEditBilling = this.toggleEditBilling.bind(this);
        this.changeState = this.changeState.bind(this);
        this.saveAttributes = this.saveAttributes.bind(this);
        this.saveBilling = this.saveBilling.bind(this);
        this.saveShipping = this.saveShipping.bind(this);
    }

    changeState(field, value) {
        this.state.salesRecord[field] = value;
        this.setState({
            salesRecord: this.state.salesRecord,
        });
    }

    saveBilling() {
        const salesRecordId = this.state.salesRecord._id;
        const billing = _.pick(
            this.state.salesRecord,
            'billingContactName',
            'billingContactEmail',
            'billingContactPhone',
            'billingAddress',
            'billingNotes',
        );
        Meteor.call('updateProjectBilling', salesRecordId, billing, (error, result)=> {
            if(error) return warning(`Problems with updating project. ${error.error}`);
            this.toggleEditBilling();
            return info(`Success update project`);
        });
    }

    saveShipping() {
        const salesRecordId = this.state.salesRecord._id;
        const shipping = _.pick(
            this.state.salesRecord,
            'shippingContactName',
            'shippingContactName',
            'shippingContactPhone',
            'shippingAddress',
            'shippingNotes',
        );
        Meteor.call('updateProjectShipping', salesRecordId, shipping, (error, result)=> {
            if(error) return warning(`Problems with updating project. ${error.error}`);
            this.toggleEditShipping();
            return info(`Success update project`);
        });
    }

    saveAttributes() {
        const salesRecordId = this.state.salesRecord._id;
        const attributes = _.pick(
            this.state.salesRecord,
            'shippingMode',
            'actualDeliveryDate',
            'productionStartDate',
            'supplier',
            'shipper',
        );
        Meteor.call('updateProjectAttributes', salesRecordId, attributes, (error, result)=> {
            if(error) return warning(`Problems with updating project. ${error.error}`);
            this.toggleEditAttributes();
            return info(`Success update project`);
        });
    }

    toggleEditAttributes() {
        this.setState(({ isEditingAttributes })=> ({
            isEditingAttributes: !isEditingAttributes
        }));
    }

    toggleEditShipping() {
        this.setState(({ isEditingShipping})=> ({
            isEditingShipping: !isEditingShipping
        }));
    }

    toggleEditBilling() {
        this.setState(({ isEditingBilling })=> ({
            isEditingBilling: !isEditingBilling
        }));
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
        );
    }

    renderTableRows(rows, data, name){
         return _.map(rows, ({ type, field, label })=>{
            let value = data[field];
            const shippingModes = SHIPPING_MODE_LIST.map((value)=> ({label: value, value}));
            if ((this.state.isEditingAttributes && name == 'attributes')
                || (this.state.isEditingShipping && name == 'shipping')
                || (this.state.isEditingBilling && name == 'billing')
            ) {
                return (
                    <tr key={field}>
                        <td>{label}</td>
                        <td>
                            {
                                (type === 'date') ? (
                                    <DatePicker
                                        selected={moment(value)}
                                        onChange={((date)=> this.changeState(field, date.toDate()))}
                                    />
                                ) : (
                                    ( type === 'select' ) ? (
                                         <Select
                                            value={value}
                                            onChange={({ value })=> this.changeState(field, value)}
                                            options={shippingModes}
                                            className={"select-role"}
                                            clearable={false}
                                         />
                                    ) :  (
                                        ( type === 'textarea' ) ? (
                                            <textarea
                                                rows='2'
                                                value={value}
                                                style={{width: '100%'}}
                                                onChange={(event)=> this.changeState(field, event.target.value)}
                                            />

                                        ) : (
                                            <input
                                                type={type}
                                                value={value}
                                                style={{width: '100%'}}
                                                onChange={(event)=> this.changeState(field, event.target.value)}
                                            />
                                        )
                                    )
                                )
                            }
                        </td>
                    </tr>
                );
            }
            if (!value) return null;
            if (type === 'date') value = moment(value).format('MM DD YYYY');
            return (
                <tr key={field}>
                    <td>{label}</td>
                    <td>{value}</td>
                </tr>
            );
             return null;
        })
    }

    render() {
        const { salesRecord } = this.state;
        const attrRows = [
            {label: "Shipping mode", field: "shippingMode", type: 'select'},
            {label: "Actual delivery date", field: "actualDeliveryDate", type: 'date'},
            {label: "Production start date", field: "productionStartDate", type: 'date'},
            {label: "Supplier", field: "supplier", type: 'text'},
            {label: "Shipper", field: "shipper", type: 'text'},
        ];
        const shippingRows = [
            {label: "Contact name", field: "shippingContactName", type: 'text'},
            {label: "Contact email", field: "shippingContactEmail", type: 'email'},
            {label: "Contact phone", field: "shippingContactPhone", type: 'text'},
            {label: "Address", field: "shippingAddress", type: 'text'},
            {label: "Notes", field: "shippingNotes", type: 'textarea'},
        ];
        const billingRows = [
            {label: "Contact name", field: "billingContactName", type: 'text'},
            {label: "Contact email", field: "billingContactEmail", type: 'email'},
            {label: "Contact phone", field: "billingContactPhone", type: 'text'},
            {label: "Address", field: "billingAddress", type: 'text'},
            {label: "Notes", field: "billingNotes", type: 'textarea'},
        ];

        return (
            <div className="details-inbox-tab">
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
            </div>
        )
    }
}

export default Details;

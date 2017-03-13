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
            project: props.project,
        }
        this.toggleEditAttributes = this.toggleEditAttributes.bind(this);
        this.changeState = this.changeState.bind(this);
        this.saveAttributes = this.saveAttributes.bind(this);
    }

    changeState(field, value) {
        this.state.project[field] = value;
        this.setState({
            project: this.state.project,
        });
    }

    saveAttributes() {
        const projectId = this.state.project._id;
        const attributes = _.pick(
            this.state.project,
            'shippingMode',
            'actualDeliveryDate',
            'productionStartDate',
            'supplier',
            'shipper',
        );
        Meteor.call('updateProjectAttributes', projectId, attributes, (error, result)=> {
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

    renderEditAttributesButton() {
        if (this.state.isEditingAttributes) return (
            <button
                className='btn btn-default btn-sm pull-right'
                onClick={this.saveAttributes}>
                <i className='fa fa-floppy-o'/> Save
            </button>
        )
        return (
            <button className='btn btn-default btn-sm btn-primary pull-right' onClick={this.toggleEditAttributes}>
                <i className='fa fa-pencil'/> Edit
            </button>
        );
    }

    renderTableRows(rows, data, name){
         return _.map(rows, ({ type, field, label })=>{
            let value = data[field];
            const shippingModes = SHIPPING_MODE_LIST.map((value)=> ({label: value, value}));
            switch(name) {
                case 'attributes':
                    if (this.state.isEditingAttributes) {
                        return (
                            <tr key={field}>
                                <td>{label}</td>
                                <td>
                                    {
                                        (type === 'Date') ? (
                                            <DatePicker
                                                selected={moment(value)}
                                                onChange={((date)=> this.changeState(field, date.toDate()))}
                                            />
                                        ) : (
                                            ( type === 'Select' ) ? (
                                                 <Select
                                                    value={value}
                                                    onChange={({ value })=> this.changeState(field, value)}
                                                    options={shippingModes}
                                                    className={"select-role"}
                                                    clearable={false}
                                                 />
                                            ) :  (
                                                <input
                                                    type='text'
                                                    value={value}
                                                    style={{width: '100%'}}
                                                    onChange={(event)=> this.changeState(field, event.target.value)}
                                                />
                                            )
                                        )
                                    }
                                </td>
                            </tr>
                        );
                    }
                default:
                    if (!value) return null;
                    if (type === 'Date') value = moment(value).format('MM DD YYYY');
                    return (
                        <tr key={field}>
                            <td>{label}</td>
                            <td>{value}</td>
                        </tr>
                    );
            }
             return null;
        })
    }

    render() {
        const { project } = this.state;
        const attrRows = [
            {label: "Shipping mode", field: "shippingMode", type: "Select"},
            {label: "Actual delivery date", field: "actualDeliveryDate", type: "Date"},
            {label: "Production start date", field: "productionStartDate", type: "Date"},
            {label: "Supplier", field: "supplier"},
            {label: "Shipper", field: "shipper"},
        ];
        const shippingRows = [
            {label: "Contact name", field: "shippingContactName"},
            {label: "Contact email", field: "shippingContactEmail"},
            {label: "Contact phone", field: "shippingContactPhone"},
            {label: "Address", field: "shippingAddress"},
            {label: "Notes", field: "shippingNotes"},
        ];
        const billingRows = [
            {label: "Contact name", field: "billingContactName"},
            {label: "Contact email", field: "billingContactEmail"},
            {label: "Contact phone", field: "billingContactPhone"},
            {label: "Address", field: "billingAddress"},
            {label: "Notes", field: "billingNotes"},
        ];

        return (
            <div className="details-inbox-tab">
                <h2>Project Attributes
                    { this.renderEditAttributesButton() }
                </h2>
                <table className="data-table">
                    <tbody>
                    {this.renderTableRows(attrRows, project, 'attributes')}
                    </tbody>
                </table>

                <h2>Shipping</h2>
                <table className="data-table">
                    <tbody>
                    {this.renderTableRows(shippingRows, project, 'shipping')}
                    </tbody>
                </table>

                <h2>Billing</h2>
                <table className="data-table">
                   <tbody>
                   {this.renderTableRows(billingRows, project, 'billing')}
                   </tbody>
                </table>
            </div>
        )
    }
}

export default Details;

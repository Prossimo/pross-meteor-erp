import React from 'react';
import { getUserName } from '/imports/api/lib/filters';
import Select from 'react-select';
import Textarea from 'react-textarea-autosize';
import { info, warning } from '/imports/api/lib/alerts';
import { DESIGNATION_LIST, STAKEHOLDER_CATEGORY, SHIPPING_MODE_LIST } from '/imports/api/constants/project';
import Switch from 'rc-switch';
import '../../../stylus/switch.styl';
import moment from 'moment';
import DatePicker from 'react-datepicker';


class CreateProject extends React.Component{
    constructor(props){
        super(props);
        this.designation = DESIGNATION_LIST.map(item=>({label: item, value: item}));
        this.stakeholder_category = STAKEHOLDER_CATEGORY.map(item=>({label: item, value: item}));
        this.shippingMode = SHIPPING_MODE_LIST.map(item=>({label: item, value: item}));
        this.defaultState = {
            projectName: '',
            selectCategory: [this.stakeholder_category[0]],
            selectUsers: [{
                label: getUserName(props.currentUser, true),
                value: props.currentUser._id
            }],
            memberOptions: props.users.map(item=>{return {label: getUserName(item, true), value: item._id}}),
            is_main_stakeholder: false,
            actualDeliveryDate: moment(),
            productionStartDate: moment(),
            startDate: moment().subtract(29, 'days'),
            endDate: moment(),
            shippingContactPhone: '',
            shippingContactName: '',
            shippingContactEmail: '',
            shippingAddress: '',
            billingContactPhone: '',
            billingContactName: '',
            billingContactEmail: '',
            billingAddress: '',
            selectedDesignation: this.designation[0],
            selectedShippingMode: this.shippingMode[0],
            shippingNotes: '',
            billingNotes: '',
            supplier: '',
            shipper: ''
        };

        this.state = this.defaultState;
        this.changeState = this.changeState.bind(this);
    }

    submitForm(event){
        event.preventDefault();
        const { projectName, is_main_stakeholder, selectUsers, shipper, supplier,
            selectedDesignation, selectedShippingMode, selectCategory,
            actualDeliveryDate, productionStartDate, startDate, endDate,
            shippingContactName, shippingContactPhone, shippingAddress,  shippingContactEmail,  shippingNotes,
            billingContactName, billingContactPhone, billingAddress, billingContactEmail,  billingNotes } = this.state;
        //todo @alex change format member property -> it must contain {is_main_stakeholder, stakeholder_category, memberName}
        //todo @alex some field of 'data' is a member properties

        const data = {
            name: projectName,
            sec_stakeholder_designation: selectedDesignation.value,
            shippingMode: selectedShippingMode.value,
            stakeholder_category: selectCategory.map(item=>item.value),
            members: selectUsers.map(item=>item.value),
            is_main_stakeholder: is_main_stakeholder,
            actualDeliveryDate: actualDeliveryDate.toDate(),
            productionStartDate: productionStartDate.toDate(),
            estDeliveryRange: [startDate.toDate(), endDate.toDate()],
            shippingAddress,
            shippingContactName,
            shippingContactEmail,
            shippingContactPhone,
            billingContactPhone,
            billingContactName,
            billingContactEmail,
            billingAddress,
            shippingNotes,
            billingNotes,
            supplier,
            shipper
        };
        console.log(data);
        Meteor.call("addProject", data, err=>{
            if(err) {
                warning(`Problems with creating new project`);
                return console.log(err)
            }

            this.setState(this.defaultState);
            info(`Success add new project & integration with Slack`);
        });
    }
    
    changeState(key) {
    	 return e => this.setState({[key]: e.target ? e.target.value : e});
    }

    render() {
        const { projectName, selectedDesignation, selectedShippingMode, selectCategory, selectUsers, supplier, shipper, memberOptions,
            actualDeliveryDate, productionStartDate, startDate, endDate,
            shippingContactName, shippingAddress, shippingContactEmail, shippingContactPhone, shippingNotes,
            billingContactName, billingAddress, billingContactEmail, billingContactPhone, billingNotes } = this.state;
        const { designation, stakeholder_category, shippingMode } = this;
        //todo @alex add dynamic form to add members
        return (
            <div className="create-project">
                <form onSubmit={this.submitForm.bind(this)}
                      className="default-form flex-form">
                    <div className="field-wrap">
                        <span className="label">Project name</span>
                        <input type="text"
                               onChange={this.changeState('projectName')}
                               value={projectName}/>
                    </div>
                    <div className="select-wrap">
                        <span className="label">Is Main Stakeholder</span>
                        <Switch onChange={this.changeState('is_main_stakeholder')}
        							checkedChildren={'Yes'}
        							unCheckedChildren={'No'}
      						/>
                    </div>
                    <div className="select-wrap">
                    		<span className="label">Secondary Stakeholder Designation</span>
                    		<Select
                        	 value={selectedDesignation}
                            onChange={this.changeState('selectedDesignation')}
                            options={designation}
                            className={"select-role"}
                            clearable={false}
                    		/>
                    </div>
                    <div className="select-wrap">
                        <span className="label">Stakeholder Category</span>
                        <Select
                            multi
                            value={selectCategory}
                            onChange={this.changeState('selectCategory')}
                            options={stakeholder_category}
                            className={"members-select"}
                            clearable={false}
                        />
                    </div>
                    <div className="select-wrap">
                        <span className="label">Add members</span>
                        <Select
                            multi
                            value={selectUsers}
                            onChange={this.changeState('selectUsers')}
                            options={memberOptions}
                            className={"members-select"}
                            clearable={false}
                        />
                    </div>
                    <div className="field-wrap">
                        <span className="label">Shipping Address</span>
                        <input type="text"
                               onChange={this.changeState('shippingAddress')}
                               value={shippingAddress}/>
                    </div>
                    <div className="field-wrap">
                        <span className="label">Shipping Contact Name</span>
                        <input type="text"
                               onChange={this.changeState('shippingContactName')}
                               value={shippingContactName}/>
                    </div>
                    <div className="field-wrap">
                        <span className="label">Shipping Contact Phone</span>
                        <input type="text"
                               onChange={this.changeState('shippingContactPhone')}
                               value={shippingContactPhone}/>
                    </div>
                    <div className="field-wrap">
                        <span className="label"> Shipping Contact Email</span>
                        <input type="email"
                               onChange={this.changeState('shippingContactEmail')}
                               value={shippingContactEmail}/>
                    </div>
                    <div className="field-wrap">
                        <span className="label">Shipping Notes</span>
                        <Textarea rows={3}
                          placeholder="Enter text"
                          className=""
                          value={shippingNotes}
                          onChange={this.changeState('shippingNotes')}/>
                    </div>
                    <div className="field-wrap">
                        <span className="label">Billing Contact Phone</span>
                        <input type="text"
                               onChange={this.changeState('billingContactPhone')}
                               value={billingContactPhone}/>
                    </div>
                    <div className="field-wrap">
                        <span className="label">Billing Contact Name</span>
                        <input type="text"
                               onChange={this.changeState('billingContactName')}
                               value={billingContactName}/>
                    </div>
                    <div className="field-wrap">
                        <span className="label">Billing Contact Email</span>
                        <input type="email"
                               onChange={this.changeState('billingContactEmail')}
                               value={billingContactEmail}/>
                    </div>
                    <div className="field-wrap">
                        <span className="label">Billing Address</span>
                        <input type="text"
                               onChange={this.changeState('billingAddress')}
                               value={billingAddress}/>
                    </div>
                    <div className="field-wrap">
                        <span className="label">Billing Notes</span>
                        <Textarea rows={3}
                          placeholder="Enter text"
                          className=""
                          value={billingNotes}
                          onChange={this.changeState('billingNotes')}/>
                    </div>
                    <div className="field-wrap">
                        <span className="label">Supplier</span>
                        <input type="text"
                               onChange={this.changeState('supplier')}
                               value={supplier}/>
                    </div>
                    <div className="select-wrap">
                        <span className="label">Secondary Stakeholder Designation</span>
                        <Select
                            value={selectedShippingMode}
                            onChange={this.changeState('selectedShippingMode')}
                            options={shippingMode}
                            className={"select-role"}
                            clearable={false}
                        />
                    </div>
                    <div className="select-wrap">
                        <span className="label">Est. Delivery Range</span>
                        <DatePicker
                            selected={startDate}
                            selectsStart  startDate={startDate}
                            endDate={endDate}
                            onChange={this.changeState('startDate')} />
                        <DatePicker
                            selected={endDate}
                            selectsEnd  startDate={startDate}
                            endDate={endDate}
                            onChange={this.changeState('endDate')} />
                    </div>
                    <div className="select-wrap">
                        <span className="label">Actual Delivery Date</span>
                        <DatePicker
        							selected={actualDeliveryDate}
        							onChange={this.changeState('actualDeliveryDate')} />
                    </div>
                    <div className="select-wrap">
                        <span className="label">Production Start Date</span>
                        <DatePicker
        							selected={productionStartDate}
        							onChange={this.changeState('productionStartDate')} />
                    </div>
                    <div className="field-wrap">
                        <span className="label">Shipper</span>
                        <input type="text"
                               onChange={this.changeState('shipper')}
                               value={shipper}/>
                    </div>
                    <div className="submit-wrap">
                        <button className="btn primary-btn">Add project</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default  CreateProject;
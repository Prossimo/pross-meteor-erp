import React from 'react';
import { getUserName } from '/imports/api/lib/filters';
import Select from 'react-select';
import Textarea from 'react-textarea-autosize';
import { info, warning } from '/imports/api/lib/alerts';
import { DESIGNATION_LIST, STAKEHOLDER_CATEGORY } from '/imports/api/constants/project';
import Switch from 'rc-switch';
import '../../../stylus/switch.styl';
import moment from 'moment';
import DatePicker from 'react-datepicker';


class CreateProject extends React.Component{
    constructor(props){
        super(props);
        this.designation = DESIGNATION_LIST.map(item=>({label: item, value: item}));
        this.stakeholder_category = STAKEHOLDER_CATEGORY.map(item=>({label: item, value: item}));
        this.state = {
            projectName: '',
            selectCategory: [this.stakeholder_category[0]],
            selectUsers: [{
                label: getUserName(props.currentUser, true),
                value: props.currentUser._id
            }],
            selectOptions: props.users.map(item=>{return {label: getUserName(item, true), value: item._id}}),
            is_main_stakeholder: false,
            actualDeliveryDate: moment(),
            productionStartDate: moment(),
            startDate: moment().subtract(29, 'days'),
            endDate: moment(),
            shippingContactPhone: '',
            billingContactPhone: '',
            selectedDesignation: this.designation[0],
            shippingNotes: '',
            billingNotes: ''
        }
        this.changeState = this.changeState.bind(this);
    }

    submitForm(event){
        event.preventDefault();
        const { projectName, selectedDesignation, selectCategory, selectUsers, is_main_stakeholder, actualDeliveryDate, productionStartDate, startDate, endDate, shippingContactPhone, billingContactPhone, shippingNotes, billingNotes } = this.state;

        const data = {
            name: projectName,
            sec_stakeholder_designation: selectedDesignation.value,
            stakeholder_category: selectCategory.map(item=>item.value),
            members: selectUsers.map(item=>item.value),
            is_main_stakeholder: is_main_stakeholder,
            actualDeliveryDate: actualDeliveryDate.toDate(),
            productionStartDate: productionStartDate.toDate(),
            estDeliveryRange: [startDate.toDate(), endDate.toDate()],
            shippingContactPhone: shippingContactPhone,
            billingContactPhone: billingContactPhone,
            shippingNotes: shippingNotes,
            billingNotes: billingNotes
        };
        console.log(data);
        Meteor.call("addProject", data, err=>{
            if(err) {
                warning(`Problems with creating new project`);
                return console.log(err)
            }

            this.setState({selectUsers: [], projectName: ''});
            info(`Success add new project & integration with Slack`);
        });
    }
    
    changeState(key) {
    	 return e => {
    		  let state = {};
    	     let value = e.target ? e.target.value : e;
    	     state[key] = value;
           this.setState(state);
       };
    }


    render() {
        const { projectName, selectedDesignation, selectCategory, selectUsers, selectOptions, actualDeliveryDate, productionStartDate, startDate, endDate, shippingContactPhone, billingContactPhone, shippingNotes, billingNotes } = this.state;
        const { designation, stakeholder_category } = this;

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
                            options={selectOptions}
                            className={"members-select"}
                            clearable={false}
                        />
                    </div>
                    <div className="field-wrap">
                        <span className="label">Shipping Contact Phone</span>
                        <input type="text"
                               onChange={this.changeState('shippingContactPhone')}
                               value={shippingContactPhone}/>
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
                        <span className="label">Billing Notes</span>
                        <Textarea rows={3}
                          placeholder="Enter text"
                          className=""
                          value={billingNotes}
                          onChange={this.changeState('billingNotes')}/>
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
                    <div className="submit-wrap">
                        <button className="btn primary-btn">Add project</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default  CreateProject;
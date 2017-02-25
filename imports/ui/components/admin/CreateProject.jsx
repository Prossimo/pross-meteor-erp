import React from 'react';
import { getUserName } from '/imports/api/lib/filters';
import Select from 'react-select';
import { info, warning } from '/imports/api/lib/alerts';
import Switch from 'rc-switch';
import '../../../stylus/switch.styl';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

class CreateProject extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            projectName: '',
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
            shippingContactPhone: ''
        }
        this.changeState = this.changeState.bind(this);
    }

    submitForm(event){
        event.preventDefault();
        const { projectName, selectUsers, is_main_stakeholder, actualDeliveryDate, productionStartDate, startDate, endDate, shippingContactPhone } = this.state;

        const data = {
            name: projectName,
            members: selectUsers.map(item=>item.value),
            is_main_stakeholder: is_main_stakeholder,
            actualDeliveryDate: actualDeliveryDate.toDate(),
            productionStartDate: productionStartDate.toDate(),
            estDeliveryRange: [startDate.toDate(), endDate.toDate()],
            shippingContactPhone: shippingContactPhone
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
        const { projectName, selectUsers, selectOptions, actualDeliveryDate, productionStartDate, startDate, endDate, shippingContactPhone } = this.state;

        return (
            <div className="create-project">
                <form onSubmit={this.submitForm.bind(this)}
                      className="default-form">
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
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
            endDate: moment()
        }
    }

    submitForm(event){
        event.preventDefault();
        const { projectName, selectUsers, is_main_stakeholder, actualDeliveryDate, productionStartDate, startDate, endDate } = this.state;

        const data = {
            name: projectName,
            members: selectUsers.map(item=>item.value),
            is_main_stakeholder: is_main_stakeholder,
            actualDeliveryDate: actualDeliveryDate.toDate(),
            productionStartDate: productionStartDate.toDate(),
            estDeliveryRange: [startDate.toDate(), endDate.toDate()]
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

    changeInput(event){
        this.setState({projectName: event.target.value})
    }

    changeSelectUser(value){
        this.setState({selectUsers: value})
    }
    
    onSwitchStakeholder(value) {
  		this.setState({is_main_stakeholder: value})
	 }
	 
    onChangeDeliveryDate(date) {
    	this.setState({actualDeliveryDate: date});
    }
    
    onChangeProductionDate(date) {
    	this.setState({productionStartDate: date});
    }
    
    handleChangeStart(date) {
        this.setState({startDate: date});
    }
    
    handleChangeEnd(date) {
        this.setState({endDate: date});
    }

    render() {
        const { projectName, selectUsers, selectOptions, actualDeliveryDate, productionStartDate, startDate, endDate } = this.state;

        return (
            <div className="create-project">
                <form onSubmit={this.submitForm.bind(this)}
                      className="default-form">
                    <div className="field-wrap">
                        <span className="label">Project name</span>
                        <input type="text"
                               onChange={this.changeInput.bind(this)}
                               value={projectName}/>
                    </div>
                    <div className="select-wrap">
                        <span className="label">Is Main Stakeholder</span>
                        <Switch onChange={this.onSwitchStakeholder.bind(this)}
        							checkedChildren={'Yes'}
        							unCheckedChildren={'No'}
      						/>
                    </div>
                    <div className="select-wrap">
                        <span className="label">Add members</span>
                        <Select
                            multi
                            value={selectUsers}
                            onChange={this.changeSelectUser.bind(this)}
                            options={selectOptions}
                            className={"members-select"}
                            clearable={false}
                        />
                    </div>
                    <div className="select-wrap">
                        <span className="label">Est. Delivery Range</span>
                        <DatePicker
									selected={startDate}
									selectsStart  startDate={startDate}
									endDate={endDate}
									onChange={this.handleChangeStart.bind(this)} />
								<DatePicker
									selected={endDate}
									selectsEnd  startDate={startDate}
									endDate={endDate}
									onChange={this.handleChangeEnd.bind(this)} />
                    </div>
                    <div className="select-wrap">
                        <span className="label">Actual Delivery Date</span>
                        <DatePicker
        					selected={actualDeliveryDate}
        					onChange={this.onChangeDeliveryDate.bind(this)} />
                    </div>
                    <div className="select-wrap">
                        <span className="label">Production Start Date</span>
                        <DatePicker
        					selected={productionStartDate}
        					onChange={this.onChangeProductionDate.bind(this)} />
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
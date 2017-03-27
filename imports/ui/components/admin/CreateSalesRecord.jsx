import React from 'react';
import { getUserName } from '/imports/api/lib/filters';
import Select from 'react-select';
import Textarea from 'react-textarea-autosize';
import { info, warning } from '/imports/api/lib/alerts';
import { DESIGNATION_LIST, STAKEHOLDER_CATEGORY, SHIPPING_MODE_LIST, STAGES } from '/imports/api/constants/project';
import Switch from 'rc-switch';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import NumericInput from 'react-numeric-input';

class ProjectMemberConfig extends React.Component{
    constructor(props){
        super(props);
        this.designationOptions = DESIGNATION_LIST.map(item=>({label: item, value: item}));
        this.categoryOptions = STAKEHOLDER_CATEGORY.map(item=>({label: item, value: item}));

        this.state = {
            selectedDesignation: this.designationOptions[0],
            selectedCategory: [this.categoryOptions[0]],
        }
    }

    componentDidMount(){
        const { changeParentState, member, isMainStakeholder } = this.props;
        changeParentState(member.value, 'destination', this.designationOptions[0].value);
        changeParentState(member.value, 'category', [this.categoryOptions[0].value]);
        changeParentState(member.value, 'isMainStakeholder', !!isMainStakeholder);
    }

    changeDesignation(selectedDesignation){
        const { changeParentState, member } = this.props;
        changeParentState(member.value, 'destination', selectedDesignation.value);

        this.setState({selectedDesignation});
    }

    changeCategory(selectedCategory){
        const { changeParentState, member } = this.props;
        changeParentState(member.value, 'category', selectedCategory.map(item=>item.value));

        this.setState({selectedCategory})
    }
    changeMainStakeholder(isMainStakeholder){
        const { changeParentState, member } = this.props;
        changeParentState(member.value, 'isMainStakeholder', isMainStakeholder);

        this.setState({isMainStakeholder});
    }

    render(){
        const { member, isMainStakeholder } = this.props;
        const { selectedDesignation, selectedCategory } = this.state;

        return(
            <tr>
                <td>{member.label}</td>
                <td>
                    <Switch onChange={this.changeMainStakeholder.bind(this)}
                            checkedChildren={'Yes'}
                            unCheckedChildren={'No'}
                            checked={isMainStakeholder}
                    />
                </td>
                <td>
                    <Select
                        value={selectedDesignation}
                        onChange={this.changeDesignation.bind(this)}
                        options={this.designationOptions}
                        className={"select-role"}
                        clearable={false}
                    />
                </td>
                <td>
                    <Select
                        multi
                        value={selectedCategory}
                        onChange={this.changeCategory.bind(this)}
                        options={this.categoryOptions}
                        className={"select-role"}
                        clearable={false}
                    />
                </td>
            </tr>
        )
    }
}

class CreateSalesRecord extends React.Component{
    constructor(props){
        super(props);
        this.shippingMode = SHIPPING_MODE_LIST.map(item=>({label: item, value: item}));
        this.stages = STAGES.map(item =>({ label: item.charAt(0).toUpperCase() + item.slice(1), value: item }));

        this.state = {
            projectName: '',
            selectUsers: [{
                label: getUserName(props.currentUser, true),
                value: props.currentUser._id,
                isMainStakeholder: true
            }],
            memberOptions: props.users.map(item=>{return {label: getUserName(item, true), value: item._id}}),
            actualDeliveryDate: moment(),
            productionStartDate: moment(),
            startDate: moment().subtract(29, 'days'),
            endDate: moment(),

            shippingContactPhone: '',
            shippingContactName: '',
            shippingContactEmail: '',
            shippingAddress: '',
            shippingNotes: '',

            billingContactPhone: '',
            billingContactName: '',
            billingContactEmail: '',
            billingAddress: '',
            billingNotes: '',

            selectedShippingMode: this.shippingMode[0],
            selectedStage: this.stages[0],
            supplier: '',
            shipper: '',
            estProductionTime: 0,
            actProductionTime: 0,
        };
        this.changeState = this.changeState.bind(this);
    }

    submitForm(event){
        event.preventDefault();
        const { projectName,  selectUsers, shipper, supplier,
            selectedShippingMode, actualDeliveryDate, productionStartDate, startDate, endDate, estProductionTime, actProductionTime,
            shippingContactName, shippingContactPhone, shippingAddress,  shippingContactEmail,  shippingNotes,
            billingContactName, billingContactPhone, billingAddress, billingContactEmail,  billingNotes , selectedStage } = this.state;

        const data = {
            name: projectName,
            members: selectUsers.map(member=>{
                return{
                    userId: member.value,
                    isMainStakeholder: member.isMainStakeholder,
                    destination: member.destination,
                    category: member.category
                }
            }),

            actualDeliveryDate: actualDeliveryDate.toDate(),
            productionStartDate: productionStartDate.toDate(),
            estDeliveryRange: [startDate.toDate(), endDate.toDate()],

            shippingContactName,
            shippingContactEmail,
            shippingAddress,
            shippingContactPhone,
            shippingNotes,

            billingContactName,
            billingContactEmail,
            billingAddress,
            billingContactPhone,
            billingNotes,

            shippingMode: selectedShippingMode.value,
            stage: this.props.stage ? this.props.stage : selectedStage.value,
            supplier,
            shipper,
            estProductionTime,
            actProductionTime
        };
        Meteor.call("addProject", data, (err, res)=>{
            if(err) return warning(`Problems with creating new project. ${err.error}`);

            info(`Success add new project & integration with Slack`);
            setTimeout(()=>{FlowRouter.go(FlowRouter.path("SalesRecord", {id: res}))},300)
        });
    }

    changeMembersState(memberId, state, value){
        let { selectUsers } = this.state;
        selectUsers.forEach((member)=>{
            if(member.value === memberId){
                member[state] = value;
            }else if(state === 'isMainStakeholder' && value){
                member['isMainStakeholder'] = false;
            }
        });
        if(selectUsers.every(item=>item.isMainStakeholder === false)) return;

        this.setState({selectUsers})
    }

    changeState(key) {
          return e => {
                if(e) {
                     this.setState({[key]: e.target ? e.target.value : e});
                }
          }
    }
    renderMembersConfig(){
        const { selectUsers } = this.state;
        if(!selectUsers.length) return null;

        const membersList = selectUsers.map(item=>{
            return <ProjectMemberConfig key={item.label}
                                        isMainStakeholder={item.isMainStakeholder}
                                        changeParentState={this.changeMembersState.bind(this)}
                                        member={item}
                                        users={this.props.usersArr}/>
        });

        return (
            <table className="data-table large">
                <thead className="project-members-table">
                <tr>
                    <td>Member</td>
                    <td>Is main Stakeholder</td>
                    <td>Secondary Stakeholder Designatioon</td>
                    <td>Stakeholder Catagory</td>
                </tr>
                </thead>
                <tbody>{membersList}</tbody>
            </table>
        )
    }

    render() {
        const { projectName, selectedShippingMode, selectUsers, supplier, shipper, memberOptions,
            actualDeliveryDate, productionStartDate, startDate, endDate, estProductionTime, actProductionTime,
            shippingContactName, shippingAddress, shippingContactEmail, shippingContactPhone, shippingNotes,
            billingContactName, billingAddress, billingContactEmail, billingContactPhone, billingNotes, selectedStage } = this.state;
        const { shippingMode, stages } = this;
        let submitBtnName = 'Add salesRecord';
        switch(this.props.stage) {
            case 'lead':
                submitBtnName = 'Add lead';
                break;
            case 'opportunity':
                submitBtnName = 'Add opportunity';
                break;
            case 'order':
                submitBtnName = 'Add order';
                break;
            case 'ticket':
                submitBtnName = 'Add ticket';
                break;
        }

        return (
            <div className="create-project">
                <form onSubmit={this.submitForm.bind(this)}
                      className="">
                    <div className="form-group">
                        <label>Project Name</label>
                        <input type="text"
                               className='form-control'
                               onChange={this.changeState('projectName')}
                               value={projectName}/>
                    </div>
                    <div className="form-group">
                        <label>Add Members</label>
                        <Select
                            multi
                            value={selectUsers}
                            onChange={this.changeState('selectUsers')}
                            options={memberOptions}
                            className={"members-select"}
                            clearable={false}
                        />
                    </div>
                    <div className="field-wrap full-width top-10 bottom-10">
                        {this.renderMembersConfig()}
                    </div>
                    <div className='panel panel-default'>
                        <div className='panel-heading'>
                            Shipping
                        </div>
                        <div className='panel-body'>
                            <div className="form-group">
                                <label>Contact name</label>
                                <input type="text"
                                    className='form-control'
                                    onChange={this.changeState('shippingContactName')}
                                    value={shippingContactName}/>
                            </div>
                            <div className="form-group">
                                <label>Address</label>
                                <input type="text"
                                    className='form-control'
                                    onChange={this.changeState('shippingAddress')}
                                    value={shippingAddress}/>
                            </div>
                            <div className="form-group">
                                <label>Contact email</label>
                                <input type="email"
                                    className='form-control'
                                    onChange={this.changeState('shippingContactEmail')}
                                    value={shippingContactEmail}/>
                            </div>
                            <div className="form-group">
                                <label>Contact phone</label>
                                <input type="text"
                                    className='form-control'
                                    onChange={this.changeState('shippingContactPhone')}
                                    value={shippingContactPhone}/>
                            </div>
                            <div className="form-group">
                                <label>Notes</label>
                                <Textarea rows={3}
                                    className='form-control'
                                    placeholder="Enter text"
                                    value={shippingNotes}
                                    onChange={this.changeState('shippingNotes')}/>
                            </div>
                        </div>
                    </div>
                    <div className='panel panel-default'>
                        <div className='panel-heading'>
                            Billing
                        </div>
                        <div className='panel-body'>
                            <div className='form-group'>
                                <label>Contact name</label>
                                <input type="text"
                                    className='form-control'
                                    onChange={this.changeState('billingContactName')}
                                    value={billingContactName}/>
                            </div>
                            <div className='form-group'>
                                <label>Address</label>
                                <input type="text"
                                    className='form-control'
                                    onChange={this.changeState('billingAddress')}
                                    value={billingAddress}/>
                            </div>
                            <div className='form-group'>
                                <label>Contact email</label>
                                <input type="email"
                                    className='form-control'
                                    onChange={this.changeState('billingContactEmail')}
                                    value={billingContactEmail}/>
                            </div>
                            <div className='form-group'>
                                <label>Contact phone</label>
                                <input type="text"
                                    className='form-control'
                                    onChange={this.changeState('billingContactPhone')}
                                    value={billingContactPhone}/>
                            </div>
                            <div className="field-wrap">
                                <label>Notes</label>
                                <Textarea rows={3}
                                    className='form-control'
                                    placeholder="Enter text"
                                    value={billingNotes}
                                    onChange={this.changeState('billingNotes')}/>
                            </div>
                        </div>
                    </div>

                    <div className='panel panel-default'>
                        <div className='panel-heading'>
                            Others
                        </div>
                        <div className='panel-body'>
                            <div className='form-group'>
                                <label>Supplier</label>
                                <input type="text"
                                    className='form-control'
                                    onChange={this.changeState('supplier')}
                                    value={supplier}/>
                            </div>
                            <div className='form-group'>
                                <label>Shipping Mode</label>
                                <Select
                                    value={selectedShippingMode}
                                    onChange={this.changeState('selectedShippingMode')}
                                    options={shippingMode}
                                    className={"select-role"}
                                    clearable={false}
                                />
                            </div>
                            <div className='form-group'>
                                <label>Est. Delivery Range </label>
                                &nbsp;
                                <DatePicker
                                    className='form-control'
                                    selected={startDate}
                                    selectsStart  startDate={startDate}
                                    endDate={endDate}
                                    onChange={this.changeState('startDate')} />
                                &nbsp;
                                to
                                &nbsp;
                                <DatePicker
                                    className='form-control'
                                    selected={endDate}
                                    selectsEnd  startDate={startDate}
                                    endDate={endDate}
                                    onChange={this.changeState('endDate')} />
                            </div>
                            <div className='form-group'>
                                <label>Actual Delivery Date</label>
                                <DatePicker
                                    className='form-control'
                                    selected={actualDeliveryDate}
                                    onChange={this.changeState('actualDeliveryDate')} />
                            </div>
                            <div className='form-group'>
                                <label>Production Start Date</label>
                                <DatePicker
                                    className='form-control'
                                    selected={productionStartDate}
                                    onChange={this.changeState('productionStartDate')} />
                            </div>
                            <div className='form-group'>
                                <label>Estimate Production Time (weeks)</label>
                                <NumericInput
                                    min={0}
                                    value={estProductionTime}
                                    className='form-control'
                                    onChange={this.changeState('estProductionTime')} />
                            </div>
                            <div className='form-group'>
                                <label>Actual Production Time (weeks)</label>
                                <NumericInput
                                    min={0}
                                    value={actProductionTime}
                                    className='form-control'
                                    onChange={this.changeState('actProductionTime')} />
                            </div>
                            <div className='form-group'>
                                <label>Shipper</label>
                                <input type="text"
                                    className='form-control'
                                    onChange={this.changeState('shipper')}
                                    value={shipper}/>
                            </div>
                            {
                                (!this.props.stage) ? (
                                    <div>
                                        <div className='form-group'>
                                            <label>Stage</label>
                                            <Select
                                                value={selectedStage}
                                                onChange={this.changeState('selectedStage')}
                                                options={stages}
                                                className={"select-role"}
                                                clearable={false}
                                            />
                                        </div>
                                    </div>
                                ) : ''
                            }
                        </div>
                    </div>
                    <div className='form-group text-center'>
                        <button className="btnn primary-btn">{ submitBtnName }</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default  CreateSalesRecord;

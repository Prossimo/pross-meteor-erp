import React from 'react';
import { getUserName } from '/imports/api/lib/filters';
import Select from 'react-select';
import Textarea from 'react-textarea-autosize';
import { info, warning } from '/imports/api/lib/alerts';
import { DESIGNATION_LIST, STAKEHOLDER_CATEGORY, SHIPPING_MODE_LIST, STAGES } from '/imports/api/constants/project';
import { EMPLOYEE_ROLE, ADMIN_ROLE } from '/imports/api/constants/roles';
import Switch from 'rc-switch';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import NumericInput from 'react-numeric-input';
import SelectMembers from './salesRecord/SelectMembers';
import SelectStakeholders from './salesRecord/SelectStakeholders';
import ContactStore from '../../../api/nylas/contact-store'

class CreateSalesRecord extends React.Component{
    static propTypes = {
        contacts: React.PropTypes.array,
        subject: React.PropTypes.string,
        stage: React.PropTypes.string,
        salesRecord: React.PropTypes.object,
        messages: React.PropTypes.array         // messages to be attached from email
    }

    constructor(props){
        super(props);
        this.shippingMode = SHIPPING_MODE_LIST.map(item=>({label: item, value: item}));
        this.stages = STAGES.map(item =>({ label: item.charAt(0).toUpperCase() + item.slice(1), value: item }));
        this.members = [];
        this.stakeholders = [];

        const {salesRecord, subject} = props
        this.state = {
            projectName: salesRecord ? salesRecord.name : subject||'',
            actualDeliveryDate: salesRecord ? moment(salesRecord.actualDeliveryDate) : moment(),
            productionStartDate: salesRecord ? moment(salesRecord.productionStartDate) :  moment(),
            startDate: salesRecord && salesRecord.estDeliveryRange && salesRecord.estDeliveryRange.length ? moment(salesRecord.estDeliveryRange[0]) :  moment().subtract(29, 'days'),
            endDate: salesRecord && salesRecord.estDeliveryRange && salesRecord.estDeliveryRange.length ? moment(salesRecord.estDeliveryRange[1]) :  moment(),

            shippingContactPhone: salesRecord ? salesRecord.shippingContactPhone : '',
            shippingContactName: salesRecord ? salesRecord.shippingContactName : '',
            shippingContactEmail: salesRecord ? salesRecord.shippingContactEmail : '',
            shippingAddress: salesRecord ? salesRecord.shippingAddress : '',
            shippingNotes: salesRecord ? salesRecord.shippingNotes : '',

            billingContactPhone: salesRecord ? salesRecord.billingContactPhone : '',
            billingContactName: salesRecord ? salesRecord.billingContactName : '',
            billingContactEmail: salesRecord ? salesRecord.billingContactEmail : '',
            billingAddress: salesRecord ? salesRecord.billingAddress : '',
            billingNotes: salesRecord ? salesRecord.billingNotes : '',

            selectedShippingMode: salesRecord ? salesRecord.selectedShippingMode : this.shippingMode[0],
            selectedStage: salesRecord ? salesRecord.selectedStage : this.stages[0],
            supplier: salesRecord ? salesRecord.supplier : '',
            shipper: salesRecord ? salesRecord.shipper : '',
            estProductionTime: salesRecord ? salesRecord.estProductionTime : 0,
            actProductionTime: salesRecord ? salesRecord.actProductionTime : 0

        };
        this.changeState = this.changeState.bind(this);
        this.updateMembers = this.updateMembers.bind(this);
        this.updateStakeholders = this.updateStakeholders.bind(this);
    }

    submitForm(event){
        event.preventDefault();
        const { projectName, shipper, supplier,
            selectedShippingMode, actualDeliveryDate, productionStartDate, startDate, endDate, estProductionTime, actProductionTime,
            shippingContactName, shippingContactPhone, shippingAddress,  shippingContactEmail,  shippingNotes,
            billingContactName, billingContactPhone, billingAddress, billingContactEmail,  billingNotes , selectedStage } = this.state;

        const data = {
            name: projectName,
            members: this.members,
            stakeholders: this.stakeholders,
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
        Meteor.call("insertSalesRecord", data, this.props.messages, (err, res)=>{
            if(err) return warning(`Problems with creating new project. ${err.error}`);

            info(`Success add new project & integration with Slack`);
            setTimeout(()=>{FlowRouter.go(FlowRouter.path("SalesRecord", {id: res}))},300)
        });
    }

    changeState(key) {
          return e => {
                if(e) {
                     this.setState({[key]: e.target ? e.target.value : e});
                }
          }
    }

    updateMembers(members) {
        this.members = members;
    }

    updateStakeholders(stakeholders) {
        this.stakeholders = stakeholders;
    }

    render() {
        const { projectName, selectedShippingMode, supplier, shipper,
            actualDeliveryDate, productionStartDate, startDate, endDate, estProductionTime, actProductionTime,
            shippingContactName, shippingAddress, shippingContactEmail, shippingContactPhone, shippingNotes,
            billingContactName, billingAddress, billingContactEmail, billingContactPhone, billingNotes, selectedStage
        } = this.state;
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
                    <SelectMembers
                        members={this.props.users.filter(({ _id })=> Roles.userIsInRole(_id, [EMPLOYEE_ROLE, ADMIN_ROLE]))}
                        selectedMembers={this.updateMembers}
                    />
                    <SelectStakeholders
                        members={this.props.contacts ? this.props.contacts : ContactStore.getContacts(1)}
                        selectedMembers={this.props.contacts}
                        onSelectStakeholders={this.updateStakeholders}
                    />
                    <div className='row'>
                        <div className='col-md-6'>
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
                        </div>
                        <div className='col-md-6'>
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
                                &nbsp;
                                <DatePicker
                                    className='form-control'
                                    selected={actualDeliveryDate}
                                    onChange={this.changeState('actualDeliveryDate')} />
                            </div>
                            <div className='form-group'>
                                <label>Production Start Date</label>
                                &nbsp;
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

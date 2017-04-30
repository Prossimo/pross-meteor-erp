import _ from 'underscore'
import React from 'react';
import {getUserName} from '/imports/api/lib/filters';
import Select from 'react-select';
import Textarea from 'react-textarea-autosize';
import {info, warning} from '/imports/api/lib/alerts';
import {DESIGNATION_LIST, STAKEHOLDER_CATEGORY, SHIPPING_MODE_LIST, STAGES} from '/imports/api/constants/project';
import {EMPLOYEE_ROLE, ADMIN_ROLE} from '/imports/api/constants/roles';
import Switch from 'rc-switch';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import NumericInput from 'react-numeric-input';
import SelectMembers from './salesRecord/SelectMembers';
import SelectStakeholders from './salesRecord/SelectStakeholders';
import ContactStore from '../../../api/nylas/contact-store'
import Contacts from '/imports/api/models/contacts/contacts'

class CreateSalesRecord extends React.Component {
    static propTypes = {
        stage: React.PropTypes.string,
        salesRecord: React.PropTypes.object,
        thread: React.PropTypes.object         // thread to be attached from email
    }

    constructor(props) {
        super(props);
        this.shippingMode = SHIPPING_MODE_LIST.map(item => ({label: item, value: item}));
        this.stages = STAGES.map(item => ({label: item.charAt(0).toUpperCase() + item.slice(1), value: item}));
        this.members = [];
        this.stakeholders = [];


        const {salesRecord} = props
        this.state = {
            projectName: salesRecord ? salesRecord.name : '',
            actualDeliveryDate: salesRecord ? moment(salesRecord.actualDeliveryDate) : moment(),
            productionStartDate: salesRecord ? moment(salesRecord.productionStartDate) : moment(),
            startDate: salesRecord && salesRecord.estDeliveryRange && salesRecord.estDeliveryRange.length ? moment(salesRecord.estDeliveryRange[0]) : moment().subtract(29, 'days'),
            endDate: salesRecord && salesRecord.estDeliveryRange && salesRecord.estDeliveryRange.length ? moment(salesRecord.estDeliveryRange[1]) : moment(),

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

            selectedShippingMode: salesRecord ? _.find(this.shippingMode, {value: salesRecord.shippingMode}) : this.shippingMode[0],
            selectedStage: salesRecord ? _.find(this.stages, {value: salesRecord.stage}) : this.stages[0],
            supplier: salesRecord ? salesRecord.supplier : '',
            shipper: salesRecord ? salesRecord.shipper : '',
            estProductionTime: salesRecord ? salesRecord.estProductionTime : 0,
            actProductionTime: salesRecord ? salesRecord.actProductionTime : 0,

            contacts: ContactStore.getContacts(1),
            stakeholders: []
        };

        if (props.thread) {
            const filter = {
                account_id: props.thread.account_id,
                email: {
                    $in: _.pluck(props.thread.participants, 'email')
                }
            }

            const contacts = _.filter(_.uniq(Contacts.find(filter).fetch(), (c) => c.email), (c) => {
                var re = /\S+@prossimo.us/;
                if (re.test(c.email)) return false   // Remove @prossimo.us contacts

                const users = Meteor.users.find({'emails.address': c.email}).fetch()
                if (users && users.length) return false  // Remove CRM users

                return true
            })
            if (contacts && contacts.length)
                this.state.stakeholders = contacts;
        }

        if (props.salesRecord && props.salesRecord.stakeholders) {
            let stakeholders = []
            props.salesRecord.stakeholders.forEach((stakeholder) => {
                const contact = Contacts.findOne({_id: stakeholder.contactId})
                if (contact) {
                    stakeholders.push({
                        _id: contact._id,
                        name: contact.name,
                        email: contact.email,
                        isMainStakeholder: stakeholder.isMainStakeholder,
                        notify: stakeholder.notify,
                        designation: {label: stakeholder.destination, value: stakeholder.destination},
                        categories: stakeholder.category.map((category)=>({label: category, value: category}))
                    })
                }
            })
            this.state.stakeholders = _.uniq(stakeholders,(st)=>st._id)
        }

        this.changeState = this.changeState.bind(this);
        this.updateMembers = this.updateMembers.bind(this);
        this.updateStakeholders = this.updateStakeholders.bind(this);
    }

    submitForm(event) {
        event.preventDefault();
        const {
            projectName, shipper, supplier,
            selectedShippingMode, actualDeliveryDate, productionStartDate, startDate, endDate, estProductionTime, actProductionTime,
            shippingContactName, shippingContactPhone, shippingAddress, shippingContactEmail, shippingNotes,
            billingContactName, billingContactPhone, billingAddress, billingContactEmail, billingNotes, selectedStage
        } = this.state;

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

        if(this.props.salesRecord) {
            Meteor.call("updateSalesRecord", this.props.salesRecord._id, data, this.props.thread, (err, res) => {
                if (err) return warning(`Problems with updating new SalesRecord. ${err.error}`);

                info(`Success update SalesRecord`);
                setTimeout(() => {
                    FlowRouter.go(FlowRouter.path("SalesRecord", {id: this.props.salesRecord._id}))
                }, 300)
            });

        } else {
            Meteor.call("insertSalesRecord", data, this.props.thread, (err, res) => {
                if (err) return warning(`Problems with creating new SalesRecord. ${err.error}`);

                info(`Success add new SalesRecord & integration with Slack`);
                setTimeout(() => {
                    FlowRouter.go(FlowRouter.path("SalesRecord", {id: res}))
                }, 300)
            });
        }
    }

    changeState(key) {
        return e => {
            if (e) {
                this.setState({[key]: e.target ? e.target.value : e});
            }
        }
    }

    updateMembers(members) {console.log('CreateSalesRecord updateMembers', members)
        this.members = members;
    }

    updateStakeholders(stakeholders) {
        this.stakeholders = stakeholders;
    }

    render() {
        const {
            projectName, selectedShippingMode, supplier, shipper,
            actualDeliveryDate, productionStartDate, startDate, endDate, estProductionTime, actProductionTime,
            shippingContactName, shippingAddress, shippingContactEmail, shippingContactPhone, shippingNotes,
            billingContactName, billingAddress, billingContactEmail, billingContactPhone, billingNotes, selectedStage,
            contacts, stakeholders
        } = this.state;
        const {shippingMode, stages} = this;
        let submitBtnName = this.props.salesRecord ? 'Save SalesRecord' : 'Add SalesRecord';
        let dealTitle = '';
        switch (this.props.stage) {
            case 'lead':
                submitBtnName = this.props.salesRecord ? 'Save Lead' : 'Add Lead';
                dealTitle = 'Lead Name'
                break;
            case 'opportunity':
                submitBtnName = this.props.salesRecord ? 'Save Opportunity' : 'Add Opportunity';
                 dealTitle = 'Opportunity Name'
                break;
            case 'order':
                submitBtnName = this.props.salesRecord ? 'Save Order' : 'Add Order';
                dealTitle = 'Order Name'
                break;
            case 'ticket':
                submitBtnName = this.props.salesRecord ? 'Save Ticket' : 'Add Ticket';
                dealTitle = 'Ticket Name'
                break;
        }

        return (
            <div className="create-project">
                <form onSubmit={this.submitForm.bind(this)}
                      className="">
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
                    <div className="form-group">
                        <label>{dealTitle}</label>
                        <input type="text"
                               className='form-control'
                               onChange={this.changeState('projectName')}
                               value={projectName}/>
                    </div>
                    <SelectMembers
                        members={this.props.users.filter(({_id}) => Roles.userIsInRole(_id, [EMPLOYEE_ROLE, ADMIN_ROLE]))}
                        onSelectMembers={this.updateMembers}
                    />
                    <SelectStakeholders
                        members={ this.props.thread ? stakeholders : contacts }
                        selectedMembers={stakeholders}
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
                                    selectsStart startDate={startDate}
                                    endDate={endDate}
                                    onChange={this.changeState('startDate')}/>
                                &nbsp;
                                to
                                &nbsp;
                                <DatePicker
                                    className='form-control'
                                    selected={endDate}
                                    selectsEnd startDate={startDate}
                                    endDate={endDate}
                                    onChange={this.changeState('endDate')}/>
                            </div>
                            <div className='form-group'>
                                <label>Actual Delivery Date</label>
                                &nbsp;
                                <DatePicker
                                    className='form-control'
                                    selected={actualDeliveryDate}
                                    onChange={this.changeState('actualDeliveryDate')}/>
                            </div>
                            <div className='form-group'>
                                <label>Production Start Date</label>
                                &nbsp;
                                <DatePicker
                                    className='form-control'
                                    selected={productionStartDate}
                                    onChange={this.changeState('productionStartDate')}/>
                            </div>
                            <div className='form-group'>
                                <label>Estimate Production Time (weeks)</label>
                                <NumericInput
                                    min={0}
                                    value={estProductionTime}
                                    className='form-control'
                                    onChange={this.changeState('estProductionTime')}/>
                            </div>
                            <div className='form-group'>
                                <label>Actual Production Time (weeks)</label>
                                <NumericInput
                                    min={0}
                                    value={actProductionTime}
                                    className='form-control'
                                    onChange={this.changeState('actProductionTime')}/>
                            </div>
                            <div className='form-group'>
                                <label>Shipper</label>
                                <input type="text"
                                       className='form-control'
                                       onChange={this.changeState('shipper')}
                                       value={shipper}/>
                            </div>
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

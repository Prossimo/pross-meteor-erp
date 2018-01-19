import _ from 'underscore'
import {FlowRouter} from 'meteor/kadira:flow-router'
import TrackerReact from 'meteor/ultimatejs:tracker-react'
import {Roles} from 'meteor/alanning:roles'
import React from 'react'
import {FormGroup, Radio, Modal, Checkbox} from 'react-bootstrap'
import Select from 'react-select'
import {info, warning} from '/imports/api/lib/alerts'
import {
    SHIPPING_MODE_LIST,
    STAGES
} from '/imports/api/constants/project'
import moment from 'moment'
import SelectMembers from './components/SelectMembers'
import SelectStakeholders from './components/SelectStakeholders'
import {People, Conversations, SalesRecords} from '/imports/api/models'
import SelectSubStage from './components/SelectSubStage'
import NylasUtils from '/imports/api/nylas/nylas-utils'
import ConversationForm from './conversations/ConversationForm'

class CreateSalesRecord extends TrackerReact(React.Component) {
    static propTypes = {
        stage: React.PropTypes.string,
        salesRecord: React.PropTypes.object,
        thread: React.PropTypes.object         // thread to be attached from email
    }

    constructor(props) {
        super(props)
        this.shippingMode = SHIPPING_MODE_LIST.map(item => ({label: item, value: item}))
        this.stages = STAGES.map(item => ({label: item.charAt(0).toUpperCase() + item.slice(1), value: item}))

        const {salesRecord} = props
        this.state = {
            projectName: salesRecord ? salesRecord.name : '',
            subStage: salesRecord ? salesRecord.subStage : null,
            actualDeliveryDate: salesRecord ? moment(salesRecord.actualDeliveryDate) : null/*moment()*/,
            productionStartDate: salesRecord ? moment(salesRecord.productionStartDate) : null/*moment()*/,
            startDate: salesRecord && salesRecord.estDeliveryRange && salesRecord.estDeliveryRange.length ? moment(salesRecord.estDeliveryRange[0]) : null/*moment().subtract(29, 'days')*/,
            endDate: salesRecord && salesRecord.estDeliveryRange && salesRecord.estDeliveryRange.length ? moment(salesRecord.estDeliveryRange[1]) : null/*moment()*/,

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

            members: salesRecord ? salesRecord.members : null,
            stakeholders: salesRecord ? salesRecord.stakeholders : [],
            blocking: false,

            selectedConversation: salesRecord && salesRecord.conversationIds && salesRecord.conversationIds.length > 0 ? salesRecord.conversationIds[0] : null,

            isPrivateSlackChannel: false
        }

        this.changeState = this.changeState.bind(this)
        this.updateMembers = this.updateMembers.bind(this)

        if (props.thread) {
            const {participants, account_id} = props.thread
            const people = salesRecord ? People.find({_id: {$in: _.pluck(salesRecord.stakeholders, 'peopleId')}}).fetch().map((p) => {
                const stakeholder = salesRecord.stakeholders.find((s) => s.peopleId === p._id)
                return _.extend(p, {
                    isMainStakeholder: stakeholder.isMainStakeholder
                })
            }) : []
            const threadPeople = People.find({'emails.email': {$in: _.pluck(participants, 'email').filter((email) => !NylasUtils.isOwner(account_id, email))}}).fetch()
            threadPeople.forEach((p) => {
                if (!_.find(people, {_id: p._id})) {
                    people.push(p)
                }
            })
            this.state.people = people
        }
    }

    submitForm(event) {
        event.preventDefault()
        const {
            projectName, subStage, shipper, supplier, stakeholders, members,
            selectedShippingMode, actualDeliveryDate, productionStartDate, startDate, endDate, estProductionTime, actProductionTime,
            shippingContactName, shippingContactPhone, shippingAddress, shippingContactEmail, shippingNotes,
            billingContactName, billingContactPhone, billingAddress, billingContactEmail, billingNotes, selectedStage,
            selectedConversation,
            isPrivateSlackChannel
        } = this.state

        const data = {
            name: projectName,
            members,
            stakeholders,
            actualDeliveryDate: actualDeliveryDate ? actualDeliveryDate.toDate() : undefined,
            productionStartDate: productionStartDate ? productionStartDate.toDate() : undefined,
            estDeliveryRange: startDate && endDate ? [startDate.toDate(), endDate.toDate()] : undefined,

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
            subStage,
            supplier,
            shipper,
            estProductionTime,
            actProductionTime
        }

        const {thread, salesRecord} = this.props
        this.props.toggleLoader(true)
        if (salesRecord) {
            Meteor.call('updateSalesRecord', {
                _id: salesRecord._id,
                data,
                thread,
                conversationId: selectedConversation
            }, (err, res) => {
                this.props.toggleLoader(false)
                if (err) return warning(`Problems with updating new SalesRecord. ${err.error}`)

                info('Success update Deal')
                setTimeout(() => {
                    FlowRouter.go(FlowRouter.path('Deal', {id: salesRecord._id}))
                }, 300)
            })
        } else {console.log(data)
            Meteor.call('insertSalesRecord', {data, thread, isPrivateSlackChannel}, (err, res) => {
                this.props.toggleLoader(false)
                if (err) return warning(`Problems with creating new SalesRecord. ${err.error}`)

                info('Success add new Deal & integration with Slack')
                setTimeout(() => {
                    FlowRouter.go(FlowRouter.path('Deal', {id: res}))
                }, 300)
            })
        }
    }

    changeState(key) {
        return e => {
            if (e) {
                this.setState({[key]: e.target ? e.target.value : e})
            }
        }
    }

    updateMembers(members) {
        this.state.members = members
    }

    updateStakeholders = (stakeholders) => {
        console.log('updateStakeholders', stakeholders)
        this.state.stakeholders = stakeholders
    }

    onClickAddConversation = () => {
        this.setState({
            showConversationModal: true
        })
    }

    onSavedConversation = () => {
        this.setState({showConversationModal: false})
    }

    render() {
        const {
            projectName, subStage, selectedShippingMode, supplier, shipper,
            actualDeliveryDate, productionStartDate, startDate, endDate, estProductionTime, actProductionTime,
            shippingContactName, shippingAddress, shippingContactEmail, shippingContactPhone, shippingNotes,
            billingContactName, billingAddress, billingContactEmail, billingContactPhone, billingNotes, selectedStage,
            contacts, stakeholders, members
        } = this.state
        const {shippingMode, stages} = this
        let submitBtnName = this.props.salesRecord ? 'Save Deal' : 'Add Deal'
        let dealTitle = ''
        switch (this.props.stage) {
            case 'lead':
                submitBtnName = this.props.salesRecord ? 'Save Lead' : 'Add Lead'
                dealTitle = 'Lead Name'
                break
            case 'opportunity':
                submitBtnName = this.props.salesRecord ? 'Save Opportunity' : 'Add Opportunity'
                dealTitle = 'Opportunity Name'
                break
            case 'order':
                submitBtnName = this.props.salesRecord ? 'Save Order' : 'Add Order'
                dealTitle = 'Order Name'
                break
            case 'ticket':
                submitBtnName = this.props.salesRecord ? 'Save Ticket' : 'Add Ticket'
                dealTitle = 'Ticket Name'
                break
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
                                        className={'select-role'}
                                        clearable={false}
                                    />
                                </div>
                            </div>
                        ) : ''
                    }
                    <div className="row">
                        <div className="col-md-8">
                            <div className="form-group">
                                <label>{dealTitle ? dealTitle : 'Deal Name'}</label>
                                <input type="text"
                                       className='form-control'
                                       onChange={this.changeState('projectName')}
                                       value={projectName}
                                />
                            </div>
                        </div>
                        <div className="col-md-4">
                            <SelectSubStage
                                stage={this.props.stage || selectedStage.value}
                                subStage={subStage}
                                onSelectSubStage={(subStage) => this.setState({subStage: subStage.value})}
                            />
                        </div>
                    </div>

                    <SelectMembers
                        members={members}
                        onSelectMembers={this.updateMembers}
                    />
                    <SelectStakeholders
                        people={this.state.people}
                        onSelectPeople={this.updateStakeholders}
                    />
                    {
                        this.props.thread && this.props.salesRecord && this.renderConversationSelector()
                    }
                    {
                        !this.props.salesRecord && (
                            <div className="form-group">
                                <Checkbox checked={this.state.isPrivateSlackChannel} onChange={e => this.setState({isPrivateSlackChannel: e.target.checked})}>Is Private Slack Channel</Checkbox>
                            </div>
                        )
                    }
                    <div className='form-group text-center'>
                        <button className="btnn primary-btn">{submitBtnName}</button>
                    </div>
                </form>
                {this.props.salesRecord && this.renderConversationModal()}
            </div>
        )
    }

    renderConversationSelector() {
        if (!this.props.salesRecord) return ''

        const salesRecord = SalesRecords.findOne(this.props.salesRecord._id)
        if (!salesRecord || !salesRecord.conversationIds) return ''

        const conversations = Conversations.find({_id: {$in: salesRecord.conversationIds}}).fetch()

        console.log(JSON.stringify({_id: {$in: salesRecord.conversationIds}}), conversations)

        if (!conversations || conversations.length == 0) return ''

        const {selectedConversation} = this.state
        return (
            <div className='panel panel-default'>
                <div className='panel-heading'>
                    <div className="panel-header">
                        <div className="title">Select conversation</div>
                        <div className="action" onClick={this.onClickAddConversation}>+</div>
                    </div>
                </div>
                <div className='panel-body' style={{display: 'flex'}}>
                    <FormGroup>
                        {
                            conversations.map(c => (
                                <Radio key={`conversation-radio-${c._id}`} value={c._id}
                                       checked={selectedConversation == c._id} onChange={this.selectConversation}
                                       inline> {c.name}</Radio>
                            ))
                        }
                    </FormGroup>
                </div>
            </div>
        )
    }

    renderConversationModal() {
        if (!this.props.salesRecord) return ''

        const {showConversationModal} = this.state

        return (
            <Modal show={showConversationModal} onHide={() => {
                this.setState({showConversationModal: false})
            }} bsSize="large">
                <Modal.Header closeButton><Modal.Title>Add conversation</Modal.Title></Modal.Header>
                <Modal.Body>
                    <ConversationForm targetCollection={SalesRecords} targetId={this.props.salesRecord._id}
                                      onSaved={this.onSavedConversation}/>
                </Modal.Body>
            </Modal>
        )

    }

    selectConversation = (e) => {
        this.setState({selectedConversation: e.target.value})
    }
}

export default CreateSalesRecord

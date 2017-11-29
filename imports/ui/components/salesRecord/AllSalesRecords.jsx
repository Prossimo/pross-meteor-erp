/* global moment, FlowRouter */
import {Roles} from 'meteor/alanning:roles'
import React from 'react'
import {Table, Glyphicon, Button} from 'react-bootstrap'
import classNames from 'classnames'
import DatePicker from 'react-datepicker'
import {ROLES, Users, ClientStatus, SupplierStatus, People} from '/imports/api/models'
import {SHIPPING_MODE_LIST} from '/imports/api/constants/project'
import {info, warning} from '/imports/api/lib/alerts'
import Select from 'react-select'
import swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
import 'bootstrap-select'
import 'bootstrap-select/dist/css/bootstrap-select.min.css'
import KanbanView from './kanbanView/KanbanView'

import {DEAL_PRIORITY, DEAL_PROBABILITY} from '/imports/api/models/salesRecords/salesRecords'

import {
    SUB_STAGES_LEAD,
    SUB_STAGES_OPP,
    SUB_STAGES_ORDER,
    SUB_STAGE_TICKET,
    STAGES_MAP
} from '../../../api/constants/project'

class AllSalesRecords extends React.Component {
    constructor(props) {
        super(props)

        const clientStatuses = ClientStatus.find().fetch()
        const supplierStatuses = SupplierStatus.find().fetch()

        this.state = {
            hoverCell: {
                key: null,
                rowIndex: null,
                value: null,
            },
            edittingCell: {
                key: null,
                rowIndex: null,
                value: null,
                _id: null,
            },
            possibleColumns: [
                {
                    key: '_id',
                    label: 'ID',
                    type: 'text',
                    selected: false,
                    editable: false,
                }, {
                    key: 'name',
                    label: 'Name',
                    type: 'text',
                    selected: false,
                    editable: true,
                },
                {
                    key: 'dealer',
                    label: '  Dealer  ',
                    selected: false,
                    options: record => People.find().fetch().filter(p => {
                        const designation = p.designation()
                        return designation && designation.name === 'Dealer'
                    }).map(p => ({value: p._id, label: p.name})),
                    type: 'select',
                    editable: true,
                    renderer: record => {
                        const dealer = record.getDealer()
                        return dealer ? dealer.name : null
                    }
                },
                {
                    key: 'productionStartDate',
                    label: 'Start Date',
                    selected: false,
                    type: 'date',
                    editable: true,
                },
                {
                    key: 'actualDeliveryDate',
                    label: 'Delivery Date',
                    selected: false,
                    type: 'date',
                    editable: true,
                },
                {
                    key: 'shippingContactEmail',
                    label: 'Shipping Email',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingAddress',
                    label: 'Shipping Address',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingContactPhone',
                    label: 'Shipping Phone',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingNotes',
                    label: 'Shipping Notes',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingContactName',
                    label: 'Billing Contact',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingContactEmail',
                    label: 'Billing Email',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingAddress',
                    label: 'Billing Address',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingContactPhone',
                    label: 'Billing Phone',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'billingNotes',
                    label: 'Billing Notes',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingMode',
                    label: 'Shipping Mode',
                    selected: false,
                    type: 'select',
                    options: SHIPPING_MODE_LIST.map((value) => ({label: value, value})),
                    editable: true,
                },
                {
                    key: 'supplier',
                    label: 'Supplier',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shipper',
                    label: 'Shipper',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'shippingContactName',
                    label: 'Shipping Name',
                    selected: false,
                    type: 'text',
                    editable: true,
                },
                {
                    key: 'stage',
                    label: 'Stage',
                    selected: false,
                    options: [],
                    type: 'select',
                    editable: true
                },
                {
                    key: 'subStage',
                    label: 'Sub Stage',
                    selected: false,
                    options: [],
                    type: 'select',
                    editable: true
                },
                {
                    key: 'teamLead',
                    label: 'Team Lead',
                    selected: false,
                    options: record => record.getMembers().map(m => ({value: m._id, label: m.name()})),
                    type: 'select',
                    editable: true,
                    renderer: record => {
                        const user = Users.findOne(record.teamLead)
                        return user ? user.name() : null
                    }
                },
                {
                    key: 'bidDueDate',
                    label: 'Bid Due Date',
                    selected: false,
                    type: 'date',
                    editable: true
                },
                {
                    key: 'priority',
                    label: 'Priority',
                    selected: false,
                    options: Object.values(DEAL_PRIORITY).map(v => ({value: v, label: v})),
                    type: 'select',
                    editable: true
                },
                {
                    key: 'expectedRevenue',
                    label: 'Expected Revenue',
                    selected: false,
                    options: [],
                    type: 'currency',
                    editable: true,
                    renderer: record => {
                        if (!record.expectedRevenue) return ''
                        return `$ ${parseFloat(record.expectedRevenue).toLocaleString('en-US', {
                            minimunFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}`
                    }
                },
                {
                    key: 'totalSquareFootage',
                    label: 'Total Square Footage',
                    selected: false,
                    options: [],
                    type: 'currency',
                    editable: true,
                    renderer: record => {
                        if (!record.totalSquareFootage) return ''
                        return `$ ${parseFloat(record.totalSquareFootage).toLocaleString('en-US', {
                            minimunFractionDigits: 2,
                            maximumFractionDigits: 2
                        })}`
                    }
                },
                {
                    key: 'probability',
                    label: 'Probability',
                    selected: false,
                    options: Object.values(DEAL_PROBABILITY).map(v => ({value: v, label: v})),
                    type: 'select',
                    editable: true
                },
                {
                    key: 'clientStatus',
                    label: 'Client Status',
                    selected: false,
                    options: clientStatuses.map(v => ({value: v._id, label: v.name})),
                    type: 'select',
                    editable: true,
                    renderer: record => {
                        const status = _.findWhere(clientStatuses, {_id: record.clientStatus})
                        return status ? status.name : null
                    }
                },
                {
                    key: 'supplierStatus',
                    label: 'Supplier Status',
                    selected: false,
                    options: supplierStatuses.map(v => ({value: v._id, label: v.name})),
                    type: 'select',
                    editable: true,
                    renderer: record => {
                        const status = _.findWhere(supplierStatuses, {_id: record.supplierStatus})
                        return status ? status.name : null
                    }
                }
            ],
            showKanbanView: false
        }

        this.state.sort = {
            by: 'productionStartDate',
            asc: false
        }

        this.renderRows = this.renderRows.bind(this)
        this.allowEdit = this.allowEdit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.handleMouseEnter = this.handleMouseEnter.bind(this)
        this.handleMouseLeave = this.handleMouseLeave.bind(this)
        this.renderEditButton = this.renderEditButton.bind(this)
        this.renderSaveButton = this.renderSaveButton.bind(this)
        this.updateProject = this.updateProject.bind(this)
        this.removeProject = this.removeProject.bind(this)
        this.updateStage = this.updateStage.bind(this)
    }

    handleMouseLeave() {
        this.setState({
            hoverCell: {
                key: null,
                rowIndex: null,
                value: null,
            }
        })
    }

    handleMouseEnter(key, rowIndex, value) {
        const {editable} = this.state.possibleColumns.find((column) => column.key === key)
        if (!editable) return
        this.setState({
            hoverCell: {
                key,
                rowIndex,
                value
            }
        })
    }

    allowEdit(key, rowIndex, value, _id) {
        this.setState({
            edittingCell: {
                key,
                rowIndex,
                value,
                _id,
            }
        })
    }

    handleChange(value) {
        const edittingCell = this.state.edittingCell
        edittingCell.value = value
        this.setState({
            edittingCell,
        })
    }

    renderEditButton(key, index, value, _id) {
        if (this.state.edittingCell.key) return
        if (key === this.state.hoverCell.key && index === this.state.hoverCell.rowIndex) {
            return (
                <button
                    className='btn btn-sm pull-right btn-primary'
                    onClick={() => this.allowEdit(key, index, value, _id)}
                >
                    <i className='fa fa-pencil'/>
                </button>
            )
        }
    }

    updateProject() {
        // TODO: update salesRecord at here
        const {type} = this.state.possibleColumns.find(({key}) => key === this.state.edittingCell.key)
        const _id = this.state.edittingCell._id
        let {value} = this.state.edittingCell
        const {key} = this.state.edittingCell
        switch (type) {
            case 'date':
                value = value.toDate()
                break
            case 'select':
                // When user did not select any new option
                value = value.value ? value.value : value
                break
            default:
                break
        }
        Meteor.call('updateProjectProperty', _id, {key, value}, (error) => {
            if (error) return warning(`Problems with updating project. ${error.error}`)
            this.handleMouseLeave()
            this.setState({
                edittingCell: {
                    key: null,
                    rowIndex: null,
                    value: null,
                    _id: null
                }
            })
            return info('Success update project')
        })
    }

    updateStage() {
        const _id = this.state.edittingCell._id
        let {value} = this.state.edittingCell
        value = value.value ? value.value : value
        Meteor.call('changeStageOfSalesRecord', _id, value, (error) => {
            if (error) return warning(`Problems with updating project. ${error.error}`)
            this.handleMouseLeave()
            this.setState({
                edittingCell: {
                    key: null,
                    rowIndex: null,
                    value: null,
                    _id: null
                }
            })
            return info('Success update project')
        })
    }

    renderSaveButton(key) {
        return (
            <button
                className='btn btn-warning btn-sm pull-right'
                onClick={key === 'stage' ? this.updateStage.bind('', key) : this.updateProject}
            >
                <i className='fa fa-save'/> Save
            </button>
        )

    }

    getSubStages(stage) {
        switch (stage) {
            case 'lead':
                return SUB_STAGES_LEAD
            case 'opportunity':
                return SUB_STAGES_OPP
            case 'order':
                return SUB_STAGES_ORDER
            case 'ticket':
                return SUB_STAGE_TICKET
            default:
                return []
        }
    }

    getSortedData() {
        let {salesRecords} = this.props
        const {keyword} = this.props
        const {by, asc} = this.state.sort

        if(!this.state.showArchivedDeals) salesRecords = salesRecords.filter(s => !s.archived)
        if(keyword && keyword.length > 0) {
            salesRecords = salesRecords.filter((s) => s.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1)
        }

        if (asc) {
            return _.sortBy(salesRecords, by)
        } else {
            return _.sortBy(salesRecords, by).reverse()
        }
    }

    sortBy = (key) => {
        const {by, asc} = this.state.sort

        if (by == key) this.setState({sort: {by, asc: !asc}})
        else this.setState({sort: {by: key, asc: true}})
    }

    renderRows() {
        const selectedColumns = this.state.possibleColumns.filter(({selected}) => selected)
        const salesRecords = this.getSortedData()
        return salesRecords.map((project, index) => (
            <tr key={project._id}>
                {
                    selectedColumns.map(({key, type, options, renderer}) => {
                        if (key === this.state.edittingCell.key && index === this.state.edittingCell.rowIndex) {
                            switch (type) {
                                case 'date':
                                    return (
                                        <td key={key}>
                                            <div>
                                                <DatePicker
                                                    selected={this.state.edittingCell.value}
                                                    onChange={this.handleChange}
                                                />
                                                {this.renderSaveButton()}
                                            </div>
                                        </td>
                                    )
                                case 'select':
                                    options = key === 'subStage' ? this.getSubStages(project.stage) : options
                                    options = key === 'stage' ? STAGES_MAP : options
                                    return (
                                        <td key={key}>
                                            <div>
                                                <Select
                                                    style={{width: '60%'}}
                                                    value={this.state.edittingCell.value}
                                                    options={options && typeof options === 'function' ? options(project) : options}
                                                    onChange={this.handleChange}
                                                />
                                                {this.renderSaveButton(key)}
                                            </div>
                                        </td>
                                    )
                                default:
                                    return (
                                        <td key={key}>
                                            <div>
                                                <input
                                                    type='text'
                                                    value={this.state.edittingCell.value}
                                                    onChange={(event) => this.handleChange(event.target.value)}
                                                />
                                                {this.renderSaveButton()}
                                            </div>
                                        </td>
                                    )
                                    break
                            }
                        } else {
                            switch (type) {
                                case 'date':
                                    const date = project[key] ? moment(project[key]).format('MM/DD/YYYY') : ''
                                    return (
                                        <td
                                            key={key}
                                            onMouseLeave={this.handleMouseLeave}
                                            onMouseEnter={() => this.handleMouseEnter(key, index, moment(project[key]))}
                                        >
                                            <div>
                                                {date}
                                                {this.renderEditButton(key, index, moment(project[key]), project._id)}
                                            </div>
                                        </td>
                                    )
                                default:
                                    return (
                                        <td
                                            key={key}
                                            onMouseLeave={this.handleMouseLeave}
                                            onMouseEnter={() => this.handleMouseEnter(key, index, project[key])}
                                        >
                                            <div>
                                                {renderer && (typeof renderer === 'function') ? renderer(project) : project[key]}
                                                {this.renderEditButton(key, index, project[key], project._id)}
                                            </div>
                                        </td>)
                            }
                        }
                    })
                }
                <td>
                    <div className='btn-group'>
                        <Button onClick={() => this.goToProject(project)} bsSize='small'><i className='fa fa-link'/>
                        </Button>
                        {Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN) && (
                            <Button onClick={() => this.removeProject(project._id)} bsStyle='danger' bsSize='small'><i
                                className='fa fa-trash'/></Button>)}
                        {Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN) && !project.archived && (
                            <Button onClick={() => this.archiveSalesRecord(project._id)} bsStyle='warning'
                                    bsSize='small'><i className='fa fa-archive'/></Button>)}
                        {Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN) && project.archived && (
                            <Button onClick={() => this.activeSalesRecord(project._id)} bsStyle='success'
                                    bsSize='small'><i className='fa fa-archive'/></Button>)}
                    </div>
                </td>
            </tr>
        ))
    }

    renderProjectList() {
        const selectedColumns = this.state.possibleColumns.filter(({selected}) => selected)
        const {by, asc} = this.state.sort
        return (
            <div className="list-view-content">
                <Table condensed hover>
                    <thead>
                    <tr>
                        {
                            selectedColumns.map(({label, key}) => (
                                <th style={{cursor: 'pointer'}} key={key} onClick={() => this.sortBy(key)}>
                                    {label}
                                    {by == key && asc && <i style={{marginLeft: 5}} className="fa fa-caret-up"/>}
                                    {by == key && !asc && <i style={{marginLeft: 5}} className="fa fa-caret-down"/>}
                                </th>
                            ))
                        }
                        <th></th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderRows()}
                    </tbody>
                </Table>
            </div>
        )
    }

    removeProject(_id) {
        swal({
            title: 'Are you sure ?',
            type: 'warning',
            html: `
          <div class='form-group text-left'>
            <div class='checkbox'>
              <label>
                <input type='checkbox' checked id='confirm-remove-folders'/> Remove resource folders
              </label>
            </div>
            <div class='checkbox'>
              <label>
                <input type='checkbox' checked id='confirm-remove-slack'/> Remove slack channel
              </label>
            </div>
          </div>
        `,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, remove it!',
            preConfirm: () => new Promise((resolve) => {
                resolve({
                    isRemoveFolders: $('#confirm-remove-folders').is(':checked'),
                    isRemoveSlack: $('#confirm-remove-slack').is(':checked'),
                })
            })
        }).then(({isRemoveFolders, isRemoveSlack}) => {
            Meteor.call('removeSalesRecord', {_id, isRemoveFolders, isRemoveSlack}, (error, result) => {
                if (error) {
                    const msg = error.reason ? error.reason : error.message
                    return swal('remove deal failed', msg, 'warning')
                }
                swal(
                    'Removed!',
                    'Deal has been removed.',
                    'success'
                )
            })
        })
    }

    archiveSalesRecord(_id) {
        swal({
            title: 'Are you sure to archive this deal?',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, archive it!',
        }).then(() => {
            Meteor.call('archiveSalesRecord', _id, true, (error, result) => {
                if (error) {
                    const msg = error.reason ? error.reason : error.message
                    return swal('archiving deal failed', msg, 'warning')
                }
                swal(
                    'Archive!',
                    'Deal has been archived.',
                    'success'
                )
            })
        })
    }

    activeSalesRecord(_id) {
        Meteor.call('archiveSalesRecord', _id, false, (error, result) => {
            if (error) {
                const msg = error.reason ? error.reason : error.message
                return swal('activating deal failed', msg, 'warning')
            }
            swal(
                'Active!',
                'Deal has been actived again.',
                'success'
            )
        })
    }

    goToProject(project) {
        FlowRouter.go('Deal', {id: project._id})
    }

    componentDidMount() {
        const _this = this

        //init tooltip
        $('[data-toggle="tooltip"]').tooltip()
        $('[data-toggle="tooltip"]').on('show.bs.tooltip', function () {
            // Only one tooltip should ever be open at a time
            $('.tooltip').not(this).hide()
        })

        Meteor.call('getVisibleFields', 'salesRecord', (error, selectedFields) => {
            if (!error) {
                const possibleColumns = _this.state.possibleColumns
                possibleColumns.forEach((column) => {
                    if (selectedFields.includes(column.key)) {
                        column.selected = true
                    }
                })
                _this.setState({possibleColumns})

                $('.selectpicker').selectpicker({
                    style: 'btn-default',
                    size: 4
                })

                $('.selectpicker').selectpicker('val', selectedFields)

                $('.selectpicker').on('changed.bs.select', function () {
                    const selectedKeys = $(this).val()
                    const possibleColumns = _this.state.possibleColumns
                    possibleColumns.forEach((column) => {
                        if (selectedKeys.includes(column.key))
                            return column.selected = true
                        return column.selected = false
                    })
                    _this.setState({
                        hoverCell: {
                            key: null,
                            rowIndex: null,
                            value: null,
                        },
                        edittingCell: {
                            key: null,
                            rowIndex: null,
                            value: null,
                            _id: null,
                        },
                        possibleColumns
                    })
                    Meteor.call('updateVisibleFields', 'salesRecord', selectedKeys, (error) => {

                    })
                })
            }
        })
    }

    renderKanbanView() {
        const {stage, keyword} = this.props
        let {salesRecords} = this.props
        if(!this.state.showArchivedDeals) salesRecords = salesRecords.filter(s => !s.archived)
        if(keyword && keyword.length > 0) {
            salesRecords = salesRecords.filter((s) => s.name.toLowerCase().indexOf(keyword.toLowerCase()) > -1)
        }

        const isSubStage = stage !== undefined
        const columns = isSubStage ? this.getSubStages(stage).map((sub) => ({id: sub.value, title: sub.label})) : STAGES_MAP.map((stage) => ({id: stage.value, title: stage.label}))
        return (
            <div className="kanban-view-container">
                <KanbanView
                    columns={columns}
                    salesRecords={salesRecords}
                    isSubStage={isSubStage}
                />
            </div>
        )
    }

    renderListView() {
        return (
            <div className="list-view-container">
                <div className="list-view-toolbar">
                    <div style={{flex:1}}>&nbsp;</div>
                    <select className='selectpicker' multiple>
                        {
                            this.state.possibleColumns.map(({key, label}) => <option value={key}
                                                                                     key={key}>{label}</option>)
                        }
                    </select>
                </div>
                {this.renderProjectList()}
            </div>
        )
    }

    renderSwitchLabels() {
        const active = this.state.showKanbanView ? 'active' : ''
        return (
            <div className="flex toolbar-wrapper">
                <div className="margin-auto"><input type="checkbox" value={this.state.showArchivedDeals}
                            onChange={e => this.setState({showArchivedDeals:e.target.checked})}/>&nbsp;Show Archived Deals&nbsp;&nbsp;</div>
                <div className="flex-1 text-right input-group-btn">
                    <button
                        className={`btn btn-default ${!active ? 'active' : ''}`}
                        data-toggle="tooltip" title="List View"
                        data-replacement="auto"
                        onClick={() => {
                            this.setState({showKanbanView: false})
                        }}
                    >
                        <span className="fa fa-list" aria-hidden="true"></span>
                    </button>
                    <button
                        className={`btn btn-default ${active}`}
                        data-toggle="tooltip" title="Kaban View"
                        data-replacement="auto"
                        onClick={() => {
                            this.setState({showKanbanView: true})
                        }}
                    >
                        <span className="fa fa-align-left fa-rotate-90" aria-hidden="true"></span>
                    </button>
                </div>
            </div>
        )
    }

    render() {
        const showKaban = this.state.showKanbanView
        return (
            <div className="content-container">
                {this.renderSwitchLabels()}
                {showKaban && this.renderKanbanView()}
                {!showKaban && this.renderListView()}
            </div>
        )
    }
}

export default AllSalesRecords

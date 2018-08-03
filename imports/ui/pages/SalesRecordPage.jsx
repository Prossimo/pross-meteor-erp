import {Meteor} from 'meteor/meteor'
import React, {Component} from 'react'
import { Table } from 'react-bootstrap'
import _ from 'underscore'
import styled from 'styled-components'
import SalesRecord from '/imports/ui/components/salesRecord/SalesRecord'
import SalesRecordsNavbar from '/imports/ui/components/salesRecord/SalesRecordsNavbar'
import SalesRecordsTableHeader from '/imports/ui/components/salesRecord/SalesRecordsTableHeader'
import KanbanView from '/imports/ui/components/salesRecord/kanbanView/KanbanView'
import {
    SHIPPING_MODE_LIST,
    SUB_STAGES_LEAD,
    SUB_STAGES_OPP,
    SUB_STAGES_ORDER,
    SUB_STAGE_TICKET,
    SUB_STAGES,
    STAGES_MAP,
    STATES
} from '/imports/api/constants/project'

const subStages = [].concat(
    SUB_STAGES_LEAD,
    SUB_STAGES_OPP,
    SUB_STAGES_ORDER,
    SUB_STAGE_TICKET,
)

const GROUP_BY = {
    STAGE: 'stage',
    SUBSTAGE: 'subStage'
}
const ORDER = {
    ASC: 1,
    DESC: -1
}

const defaultColumns = ['_id', 'name', 'subStage', 'productionStartDate'];

const ThGroup = styled.th`
    vertical-align: middle;
    text-transform: uppercase;
    color: rgba(78, 217, 123, 0.7);
    cursor: pointer;
    background-color: #eeeeee;
    &:hover {
        color: rgb(78, 217, 123)
    }
`
const ThSubGroup = styled(ThGroup)`
    color: rgba(217, 83, 78, 0.7);
    text-transform: none;
    background-color: #f9f9f9;
    &:hover {
        color: rgb(217, 83, 78)
    }
`

export default class SalesRecordPage extends Component {
    state = {
        keyword: '',
        columns: [],
        groupBy: GROUP_BY.STAGE,
        showArchivedDeals: false,
        sort: {
            key: 'productionStartDate',
            order: ORDER.ASC
        },
        kanbanViews: {
            lead: false,
            opportunity: false,
            order: false,
            ticket: false,
        },
        editing: null,
        fixedHeader: false
    }

    componentDidMount() {
        this.delayedSearch = _.debounce((keyword) => {
            this.setState({ keyword })
        }, 1000)

        Meteor.call('getVisibleFields', 'salesRecord', (error, columns) => {
            if (error) {
                this.setState({ columns: defaultColumns })
                throw new Meteor.Error(error.message)
            }
            this.setState({ columns })

            Meteor.setTimeout(() => {
                const $tableContainer = $(this.tableContainer)
                $tableContainer.css({
                    'max-height': $(window).height() - $tableContainer.offset().top,
                })
            }, 200)
        })

    }

    getTitle = (stage) => {
        switch (stage) {
            case 'lead':
                return 'All Leads'
            case 'opportunity':
                return 'All Opportunity'
            case 'order':
                return 'All Orders'
            case 'ticket':
                return 'All Tickets'
            default:
                return 'All Deals'
        }
    }

    getSubStages = (stage) => {
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

    sortRecords = (list) => {
        const {sort} = this.state
        return list.sort((a, b) => {
            return a[sort.key] < b[sort.key]
                ? sort.order
                : -1 * sort.order
        })
    }

    setKanbanView = (key, flag) => {
        const {kanbanViews} = this.state
        kanbanViews[key] = flag
        this.setState({kanbanViews})
    }

    onChangeSearch = (keyword) => {
        this.delayedSearch(keyword)
    }

    sortGroups = (stages, groups) => {
        const sorted = {}
        stages.forEach((value) => {
            if (groups[value]) {
                sorted[value] = groups[value]
            }
        })
        return sorted
    }

    filterRecords = (list, { stage, keyword, showArchivedDeals }) => {
        const keyfilter = new RegExp(keyword, 'i')
        if (keyword || stage || showArchivedDeals) {
            console.log('keyfilter', keyfilter)
            return list.filter((item) => {
                const byKey = !keyword || item.name.search(keyfilter) > -1
                const byStage = !stage || item.stage == stage
                const byArchive = !showArchivedDeals || item.archived
                return byKey && byStage && byArchive
            })
        } else {
            return list
        }
    }

    handleSubGroup = (event) => {
        const $thRow = $(event.currentTarget).parents('tr')
        const $tbody = $(event.currentTarget).parents('tbody')
        const $allNext = $thRow.nextAll('tr')
        const $nextRow = _.find($allNext, row => {
            return $(row).children().first().attr('colspan') > 0
        } )
        const $siblings = $nextRow ? $thRow.nextUntil($nextRow, 'tr') : $allNext

        if ($thRow.hasClass('collapsed')) {
            $siblings.show()
            $thRow.removeClass('collapsed')
        } else {
            $siblings.hide()
            $thRow.addClass('collapsed')
        }
        // get all rows after current before next contains subgroupheader
    }

    handleGroup = (event) => {
        const $thRow = $(event.currentTarget).parents('tr')
        const $tbody = $(event.currentTarget).parents('tbody')
        if ($thRow.hasClass('collapsed')) {
            $('tr', $tbody).not($thRow).show()
            $thRow.removeClass('collapsed')
        } else {
            $('tr', $tbody).not($thRow).hide()
            $thRow.addClass('collapsed')
        }
    }

    handleSort = (sort) => {
        this.setState({ sort })
    }

    handleCols = (columns) => {
        if (columns.indexOf('name') < 0) {
            columns.unshift('name')
        }
        this.setState({ columns })
    }

    handleScroll = (event) => {
        this.setState({ fixedHeader: event.currentTarget.scrollTop > $('th', $(this.tableContainer)).height() })
    }

    toggleShowArchive = (showArchivedDeals) => {
        this.setState({ showArchivedDeals })
    }

    toggleGroupBy = (groupBy) => {
        this.setState({
            groupBy: groupBy ? GROUP_BY.SUBSTAGE : GROUP_BY.STAGE
        })
    }

    renderRecord = (record, index) => {
        const { columns, editing } = this.state
        return <SalesRecord
            columns={columns}
            record={record}
            key={index}
            editing={editing}
            setEditField={ref => this.setState({ editing: ref })}
        />
    }

    renderSubGroup = (group, key) => {
        const { columns } = this.state
        const subGroup = []
        const substage = _.findWhere(subStages, { value: key })

        subGroup.push((
            <tr key="trSubHead">
                <ThSubGroup colSpan={columns.length} onClick={this.handleSubGroup}>
                    {substage ? substage.label : key}
                </ThSubGroup>
                <ThSubGroup></ThSubGroup>
            </tr>
        ))
        this.sortRecords(group).forEach((record, index) => {
            subGroup.push(this.renderRecord(record, index))
        })
        return subGroup
    }

    renderGroup = (group, stage) => {
        const { columns, kanbanViews } = this.state
        return (
            <tbody key={stage}>
                <tr>
                    <ThGroup colSpan={columns.length} onClick={this.handleGroup}>
                        {this.getTitle(stage)}
                    </ThGroup>
                    <ThGroup style={{ width: '100px' }}>
                        <div className="btn-group" style={{ float: 'right' }}>
                            <button
                                className={`btn btn-default ${kanbanViews[stage] ? '' : 'active'}`}
                                data-toggle="tooltip" title="List View"
                                data-replacement="auto"
                                onClick={() => this.setKanbanView(stage, false)}
                            >
                                <span className="fa fa-list" aria-hidden="true"></span>
                            </button>
                            <button
                                className={`btn btn-default ${kanbanViews[stage] ? 'active' : ''}`}
                                data-toggle="tooltip" title="Kaban View"
                                data-replacement="auto"
                                onClick={() => this.setKanbanView(stage, true)}
                            >
                                <span className="fa fa-align-left fa-rotate-90" aria-hidden="true"></span>
                            </button>
                        </div>
                    </ThGroup>
                </tr>
                {kanbanViews[stage] ? this.renderKanbanView(group, stage) : this.renderList(group)}
            </tbody>
        )
    }

    renderList = (salesRecords) => {
        const { groupBy } = this.state
        return (groupBy === GROUP_BY.SUBSTAGE)
            ? _.map(this.sortGroups(SUB_STAGES,  _.groupBy(salesRecords, GROUP_BY.SUBSTAGE)), (group, key) =>
                _.map(this.renderSubGroup(group, key), (record, index) => React.cloneElement(record, { key: index }))
            )
            : this.sortRecords(salesRecords).map(this.renderRecord)
    }

    renderKanbanView = (salesRecords, stage) => {
        const { columns } = this.state

        const isSubStage = stage !== undefined
        const kanbanColumns = isSubStage
            ? this.getSubStages(stage).map((sub) => ({id: sub.value, title: sub.label}))
            : STAGES_MAP.map((stage) => ({id: stage.value, title: stage.label}))

        return (
            <tr>
                <td colSpan={columns.length}>
                    <div className="kanban-view-container">
                        <KanbanView
                            columns={kanbanColumns}
                            salesRecords={salesRecords}
                            isSubStage={isSubStage}
                        />
                    </div>
                </td>
                <td></td>
            </tr>
        )
    }

    render() {
        const { stage, salesRecords, groupBy, ...props } = this.props
        const { keyword, columns, sort, showArchivedDeals, fixedHeader } = this.state
        const filteredRecords = this.filterRecords(salesRecords, { keyword, showArchivedDeals, stage})

        return (
            <div className="projects-page" style={{height: 'auto'}}>
                {columns.length > 0 ? <SalesRecordsNavbar
                    title={this.getTitle(stage)}
                    columns={columns}
                    toggleGroupBy={this.toggleGroupBy}
                    groupBySubstage={groupBy === GROUP_BY.SUBSTAGE}
                    toggleShowArchive={this.toggleShowArchive}
                    showArchivedDeals={showArchivedDeals}
                    handleCols={this.handleCols}
                    onChangeSearch={this.onChangeSearch}
                    modalProps={{...props, stage}}
                /> : null}
                <div ref={node => this.tableContainer = node} style={{ maxHeight: '1000rem', overflow: 'auto', position: 'relative' }} onScroll={this.handleScroll}>
                    <Table hover>
                        <SalesRecordsTableHeader columns={columns} handleSort={this.handleSort} sort={sort} fixedHeader={fixedHeader}/>
                        {_.map(this.sortGroups(STAGES_MAP.map(item => item.value), _.groupBy(filteredRecords, GROUP_BY.STAGE)), this.renderGroup)}
                    </Table>
                </div>
            </div>
        )
    }
}

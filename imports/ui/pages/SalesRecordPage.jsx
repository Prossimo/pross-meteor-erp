import { Meteor } from "meteor/meteor";
import React, { Component } from "react";
import { connect } from "react-redux";
import { Table } from "react-bootstrap";
import _ from "underscore";
import styled from "styled-components";
import store from "/imports/redux/store";
import { setParam } from "/imports/redux/actions";
import SalesRecord from "/imports/ui/components/salesRecord/SalesRecord";
import SalesRecordsNavbar from "/imports/ui/components/salesRecord/SalesRecordsNavbar";
import SalesRecordsTableHeader from "/imports/ui/components/salesRecord/SalesRecordsTableHeader";
import KanbanView from "/imports/ui/components/salesRecord/kanbanView/KanbanView";
import {
  SHIPPING_MODE_LIST,
  SUB_STAGES_LEAD,
  SUB_STAGES_OPP,
  SUB_STAGES_ORDER,
  SUB_STAGE_TICKET,
  SUB_STAGES,
  STAGES_MAP,
  STATES
} from "/imports/api/constants/project";

const subStages = [].concat(
  SUB_STAGES_LEAD,
  SUB_STAGES_OPP,
  SUB_STAGES_ORDER,
  SUB_STAGE_TICKET
);
import { DEALS } from "/imports/utils/constants";

const ThGroup = styled.th`
  vertical-align: middle;
  text-transform: uppercase;
  color: rgba(78, 217, 123, 0.7);
  cursor: pointer;
  background-color: #eeeeee;
  &:hover {
    color: rgb(78, 217, 123);
  }
`;
const ThSubGroup = styled(ThGroup)`
  color: rgba(217, 83, 78, 0.7);
  text-transform: none;
  background-color: #f9f9f9;
  &:hover {
    color: rgb(217, 83, 78);
  }
`;

class SalesRecordPage extends Component {
  state = {
    editing: null,
    fixedHeader: false
  };

  componentDidMount() {
    Meteor.call("getVisibleFields", "salesRecord", (error, columns) => {
      if (error) {
        throw new Meteor.Error(error.message);
      }
      store.dispatch(setParam("columns", columns));

      Meteor.setTimeout(() => {
        const $tableContainer = $(this.tableContainer);
        $tableContainer.css({
          "max-height": $(window).height() - $tableContainer.offset().top
        });
      }, 200);
    });
  }

  componentDidUpdate() {}

  getTitle = stage => {
    switch (stage) {
      case "lead":
        return "All Leads";
      case "opportunity":
        return "All Opportunity";
      case "order":
        return "All Orders";
      case "ticket":
        return "All Tickets";
      default:
        return "All Deals";
    }
  };

  getSubStages = stage => {
    switch (stage) {
      case "lead":
        return SUB_STAGES_LEAD;
      case "opportunity":
        return SUB_STAGES_OPP;
      case "order":
        return SUB_STAGES_ORDER;
      case "ticket":
        return SUB_STAGE_TICKET;
      default:
        return [];
    }
  };

  sortRecords = list => {
    const { sort } = this.props;
    return list.sort((a, b) => {
      return a[sort.key] < b[sort.key] ? sort.order : -1 * sort.order;
    });
  };

  setKanbanView = (key, flag) => {
    const { kanbanViews } = this.props;
    kanbanViews[key] = flag;
    store.dispatch(setParam("kanbanViews", kanbanViews));
    this.forceUpdate();
  };

  setCollapsedView = key => {
    const { collapsedViews } = this.props;
    if (key in collapsedViews) {
      collapsedViews[key] = !collapsedViews[key];
    } else {
      collapsedViews[key] = true;
    }
    store.dispatch(setParam("collapsedViews", collapsedViews));
    this.forceUpdate(); /** @todo possible its need */
  };

  sortGroups = (stages, groups) => {
    const sorted = {};
    stages.forEach(value => {
      if (groups[value]) {
        sorted[value] = groups[value];
      }
    });
    return sorted;
  };

  sortGroups = (stages, groups) => {
    const sorted = {};
    stages.forEach(value => {
      if (groups[value]) {
        sorted[value] = groups[value];
      }
    });
    return sorted;
  };

  filterRecords = (list, { stage, keyword, showArchivedDeals }) => {
    const keyfilter = new RegExp(keyword, "i");

    if (keyword || stage || showArchivedDeals) {
      return list.filter(item => {
        const byKey = !keyword || item.name.search(keyfilter) > -1;
        const byStage = !stage || item.stage == stage;
        const byArchive = !showArchivedDeals || item.archived;
        return byKey && byStage && byArchive;
      });
    } else {
      return list.filter(item => !item.archived);
    }
  };

  handleCols = columns => {
    if (columns.indexOf("name") < 0) {
      columns.unshift("name");
    }
    // this.setState({ columns })
    store.dispatch(setParam("columns", columns));
  };

  handleScroll = event => {
    const scrollTop = event.currentTarget.scrollTop;
    this.setState({
      fixedHeader: scrollTop > $("th", $(this.tableContainer)).height()
    });
    store.dispatch(setParam("scrollTop", scrollTop));
  };

  renderRecord = (record, index) => {
    const { columns } = this.props;
    const { editing } = this.state;
    return (
      <SalesRecord
        columns={columns}
        record={record}
        key={index}
        editing={editing}
        setEditField={ref => this.setState({ editing: ref })}
      />
    );
  };

  renderSubGroup = (group, key) => {
    const { columns, collapsedViews } = this.props;
    const subGroup = [];
    const substage = _.findWhere(subStages, { value: key });

    subGroup.push(
      <tr key="trSubHead">
        <ThSubGroup
          colSpan={columns.length}
          onClick={() => this.setCollapsedView(substage.value)}
        >
          {substage ? substage.label : key}
        </ThSubGroup>
        <ThSubGroup />
      </tr>
    );

    if (!collapsedViews[substage.value]) {
      this.sortRecords(group).forEach((record, index) => {
        subGroup.push(this.renderRecord(record, index));
      });
    }
    return subGroup;
  };

  renderGroup = (group, stage) => {
    const { columns, kanbanViews, collapsedViews } = this.props;
    return (
      <tbody key={stage}>
        <tr>
          <ThGroup
            colSpan={columns.length}
            onClick={() => this.setCollapsedView(stage)}
          >
            {this.getTitle(stage)}
          </ThGroup>
          <ThGroup style={{ width: "80px" }}>
            <div className="btn-group" style={{ float: "right" }}>
              <button
                className={`btn btn-default ${
                  kanbanViews[stage] ? "" : "active"
                }`}
                data-toggle="tooltip"
                title="List View"
                data-placement="left"
                data-replacement="auto"
                onClick={() => this.setKanbanView(stage, false)}
              >
                <span className="fa fa-list" aria-hidden="true" />
              </button>
              <button
                className={`btn btn-default ${
                  kanbanViews[stage] ? "active" : ""
                }`}
                data-toggle="tooltip"
                title="Kaban View"
                data-placement="left"
                data-replacement="auto"
                onClick={() => this.setKanbanView(stage, true)}
              >
                <span
                  className="fa fa-align-left fa-rotate-90"
                  aria-hidden="true"
                />
              </button>
            </div>
          </ThGroup>
        </tr>
        {!collapsedViews[stage]
          ? kanbanViews[stage]
            ? this.renderKanbanView(group, stage)
            : this.renderList(group)
          : null}
      </tbody>
    );
  };

  renderList = salesRecords => {
    return _.map(
      this.sortGroups(
        SUB_STAGES,
        _.groupBy(salesRecords, DEALS.GROUP_BY.SUBSTAGE)
      ),
      (group, key) =>
        _.map(this.renderSubGroup(group, key), (record, index) =>
          React.cloneElement(record, { key: index })
        )
    );
  };

  renderKanbanView = (salesRecords, stage) => {
    const { columns } = this.props;

    const isSubStage = stage !== undefined;
    const kanbanColumns = isSubStage
      ? this.getSubStages(stage).map(sub => ({
          id: sub.value,
          title: sub.label
        }))
      : STAGES_MAP.map(stage => ({ id: stage.value, title: stage.label }));

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
        <td />
      </tr>
    );
  };

  render() {
    const {
      stage,
      salesRecords,
      keyword,
      showArchivedDeals,
      ...props
    } = this.props;
    const { fixedHeader } = this.state;
    const filteredRecords = this.filterRecords(salesRecords, {
      keyword,
      showArchivedDeals,
      stage
    });
    return (
      <div className="projects-page" style={{ height: "auto" }}>
        <SalesRecordsNavbar
          title={this.getTitle(stage)}
          modalProps={{ ...props, stage }}
        />
        <div
          id="tableContainer"
          ref={node => (this.tableContainer = node)}
          style={{
            maxHeight: "1000rem",
            overflow: "auto",
            position: "relative"
          }}
          onScroll={this.handleScroll}
        >
          <Table hover>
            <SalesRecordsTableHeader fixedHeader={fixedHeader} />
            {_.map(
              this.sortGroups(
                STAGES_MAP.map(item => item.value),
                _.groupBy(filteredRecords, DEALS.GROUP_BY.STAGE)
              ),
              this.renderGroup
            )}
          </Table>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { dealsParams } = state;
  return {
    ...dealsParams
  };
};

export default connect(mapStateToProps)(SalesRecordPage);

/* global moment */
import { Roles } from "meteor/alanning:roles";
import React, { Component } from "react";
import PropTypes from "prop-types";
import Select from "react-select";
import { Panel, Table, Dropdown, MenuItem } from "react-bootstrap";
import { withTracker } from "meteor/react-meteor-data";
import Tasks, { TaskStatus } from "/imports/api/models/tasks/tasks";
import { getUserName } from "/imports/api/lib/filters";
import { ROLES } from "/imports/api/models";
import { CustomToggle } from "../common";
import { ClientErrorLog } from "/imports/utils/logger";

class MyTasks extends Component {
  constructor(props) {
    super();
    this.renderTasks = this.renderTasks.bind(this);

    this.state = {
      showAllTasks: false,
      showCompletedTasks: false,
      viewOption: "all",
      sort: {
        by: "dueDate",
        asc: false
      },
      dueDateOption: "all",
      userOption: "all"
    };
  }

  componentWillReceiveProps(newProps) {
    const { showCompletedTasks } = this.state;
    this.setState({
      tasks: showCompletedTasks
        ? newProps.tasks
        : newProps.tasks.filter(t => t.status !== "Complete")
    });
  }

  getTasks() {
    const {
      showCompletedTasks,
      showAllTasks,
      viewOption,
      dueDateOption,
      userOption
    } = this.state;

    let tasks = showAllTasks
      ? Tasks.find()
          .fetch()
          .filter(t => t.parent() != null)
      : this.props.tasks;

    if (!showCompletedTasks) tasks = tasks.filter(t => t.status !== "Complete");

    if (viewOption === "deal")
      tasks = tasks.filter(t => t.parent() && t.parent().type === "deal");
    else if (viewOption === "project")
      tasks = tasks.filter(t => t.parent() && t.parent().type === "project");

    if (dueDateOption === "past")
      tasks = tasks.filter(({ dueDate }) => dueDate < new Date());
    else if (dueDateOption === "today")
      tasks = tasks.filter(({ dueDate }) =>
        moment(dueDate).isSame(moment(), "day")
      );

    if (userOption === "assignee")
      tasks = tasks.filter(({ assignee }) => assignee === Meteor.userId());
    if (userOption === "approver")
      tasks = tasks.filter(({ approver }) => approver === Meteor.userId());

    return tasks;
  }

  toggleShowCompletedTasks = e => {
    const checked = e.target.checked;
    this.setState({
      showCompletedTasks: checked
    });
  };

  toggleShowAllTasks = e => {
    const checked = e.target.checked;
    this.setState({
      showAllTasks: checked
    });
  };

  getSortedData() {
    const tasks = this.getTasks();
    const { by, asc } = this.state.sort;

    const sort = () =>
      _.sortBy(tasks, t => {
        if (by === "parentId") {
          return t.parent() ? t.parent().name : "";
        } else if (by === "assignee") {
          const assignee = _.findWhere(this.props.users, { _id: t.assignee });
          const assigneeName = assignee ? getUserName(assignee) : "";
          return assigneeName;
        } else if (by === "approver") {
          const approver = _.findWhere(this.props.users, { _id: t.approver });
          const approverName = approver ? getUserName(approver) : "";
          return approverName;
        } else {
          return t[by];
        }
      });

    if (asc) {
      return sort();
    } else {
      return sort().reverse();
    }
  }

  sortBy = field => {
    const { by, asc } = this.state.sort;

    if (by == field) this.setState({ sort: { by, asc: !asc } });
    else this.setState({ sort: { by: field, asc: true } });
  };

  onMouseEnterStatus = task => {
    if (
      this.state.hoverStatusTask &&
      this.state.hoverStatusTask._id === task._id
    )
      return;

    this.setState({
      hoverStatusTask: task
    });
  };

  onMouseLeaveStatus = task => {
    this.setState({ hoverStatusTask: null });
  };

  selectStatusForTask = (task, status) => {
    if (task.status === status) return;
    task.status = status;

    Meteor.call("task.update", { ...task }, (err, res) => {
      if (err) {
        return ClientErrorLog.error(err);
      }
    });
  };

  selectViewOption = option => {
    this.setState({ viewOption: option.value });
  };

  selectDueDateOption = option => {
    this.setState({ dueDateOption: option.value });
  };

  selectUserOption = option => {
    this.setState({ userOption: option.value });
  };

  renderStatusSelector(task) {
    return (
      <Dropdown id="task-status-selector" style={{ float: "right" }} pullRight>
        <CustomToggle bsRole="toggle">
          <i className="fa fa-cog" />
        </CustomToggle>
        <Dropdown.Menu>
          {TaskStatus.map((s, i) => (
            <MenuItem
              key={`status-${i}`}
              eventKey={i}
              onSelect={() => this.selectStatusForTask(task, s)}
            >
              {s}
            </MenuItem>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    );
  }
  renderTasks() {
    const tasks = this.getSortedData();
    const { users, userId } = this.props;
    const { hoverStatusTask } = this.state;

    return tasks.map((task, index) => {
      const assignee = users.filter(u => u._id === task.assignee)[0];
      const assigneeName = assignee ? getUserName(assignee) : "";
      const approver = users.filter(u => u._id === task.approver)[0];
      const approverName = approver ? getUserName(approver) : "";
      const formatedDate = moment(task.dueDate).format("MM/DD/YYYY");
      const isOverDate = moment("MM/DD/YYYY").isBefore(formatedDate);

      return (
        <tr key={task._id}>
          <td>{index + 1}</td>
          <td>{task.name}</td>
          <td
            style={{ width: 150 }}
            onMouseEnter={() => {
              this.onMouseEnterStatus(task);
            }}
            onMouseLeave={() => {
              this.onMouseLeaveStatus(task);
            }}
          >
            {task.status}
            {hoverStatusTask &&
              hoverStatusTask._id === task._id &&
              this.renderStatusSelector(task)}
          </td>
          <td>{task.parent() && task.parent().name}</td>
          <td colSpan={2}>{task.description}</td>
          <td>{assignee && assignee._id === userId ? "You" : assigneeName}</td>
          <td>{approver && approver._id === userId ? "You" : approverName}</td>
          <td style={{ color: isOverDate ? "red" : "" }}>{formatedDate}</td>
          <td>
            <a href={`/${task.parentType}/${task.parentId}`}>View</a>
          </td>
        </tr>
      );
    });
  }

  render() {
    const { by, asc } = this.state.sort;

    const viewOptions = [
      { value: "all", label: "All" },
      { value: "deal", label: "Deal" },
      { value: "project", label: "Project" }
    ];
    const dueDateOptions = [
      { value: "all", label: "All" },
      { value: "past", label: "Past due" },
      { value: "today", label: "Due today" }
    ];
    const usersOptions = [
      { value: "all", label: "All" },
      { value: "assignee", label: "Assignee" },
      { value: "approver", label: "Approver" }
    ];

    const header = (
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1 }}>My Tasks</div>
        <div style={{ display: "flex" }}>
          {Roles.userIsInRole(Meteor.userId(), [ROLES.ADMIN]) && (
            <span>
              <input
                type="checkbox"
                value={this.state.showAllTasks}
                onChange={this.toggleShowAllTasks}
              />
              &nbsp;All tasks&nbsp;&nbsp;
            </span>
          )}
          <span>
            <input
              type="checkbox"
              value={this.state.showCompletedTasks}
              onChange={this.toggleShowCompletedTasks}
            />
            &nbsp;Completed tasks&nbsp;&nbsp;
          </span>
          <Select
            className="small-select"
            value={this.state.viewOption}
            options={viewOptions}
            onChange={this.selectViewOption}
            clearable={false}
          />
          &nbsp;
          <Select
            className="small-select"
            value={this.state.dueDateOption}
            options={dueDateOptions}
            onChange={this.selectDueDateOption}
            clearable={false}
          />
          &nbsp;
          <Select
            className="small-select"
            value={this.state.userOption}
            options={usersOptions}
            onChange={this.selectUserOption}
            clearable={false}
          />
        </div>
      </div>
    );

    const sortIcon = field => {
      if (by === field && asc)
        return <i style={{ marginLeft: 5 }} className="fa fa-caret-up" />;
      else if (by === field && !asc)
        return <i style={{ marginLeft: 5 }} className="fa fa-caret-down" />;
      else return "";
    };

    return (
      <div className="my-tasks">
        <Panel>
          <Panel.Heading>{header}</Panel.Heading>
          <Panel.Body>
            All tasks assigned from/to you.
            <Table responsive>
              <thead>
                <tr>
                  <th>#</th>
                  <th onClick={() => this.sortBy("name")}>
                    Name{sortIcon("name")}
                  </th>
                  <th onClick={() => this.sortBy("status")}>
                    Status{sortIcon("status")}
                  </th>
                  <th onClick={() => this.sortBy("parentId")}>
                    Deal/Project{sortIcon("parentId")}
                  </th>
                  <th colSpan={2}>Desciption</th>
                  <th onClick={() => this.sortBy("assignee")}>
                    Assignee{sortIcon("assignee")}
                  </th>
                  <th onClick={() => this.sortBy("approver")}>
                    Approver{sortIcon("approver")}
                  </th>
                  <th onClick={() => this.sortBy("dueDate")}>
                    DueDate{sortIcon("dueDate")}
                  </th>
                  <th />
                </tr>
              </thead>
              <tbody>{this.renderTasks()}</tbody>
            </Table>
          </Panel.Body>
        </Panel>
      </div>
    );
  }
}

export default withTracker(() => {
  const userId = Meteor.userId();
  const subscribers = [];
  let loading = true;
  let tasks = [];
  if (Roles.userIsInRole(userId, ROLES.ADMIN)) {
    subscribers.push(
      Meteor.subscribe("task.all", { parentId: null, filter: null })
    );
  } else {
    subscribers.push(Meteor.subscribe("task.byUserId"));
  }
  loading = subscribers.reduce(
    (result, subscriber) => result && subscriber.ready(),
    true
  );
  tasks = Tasks.find({ $or: [{ assignee: userId }, { approver: userId }] })
    .fetch()
    .filter(t => t.parent() != null);
  return {
    loading,
    tasks,
    userId,
    users: Meteor.users.find().fetch()
  };
})(MyTasks);

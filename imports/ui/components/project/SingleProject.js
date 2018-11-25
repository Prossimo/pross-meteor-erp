/* global FlowRouter */
import _ from "underscore";
import React, { Component } from "react";
import { FlowRouter } from "meteor/kadira:flow-router";
import { withTracker } from "meteor/react-meteor-data";
import classNames from "classnames";
import { info, warning } from "/imports/api/lib/alerts";
import { Users, Projects, People } from "/imports/api/models";
import Activities from "./Activities";
import Tasks from "../tasks/TaskBoard";
import Files from "../files/Files";
import { Panel, Selector, SlackChannelSelector } from "../common";
import Conversations from "../salesRecord/conversations/Conversations";

const projectTabs = {
  activity: {
    label: "Activity",
    component: Activities
  },
  conversations: {
    label: "Conversations",
    component: Conversations
  },
  tasks: {
    label: "Tasks",
    component: Tasks
  },
  files: {
    label: "Files",
    component: Files
  }
};

class SingleProject extends Component {
  state = {
    showPopup: false,
    popupData: null,
    selectUser: null,
    selectedCategory: [],
    selectedDesignation: null
  };

  static defaultProps = {
    tab: "activity"
  };

  onSelectMembers = members => {
    const { project } = this.props;
    const userIds = _.pluck(project.members, "userId");
    if (
      members &&
      project.members &&
      members.length == project.members.length &&
      members.every(m => userIds.indexOf(m.value) > -1)
    )
      return;

    Meteor.call(
      "updateProjectMembers",
      project._id,
      members.map(m => ({ userId: m.value, isAdmin: false })),
      (err, res) => {
        if (err) {
          console.warn(err);
          warning(err.message || err.reason);
        }
      }
    );
  };

  onSelectStakeholders = stakeholders => {
    const { project } = this.props;
    const peopleIds = _.pluck(project.stakeholders, "peopleId");
    if (
      stakeholders &&
      project.stakeholders &&
      stakeholders.length == project.stakeholders.length &&
      stakeholders.every(m => peopleIds.indexOf(m.value) > -1)
    )
      return;

    project.stakeholders = stakeholders.map(p => {
      const stakeholder = _.findWhere(project.stakeholders, {
        peopleId: p.value
      });
      if (stakeholder) return stakeholder;

      return { peopleId: p.value, isMainStakeholder: false, addToMain: true };
    });
    Meteor.call("project.update", { ...this.props.project }, (err, res) => {
      if (err) {
        console.warn(err);
        warning(err.message || err.reason);
      }
    });
  };

  setAsMainStakeholder = stakeholder => {
    const { project } = this.props;
    const { stakeholders } = project;
    stakeholders.forEach(s => {
      if (s.peopleId === stakeholder._id) {
        s.isMainStakeholder = true;
      } else {
        s.isMainStakeholder = false;
      }
    });

    project.stakeholders = stakeholders;

    Meteor.call("project.update", { ...project }, (err, res) => {
      if (err) {
        console.warn(err);
        warning(err.message || err.reason);
      }
    });
  };

  addToMain = (stakeholder, checked) => {
    const { project } = this.props;
    const { stakeholders } = project;
    stakeholders.forEach(s => {
      if (s.peopleId === stakeholder._id) {
        s.addToMain = checked;
      }
    });

    project.stakeholders = stakeholders;

    Meteor.call("project.update", { ...project }, (err, res) => {
      if (err) {
        console.warn(err);
        warning(err.message || err.reason);
      }
    });
  };

  updateSlackChannel = channel => {
    Meteor.call(
      "updateProjectSlackChannel",
      {
        _id: this.props.project._id,
        channel
      },
      (err, res) => {
        if (err) {
          console.warn(err);
          warning(err.message || err.reason);
        }
      }
    );
  };

  getTabs() {
    if (this.props.project.nylasAccountId) {
      return _.omit(projectTabs, (item, key) => key === "conversations");
    }
    return projectTabs;
  }

  renderTabs() {
    const { tab, projectId } = this.props;

    return (
      <ul>
        {_.map(this.getTabs(), (item, key) => (
          <li
            key={key}
            data-key={key}
            onClick={() =>
              FlowRouter.go("Project", { id: projectId, tabName: key })
            }
            className={classNames({ active: key === tab })}
          >
            {item.label}
          </li>
        ))}
      </ul>
    );
  }

  renderContent() {
    const { tab, ...props } = this.props;
    if (tab === "conversations") {
      props.targetId = props.projectId;
      props.targetCollection = Projects;
    }
    if (tab === "files") {
      props.type = "Project";
    }
    return React.createElement(projectTabs[tab].component, props);
  }

  renderMembers(members) {
    return (
      <div className="list">
        {members.map(m => (
          <div key={m._id} className="item">
            <div className="primary-text">{m.name()}</div>
            <div className="secondary-text">{m.email()}</div>
          </div>
        ))}
      </div>
    );
  }

  renderStakeholders(stakeholders) {
    return (
      <div className="list">
        {stakeholders.map(s => (
          <div key={s._id} className="item" style={{ display: "flex" }}>
            <div style={{ flex: 1 }}>
              <div className="primary-text">{s.name}</div>
              <div className="secondary-text">{s.email}</div>
              <div className="secondary-text">{`${s.designation}/${
                s.role
              }`}</div>
            </div>
            <div style={{ margin: "auto" }}>
              <input
                type="radio"
                checked={s.isMainStakeholder}
                onChange={() => {
                  this.setAsMainStakeholder(s);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  render() {
    if (this.props.loading) return <div>Loading ...</div>;

    const { project, tab } = this.props;

    if (!project) return <div>Could not load project</div>;

    const members = project.getMembers();
    const stakeholders = project.getStakeholders();
    return (
      <div className="page-container single-project">
        <div className="main-content">
          <div className="tab-container">
            <h2 className="page-title">{project.name}</h2>
            <div className="tab-controls">{this.renderTabs()}</div>
            <div className="tab-content">{this.renderContent()}</div>
          </div>
        </div>
        <aside className="right-sidebar">
          <div className="sidebar-box">
            <Panel
              title="Slack Channel"
              actions={
                <SlackChannelSelector
                  channel={project.slackChannel.id}
                  onSelectChannel={this.updateSlackChannel}
                />
              }
            >
              {project.slackChannel.name || project.slackChannel.id}&nbsp;
              {project.slackChannel.isPrivate && <i className="fa fa-lock" />}
            </Panel>
          </div>
          <div className="sidebar-box">
            <Panel
              title="Members"
              actions={
                <Selector
                  multiple
                  value={members.map(m => ({ value: m._id, label: m.name() }))}
                  options={Users.find().map(u => ({
                    value: u._id,
                    label: u.name()
                  }))}
                  onSelect={this.onSelectMembers}
                />
              }
            >
              {members && members.length ? (
                this.renderMembers(members)
              ) : (
                <div>There are no members assigned to this project</div>
              )}
            </Panel>
          </div>
          <div className="sidebar-box">
            <Panel
              title="Stakeholders"
              actions={
                <Selector
                  multiple
                  value={stakeholders.map(p => ({
                    value: p._id,
                    label: p.name
                  }))}
                  options={People.find().map(p => ({
                    value: p._id,
                    label: p.name
                  }))}
                  onSelect={this.onSelectStakeholders}
                />
              }
            >
              {stakeholders && stakeholders.length ? (
                this.renderStakeholders(stakeholders)
              ) : (
                <div>There are no members assigned to this project</div>
              )}
            </Panel>
          </div>
        </aside>
      </div>
    );
  }
}

export default withTracker(props => {
  const projectId = FlowRouter.getParam("id");
  const subscribers = [
    subsCache.subscribe("slackusers.all"),
    subsCache.subscribe("projects.one", projectId)
  ];

  return {
    loading: !subscribers.reduce(
      (prev, subscriber) => prev && subscriber.ready(),
      true
    ),
    project: Projects.findOne(projectId),
    projectId,
    ...props
  };
})(SingleProject);

import { Roles } from "meteor/alanning:roles";
import React, { Component } from "react";
import EditableUsersTable from "../components/admin/EditableUsersTable";
import { withTracker } from "meteor/react-meteor-data";
import { ROLES } from "/imports/api/models";

class AdminPage extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    this.props.subscribers.forEach(subscriber => subscriber.stop());
  }

  render() {
    if (Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN)) {
      return (
        <div className="page-container admin-page">
          <div className="main-content" style={{ overflowX: "hidden" }}>
            <div className="tab-container" style={{ marginTop: "-5px" }}>
              <h2 className="page-title">Admin page</h2>
              <div style={{ padding: "5px" }}>
                <EditableUsersTable createdUsers={this.props.users} />
              </div>
            </div>
          </div>
        </div>
      );
    } else {
      return <div className="text-center">Access Denied</div>;
    }
  }
}

export default withTracker(() => {
  const subscribers = [];
  let users = [];
  subscribers.push(Meteor.subscribe("users.all"));

  if (Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN)) {
    users = Meteor.users.find({ username: { $ne: "root" } }).fetch();
  }
  return {
    subscribers,
    loading: !subscribers.reduce(
      (prev, subscriber) => prev && subscriber.ready(),
      true
    ),
    users
  };
})(AdminPage);

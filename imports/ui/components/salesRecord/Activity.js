import React from "react";
import PropTypes from "prop-types";
import { FlowRouter } from "meteor/kadira:flow-router";
import Message from "./Message";
import { getUserName } from "../../../api/lib/filters";

class Activity extends React.Component {
  constructor(props) {
    super(props);
  }

  getMessageList() {
    const { users } = this.props;
    if (!this.props.messages.length) {
      return (
        <div className="massage-list">
          <p>No Activity yet</p>
        </div>
      );
    }
    const activityList = this.props.messages.map(item => {
      switch (item.type) {
        case "message":
          {
            return <Message key={item._id} message={item} />;
          }
          break;
        case "event":
          {
            return (
              <li key={item._id} className="event-message">
                {getUserName(item.author, true)}
                {item.name} at
                {moment(item.createAt).format("h:mm, MMMM Do YYYY")}
              </li>
            );
          }
          break;
        default:
          return null;
      }
    });
    return (
      <div className="massage-list">
        <ul>{activityList}</ul>
      </div>
    );
  }

  render() {
    return <div className="activity">{this.getMessageList()}</div>;
  }
}

export default Activity;

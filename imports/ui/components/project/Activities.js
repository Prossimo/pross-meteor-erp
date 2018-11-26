import React, { Component } from "react";
import moment from "moment";
import { withTracker } from "meteor/react-meteor-data";
import SlackMessages from "/imports/api/models/slackMessages/slackMessages";
import Projects from "/imports/api/models/projects/projects";
import Message from "../salesRecord/Message";
import { getUserName } from "../../../api/lib/filters";

class Activities extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmout() {
    this.props.subscribers.forEach(sub => sub.stop());
  }

  getMessagesList() {
    if (!this.props.messages.length) {
      return (
        <div className="massage-list">
          <p>No Activity yet</p>
        </div>
      );
    }

    const activityList = this.props.messages.map(item => {
      switch (item.type) {
        case "message": {
          return <Message key={item._id} message={item} />;
        }

        case "event": {
          return (
            <li key={item._id} className="event-message">
              {getUserName(item.author, true)}
              {item.name} at
              {moment(item.createAt).format("h:mm, MMMM Do YYYY")}
            </li>
          );
        }

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
    return <div className="activity">{this.getMessagesList()}</div>;
  }
}

export default withTracker(props => {
  const { projectId } = props;
  const subscribers = [];
  subscribers.push(Meteor.subscribe("projects.one", projectId));
  subscribers.push(Meteor.subscribe("projects.slackMessages", projectId));
  const { slackChannel } = Projects.findOne(projectId);
  return {
    messages: SlackMessages.find(
      { channel: slackChannel.id },
      { sort: { createAt: -1 } }
    ).fetch(),
    subscribers
  };
})(Activities);

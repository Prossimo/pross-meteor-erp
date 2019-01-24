import { Roles } from "meteor/alanning:roles";
import React from "react";
import PropTypes from "prop-types";
import { ROLES } from "/imports/api/models";
import { Tabs, Tab, Modal } from "react-bootstrap";
import TrackerReact from "meteor/ultimatejs:tracker-react";
import swal from "sweetalert2";
import Conversation from "./Conversation";
import {
  Conversations as ConversationsModel,
  SalesRecords,
  Projects
} from "/imports/api/models";
import ConversationForm from "./ConversationForm";
import { removeConversation } from "/imports/api/models/conversations/methods";

export default class Conversations extends TrackerReact(React.Component) {
  static propTypes = {
    targetCollection: PropTypes.oneOf([SalesRecords, Projects]).isRequired,
    targetId: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      key: 0
    };
  }

  handleSelect = key => {
    if (key == -1) {
      this.setState({ showModal: true });
    } else {
      this.setState({ key });
    }
  };

  deleteConversation = c => {
    swal({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      type: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then(() => {
      try {
        removeConversation.call({ _id: c._id });
      } catch (e) {
        console.error(e);
      }
    });
  };

  render() {
    const { targetCollection, targetId } = this.props;
    const target = targetCollection.findOne({ _id: targetId });

    const conversations = ConversationsModel.find({
      _id: { $in: target.conversationIds || [] }
    }).fetch();

    const tabTitleNode = c => {
      if (
        c.name !== "Main" &&
        (Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN) ||
          c.owner === Meteor.userId())
      ) {
        return (
          <div className="delete-conversation-wrapper">
            {c.name}
            <i
              className="fa fa-close"
              onClick={() => this.deleteConversation(c)}
            />
          </div>
        );
      } else {
        return c.name;
      }
    };

    return (
      <div className="conversations">
        <Tabs
          id="conversation-tab-container"
          activeKey={this.state.key}
          onSelect={this.handleSelect}
          style={{ height: "100%" }}
        >
          {conversations.map((c, i) => (
            <Tab
              key={`tab-${c._id}`}
              eventKey={i}
              title={tabTitleNode(c)}
              style={{ height: "100%" }}
            >
              {this.state.key === i ? (
                <Conversation
                  targetCollection={targetCollection}
                  targetId={targetId}
                  conversationId={c._id}
                  onlyStakeholders={targetCollection == SalesRecords && i == 0}
                />
              ) : (
                <div>&nbsp;</div>
              )}
            </Tab>
          ))}
          <Tab eventKey={-1} title="+" style={{ height: "100%" }} />
          {this.renderModal()}
        </Tabs>
      </div>
    );
  }

  renderModal() {
    const { showModal } = this.state;

    return (
      <Modal
        show={showModal}
        onHide={() => {
          this.setState({ showModal: false });
        }}
        bsSize="large"
      >
        <Modal.Header closeButton>
          <Modal.Title>Add conversation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ConversationForm
            targetCollection={this.props.targetCollection}
            targetId={this.props.targetId}
            onSaved={() => this.setState({ showModal: false })}
          />
        </Modal.Body>
      </Modal>
    );
  }
}

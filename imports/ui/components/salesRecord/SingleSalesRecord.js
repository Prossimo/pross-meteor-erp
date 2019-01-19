/* global FlowRouter */
import { Roles } from "meteor/alanning:roles";
import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import swal from "sweetalert2";
import store from "/imports/redux/store";
import { setParam } from "/imports/redux/actions";
import { info, warning } from "/imports/api/lib/alerts";
import ContactStore from "../../../api/nylas/contact-store";
import Select from "react-select";
//import ScrollPosition from "../utils/ScrollPosition";
import {
  ROLES,
  Users,
  PeopleDesignations,
  People,
  SalesRecords,
  ClientStatus,
  SupplierStatus
} from "/imports/api/models";
import Popup from "../popup/Popup";
import ContactInfo from "../account/ContactInfo";
import QuotesComponent from "./Quotes";
import Details from "./Details";
import Activity from "./Activity";
import Tasks from "../tasks/TaskBoard";
import FilesComponent from "../files/Files";
import Conversations from "./conversations/Conversations";
import { Modal } from "react-bootstrap";
import { withTracker } from "meteor/react-meteor-data";
import { Panel, SlackChannelSelector, Selector } from "../common";
import SelectSubStage from "./components/SelectSubStage";
import Spinner from "../utils/spinner";
import { ClientErrorLog } from "/imports/utils/logger";
import ClientStatusForm from "./components/ClientStatusForm";
import SupplierStatusForm from "./components/SupplierStatusForm";

class SingleSalesRecord extends React.Component {
  constructor(props) {
    super(props);

    this.mainContentRef = React.createRef();

    this.memberTypeOptions = [
      { label: "Add Team Member", value: "member" },
      { label: "Add Stakeholder", value: "stakeholder" }
    ];

    this.stageOptions = [
      { label: "Lead", value: "lead" },
      { label: "Opportunity", value: "opportunity" },
      { label: "Order", value: "order" },
      { label: "Ticket", value: "ticket" }
    ];

    const salesRecordId = FlowRouter.getParam("id");
    this.state = {
      activeTab: null,
      showPopup: false,
      popupTitle: "",
      popupData: null,
      member: {
        selectedUser: null,
        selectedCategory: []
      },
      newStakeholder: {
        selectedPerson: null,
        addToMain: false
      },
      memberType: this.memberTypeOptions[0],
      selectedMembers: [],

      showClientStatusModal: false,
      showSupplierStatusModal: false
    };

    this.renderPeople = this.renderPeople.bind(this);
    this.addStakeholder = this.addStakeholder.bind(this);
    this.showContactInfo = this.showContactInfo.bind(this);
    this.removeMember = this.removeMember.bind(this);
    this.removeStakeholder = this.removeStakeholder.bind(this);
    this.changeStage = this.changeStage.bind(this);
    this.addMemberToState = this.addMemberToState.bind(this);
    /*
     * should not publish all contact to client
     * because searching in contact causes lag in UI, index contact list to provide quick search
     * */
    this.contacts = {};
    ContactStore.getContacts(1).forEach(contact => {
      this.contacts[contact._id] = contact;
    });
  }

  componentDidMount() {
    Meteor.call("getSlackUsers");
  }

  toggleTab(activeTab) {
    this.setState({ activeTab });
  }

  getTabs() {
    this.tabs = [
      {
        label: "Details",
        component: <Details />
      },
      {
        label: "Activity",
        component: <Activity />
      },
      {
        label: "Quotes",
        component: <QuotesComponent />
      },
      {
        label: "Conversations",
        component: (
          <Conversations
            targetCollection={SalesRecords}
            targetId={this.props.salesRecord._id}
          />
        )
      },
      {
        label: "Files",
        component: <FilesComponent type="salesRecord" />
      },
      {
        label: "Tasks",
        component: (
          <Tasks tabName="Tasks" projectId={this.props.salesRecord._id} />
        )
      },
      {
        label: "Orders",
        component: (
          <Tasks tabName="Orders" projectId={this.props.salesRecord._id} />
        )
      },
      {
        label: "Bills",
        component: (
          <Tasks tabName="Bills" projectId={this.props.salesRecord._id} />
        )
      },
      {
        label: "Invoices",
        component: (
          <Tasks tabName="Invoices" projectId={this.props.salesRecord._id} />
        )
      },
      {
        label: "Shipments",
        component: (
          <Tasks tabName="Shipments" projectId={this.props.salesRecord._id} />
        )
      },
      {
        label: "Tickets",
        component: (
          <Tasks tabName="Tickets" projectId={this.props.salesRecord._id} />
        )
      }
    ];

    let { activeTab } = this.state;

    if (!activeTab) activeTab = this.tabs.find(tab => tab.label === "Details");
    return (
      <ul>
        {this.tabs.map(item => (
          <li
            key={item.label}
            onClick={this.toggleTab.bind(this, item)}
            className={classNames({ active: item.label === activeTab.label })}
          >
            {item.label}
          </li>
        ))}
      </ul>
    );
  }

  getContent() {
    let { activeTab } = this.state;
    if (!activeTab) activeTab = this.tabs.find(tab => tab.label === "Details");
    if (activeTab.component) {
      return React.cloneElement(activeTab.component, this.props);
    } else {
      return activeTab.content;
    }
  }

  removeStakeholder(salesRecordId, peopleId, event) {
    event.preventDefault();
    Meteor.call(
      "removeStakeholderFromSalesRecord",
      salesRecordId,
      peopleId,
      (error, result) => {
        if (error)
          return warning(
            error.reason ? error.reason : "remove stakeholder failed!"
          );
        info("remove stakeholder success!");
      }
    );
  }

  renderPeople(user) {
    return (
      <ul className="project-members">
        {this.props.stakeholders.map(people => {
          const { _id, emails, name, role, designation } = people;
          if (designation && designation.name !== user.designation) return "";
          const emailString = (emails || []).map(({ email }) => email).join("");
          const nameString = emailString ? `${name}(${emailString})` : name;
          return (
            <li key={_id} className="member-list">
              {Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN) ? (
                <a
                  href="#"
                  style={{ top: "10px", right: "10px", position: "relative" }}
                  onClick={event =>
                    this.removeStakeholder(
                      this.props.salesRecord._id,
                      _id,
                      event
                    )
                  }
                >
                  <span className="fa fa-times pull-right" />
                </a>
              ) : (
                ""
              )}
              <span
                className="memberName"
                onClick={() => this.showContactInfo(name, emailString)}
              >
                {nameString}
              </span>
              <div>
                {
                  <span className="member-cat" key={role}>
                    {role}
                  </span>
                }
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

  removeMember(salesRecordId, userId, event) {
    event.preventDefault();
    Meteor.call(
      "removeMemberFromSalesRecord",
      salesRecordId,
      userId,
      (error, result) => {
        if (error)
          return warning(error.reason ? error.reason : "remove member failed!");
        info("remove member success!");
      }
    );
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

  renderDealer(dealer) {
    return (
      <div className="list">
        <div className="item">
          <div className="primary-text">{dealer.name}</div>
          <div className="secondary-text">{dealer.defaultEmail()}</div>
        </div>
      </div>
    );
  }

  changeStage(salesRecordId, item) {
    if (item) {
      Meteor.call(
        "changeStageOfSalesRecord",
        salesRecordId,
        item.value,
        error => {
          if (error)
            return warning(
              error.reason ? error.reason : "Change stage failed!"
            );
          info("Change stage sucess");
        }
      );
    }
  }

  changeSubStage(salesRecordId, item) {
    if (item) {
      Meteor.call(
        "changeSubStageOfSalesRecord",
        salesRecordId,
        item.value,
        error => {
          if (error)
            return warning(
              error.reason ? error.reason : "Change sub stage failed!"
            );
          info("Change sub stage sucess");
        }
      );
    }
  }

  changeNewStakeholder = item => {
    this.setState({
      newStakeholder: {
        selectedPerson: item,
        addToMain: item.designation && item.designation.name === "Stakeholder"
      }
    });
  };
  changeNewStakeholderAddToMain = checked => {
    const {
      newStakeholder: { selectedPerson }
    } = this.state;
    this.setState({ newStakeholder: { selectedPerson, addToMain: checked } });
  };

  renderAddStakeholderForm() {
    const {
      newStakeholder: { selectedPerson, addToMain }
    } = this.state;
    const peopleOptions = this.props.candidateStakeholders.map(p => {
      const designation = p.designation();
      return { value: p._id, label: p.name, designation };
    });
    if (
      Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN) ||
      this.props.salesRecord.members.indexOf(Meteor.userId()) > -1
    ) {
      return (
        <div className="form">
          <div className="form-group">
            <Select
              value={selectedPerson}
              placeholder="Choose a person..."
              onChange={item => this.changeNewStakeholder(item)}
              options={peopleOptions}
              className={"members-select"}
              clearable={false}
            />
          </div>
          <div className="checkbox">
            <label>
              <input
                type="checkbox"
                value=""
                checked={addToMain}
                onChange={event =>
                  this.changeNewStakeholderAddToMain(event.target.checked)
                }
                disabled={
                  !(
                    selectedPerson &&
                    selectedPerson.designation &&
                    selectedPerson.designation.name === "Stakeholder"
                  )
                }
              />
              Add To Main
            </label>
          </div>
          <button onClick={this.addStakeholder} className="btnn primary-btn">
            Add People
          </button>
        </div>
      );
    }
  }

  addMemberToState(userId) {
    const { selectedMembers } = this.state;
    const index = selectedMembers.indexOf(userId);
    if (index > -1) {
      selectedMembers.splice(index, 1);
    } else {
      selectedMembers.push(userId);
    }
    this.setState({ selectedMembers });
  }

  addStakeholder() {
    const {
      newStakeholder: { selectedPerson, addToMain }
    } = this.state;
    const { salesRecord } = this.props;
    if (!selectedPerson) return warning("Choose stakeholder");

    Meteor.call(
      "addStakeholderToSalesRecord",
      {
        _id: salesRecord._id,
        peopleId: selectedPerson.value,
        addToMain
      },
      (error, result) => {
        if (error) {
          console.error(error);
          return warning(
            error.reason ? error.reason : "Add stakeholder failed!"
          );
        }
        this.setState({
          newStakeholder: {
            addToMain: false,
            selectedPerson: null
          }
        });
        info("Add stakeholder to salesRecord success!");
      }
    );
  }

  onSelectMembers = members => {
    const { salesRecord } = this.props;
    // console.log("members===", members);
    if (
      members &&
      salesRecord.members &&
      members.length == salesRecord.members.length &&
      members.every(m => salesRecord.members.indexOf(m.value) > -1)
    )
      return;

    Meteor.call(
      "updateSalesRecordMembers",
      salesRecord._id,
      members.map(m => m.value),
      err => {
        if (err) return ClientErrorLog.error(err);
      }
    );
  };

  onSelectDealer = dealerItem => {
    const { salesRecord } = this.props;
    const dealer = dealerItem ? dealerItem.value : null;
    if (salesRecord.dealer === dealer) return;

    Meteor.call("updateSalesRecordDealer", salesRecord._id, dealer, err => {
      if (err) return ClientErrorLog.error(err);
    });
  };

  hidePopup() {
    this.setState({ showPopup: false, popupData: null });
  }

  showUserInfo(user) {
    this.setState({
      showPopup: true,
      popupTitle: "Team Member Info",
      popupData: (
        <ContactInfo
          user={user}
          hide={this.hidePopup.bind(this)}
          editable={Roles.userIsInRole(Meteor.userId(), ROLES.ADMIN)}
        />
      )
    });
  }

  showContactInfo(name, email) {
    this.setState({
      showPopup: true,
      popupTitle: "Stakeholder Info",
      popupData: (
        <div>
          <div className="form-group">
            <label>Name</label>
            <p style={{ overflow: "auto" }}>{name}</p>
          </div>
          <div className="form-group">
            <label>Email</label>
            <p style={{ overflow: "auto" }}>{email}</p>
          </div>
        </div>
      )
    });
  }

  updateSlackChannel = channel => {
    Meteor.call(
      "updateSalesRecordSlackChannel",
      {
        _id: this.props.salesRecord._id,
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

  onChangeTeamLead = option => {
    const { salesRecord } = this.props;

    if (salesRecord.teamLead != option.value) {
      this.updateSalesRecordStatus({ teamLead: option.value });
    }
  };

  onChangeClientStatus = option => {
    const { salesRecord } = this.props;

    if (option.value === "add_new") {
      this.setState({ showClientStatusModal: true });
      return;
    }

    if (salesRecord.clientStatus != option.value) {
      this.updateSalesRecordStatus({ clientStatus: option.value });
    }
  };

  onChangeSupplierStatus = option => {
    const { salesRecord } = this.props;

    if (option.value === "add_new") {
      this.setState({ showSupplierStatusModal: true });
      return;
    }

    if (salesRecord.supplierStatus != option.value) {
      this.updateSalesRecordStatus({ supplierStatus: option.value });
    }
  };

  onSavedClientStatus = () => {
    this.setState({ showClientStatusModal: false });
  };

  onSavedSupplierStatus = () => {
    this.setState({ showSupplierStatusModal: false });
  };

  updateSalesRecordStatus(data = {}) {
    const { salesRecord } = this.props;

    if (!salesRecord) return;

    Meteor.call("updateSalesRecordStatus", salesRecord._id, data, err => {
      if (err) {
        ClientErrorLog.error(err);
        swal(
          "Update status error",
          err.reason ? err.reason : err.message,
          "warning"
        );
      }
    });
  }

  renderPopup() {
    const { popupData, showPopup, popupTitle } = this.state;
    return (
      <Popup
        active={showPopup}
        title={popupTitle}
        hide={this.hidePopup.bind(this)}
        content={popupData}
      />
    );
  }

  renderClientStatusModal() {
    const { showClientStatusModal } = this.state;

    return (
      <Modal
        show={showClientStatusModal}
        bsSize="small"
        onHide={() => {
          this.setState({ showClientStatusModal: false });
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add new client status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ClientStatusForm onSaved={this.onSavedClientStatus} />
        </Modal.Body>
      </Modal>
    );
  }

  renderSupplierStatusModal() {
    const { showSupplierStatusModal } = this.state;

    return (
      <Modal
        show={showSupplierStatusModal}
        bsSize="small"
        onHide={() => {
          this.setState({ showSupplierStatusModal: false });
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add new supplier status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <SupplierStatusForm onSaved={this.onSavedSupplierStatus} />
        </Modal.Body>
      </Modal>
    );
  }

  render() {
    if (this.props.loading) return <Spinner visible={true} />;

    const { salesRecord } = this.props;
    const defaultStage = this.stageOptions.find(
      ({ value }) => value === salesRecord.stage
    );

    const members = salesRecord.getMembers();
    const dealer = salesRecord.getDealer();
    const dealers = People.find()
      .fetch()
      .filter(p => {
        const designation = p.designation();
        return designation && designation.name === "Dealer";
      });

    const clientStatusOptions = ClientStatus.find()
      .map(s => ({
        value: s._id,
        label: s.name
      }))
      .concat([{ value: "add_new", label: "+ New Status" }]);
    const supplierStatusOptions = SupplierStatus.find()
      .map(s => ({
        value: s._id,
        label: s.name
      }))
      .concat([{ value: "add_new", label: "+ New Status" }]);

    return (
      <div className="page-container single-project">
        {this.renderPopup()}
        {this.renderClientStatusModal()}
        {this.renderSupplierStatusModal()}
        {/* <ScrollPosition elName="Deal"> */}
        <div className="main-content">
          {/* <div className="tab-container"> */}
          <div className="page-title row">
            <div className="col-md-4">
              <h2>{salesRecord.name}</h2>
            </div>
            <div className="col-md-8 flex">
              <div className="header-field-container" style={{ flex: 1 }}>
                <div className="label">Team Lead:</div>
                <div className="value">
                  <Select
                    value={salesRecord.teamLead}
                    options={salesRecord.getMembers().map(m => ({
                      value: m._id,
                      label: m.name()
                    }))}
                    clearable={false}
                    onChange={this.onChangeTeamLead}
                  />
                </div>
              </div>
              <div className="header-field-container" style={{ flex: 1.2 }}>
                <div className="label">Client Status:</div>
                <div className="value">
                  <Select
                    value={salesRecord.clientStatus}
                    options={clientStatusOptions}
                    clearable={false}
                    onChange={this.onChangeClientStatus}
                  />
                </div>
              </div>
              <div className="header-field-container" style={{ flex: 1.2 }}>
                <div className="label">Supplier Status:</div>
                <div className="value">
                  <Select
                    value={salesRecord.supplierStatus}
                    options={supplierStatusOptions}
                    clearable={false}
                    onChange={this.onChangeSupplierStatus}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="tab-controls">
            <div className="tab-container flex-2">{this.getTabs()}</div>
          </div>
          <div className="tab-content tab-container">{this.getContent()}</div>
          {/* </div> */}
        </div>
        {/* </ScrollPosition> */}
        <aside className="right-sidebar" style={{ overflow: "auto" }}>
          <div className="sidebar-box">
            <Panel
              title="Slack Channel"
              actions={
                <SlackChannelSelector
                  channel={salesRecord.slackChannel.id}
                  onSelectChannel={this.updateSlackChannel}
                />
              }
            >
              {salesRecord.slackChannel.name || salesRecord.slackChannel.id}
              &nbsp;
              {salesRecord.slackChannel.isPrivate && (
                <i className="fa fa-lock" />
              )}
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
              title="Dealer"
              actions={
                <Selector
                  value={dealer && { value: dealer._id, label: dealer.name }}
                  options={dealers.map(d => ({ value: d._id, label: d.name }))}
                  onSelect={this.onSelectDealer}
                />
              }
            >
              {dealer ? (
                this.renderDealer(dealer)
              ) : (
                <div>Dealer is not set yet.</div>
              )}
            </Panel>
          </div>
          <div className="sidebar-box">
            <div>{this.renderAddStakeholderForm()}</div>
          </div>
          {this.props.designations.map(d => {
            const existPeople = this.props.stakeholders.filter(
              stake => stake.designation && stake.designation.name === d.name
            );
            if (_.isEmpty(existPeople)) return "";
            return (
              <div key={d._id}>
                <h4>{d.name}</h4>
                <div className="sidebar-box">
                  {this.renderPeople({ designation: d.name })}
                </div>
              </div>
            );
          })}
        </aside>
      </div>
    );
  }
}

export default withTracker(props => {
  const _id = FlowRouter.getParam("id");
  if (
    subsCache.subscribe("salesrecords.one", _id).ready() &&
    subsCache.subscribe("slackusers.all")
  ) {
    const salesRecord = SalesRecords.findOne(_id);
    if (!salesRecord)
      return {
        notFound: true
      };

    salesRecord.members = salesRecord.members
      .filter(m => m !== null)
      .map(member => {
        member.user = props.usersArr[member];
        return member;
      });

    const shippingContactPerson = People.findOne(
      salesRecord.shippingContactPersonId
    );
    if (shippingContactPerson) {
      salesRecord.shippingContactEmail = shippingContactPerson.defaultEmail();
      salesRecord.shippingContactPhone = shippingContactPerson.defaultPhoneNumber();
    }

    const billingContactPerson = People.findOne(
      salesRecord.billingContactPersonId
    );
    if (billingContactPerson) {
      salesRecord.billingContactEmail = billingContactPerson.defaultEmail();
      salesRecord.billingContactPhone = billingContactPerson.defaultPhoneNumber();
    }

    const peopleIds = salesRecord.stakeholders.map(({ peopleId }) => peopleId);
    const stakeholders = People.find({ _id: { $in: peopleIds } })
      .fetch()
      .map(p => {
        p.designation = PeopleDesignations.findOne(p.designation_id);
        return p;
      });
    const candidateStakeholders = People.find({
      _id: { $nin: peopleIds }
    }).fetch();
    const designations = PeopleDesignations.find().fetch();
    return {
      loading: false,
      designations,
      stakeholders,
      candidateStakeholders,
      messages: salesRecord.slackActivities(),
      salesRecord,
      quotes: salesRecord.quotes()
    };
  } else {
    return {
      loading: true
    };
  }
})(SingleSalesRecord);

import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab, PanelGroup, Panel, Button, Col } from "react-bootstrap";
import { Users } from "/imports/api/models";
import AccountStore from "../../api/nylas/account-store";
import Actions from "../../api/nylas/actions";
import AccountSettingForm from "../components/inbox/AccountSettingForm";
import NylasSigninForm from "../components/inbox/NylasSigninForm";
import { warning } from "/imports/api/lib/alerts";
import TemplatesView from "../components/mailtemplates/TemplatesView";
import { Selector } from "../components/common";

export default class InboxSettingsPage extends React.Component {
  static propTypes = {};

  constructor(props) {
    super(props);

    this.state = {
      addingIndividualInbox: false,
      addingTeamInbox: false,
      accounts: AccountStore.accounts()
    };
  }

  componentDidMount() {
    this.unsubscribes = [];
    this.unsubscribes.push(AccountStore.listen(this.onAccountStoreChanged));
  }

  componentWillUnmount() {
    if (this.unsubscribes) {
      this.unsubscribes.forEach(unsubscribe => {
        unsubscribe();
      });
    }
  }

  onAccountStoreChanged = () => {
    this.setState({ accounts: AccountStore.accounts() });
  };

  onSelectTeamMembers = (account, members) => {
    Meteor.call(
      "updateNylasAccountTeamMembers",
      account._id,
      members.map(({ value }) => value),
      (err, res) => {
        if (err) warning(err.reason);
      }
    );
  };

  render() {
    return (
      <div className="inbox-settings-page">
        <Tabs
          defaultActiveKey={1}
          id="inbox-settings-tab"
          style={{ height: "100%" }}
        >
          <Tab eventKey={1} title="Inboxes" style={{ height: "100%" }}>
            {this.renderInboxesTab()}
          </Tab>
          <Tab eventKey={2} title="Templates" style={{ height: "100%" }}>
            {this.renderTemplatesTab()}
          </Tab>
        </Tabs>
      </div>
    );
  }

  renderInboxesTab() {
    return (
      <PanelGroup id="inboxesTab" style={{ height: "100%" }}>
        {Meteor.user().isAdmin() && (
          <Panel>
            <Panel.Heading>Team Inboxes</Panel.Heading>
            <Panel.Body>{this.renderInboxesComponent(true)}</Panel.Body>
          </Panel>
        )}
        <Panel>
          <Panel.Heading>Individual Inboxes</Panel.Heading>
          <Panel.Body>{this.renderInboxesComponent()}</Panel.Body>
        </Panel>
      </PanelGroup>
    );
  }

  renderInboxesComponent = (isTeamAccount = false) => {
    const accounts = this.state.accounts.filter(
      account => account.isTeamAccount == isTeamAccount
    );

    const { addingIndividualInbox, addingTeamInbox } = this.state;
    if (
      (addingIndividualInbox && !isTeamAccount) ||
      (addingTeamInbox && isTeamAccount)
    ) {
      return (
        <NylasSigninForm
          isAddingTeamInbox={isTeamAccount}
          onCancel={() =>
            isTeamAccount
              ? this.setState({ addingTeamInbox: false })
              : this.setState({ addingIndividualInbox: false })
          }
          onCompleted={() =>
            isTeamAccount
              ? this.setState({ addingTeamInbox: false })
              : this.setState({ addingIndividualInbox: false })
          }
        />
      );
    } else {
      return (
        <div style={{ padding: 10, backgroundColor: "white" }}>
          <div className="toolbar-panel">
            <div style={{ flex: 1 }}>
              <Button
                bsStyle="primary"
                onClick={() =>
                  isTeamAccount
                    ? this.setState({ addingTeamInbox: true })
                    : this.setState({ addingIndividualInbox: true })
                }
              >
                Add an inbox
              </Button>
            </div>
          </div>
          {accounts.map(account => {
            const header = (
              <div style={{ display: "flex" }}>
                <div style={{ flex: 1 }}>{account.emailAddress}</div>
                <div>
                  {isTeamAccount && (
                    <Selector
                      multiple
                      triggerEl={<i className="fa fa-user" />}
                      value={(account.getTeamMembers() || []).map(m => ({
                        value: m._id,
                        label: m.name()
                      }))}
                      options={Users.find().map(u => ({
                        value: u._id,
                        label: u.name()
                      }))}
                      onSelect={members =>
                        this.onSelectTeamMembers(account, members)
                      }
                    />
                  )}
                  &nbsp;
                  <Button
                    bsStyle="danger"
                    bsSize="xsmall"
                    onClick={() => this.onClickRemoveAccount(account)}
                  >
                    <i className="fa fa-trash" />
                  </Button>
                </div>
              </div>
            );

            return (
              <Col md={6} key={account._id}>
                <Panel>
                  <Panel.Heading>{header}</Panel.Heading>
                  <Panel.Body>
                    <AccountSettingForm account={account} />
                  </Panel.Body>
                </Panel>
              </Col>
            );
          })}
        </div>
      );
    }
  };

  onClickRemoveAccount = account => {
    if (confirm(`Are you sure to remove ${account.emailAddress}?`)) {
      Meteor.call("removeNylasAccount", account, (err, res) => {
        if (err) {
          console.log(err);
          return warning(err.message);
        }

        Actions.changedAccounts();
      });
    }
  };

  renderTemplatesTab() {
    return <TemplatesView />;
  }
}

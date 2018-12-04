import React from "react";
import classNames from "classnames";
//import PropTypes from "prop-types";
import MyTasks from "../components/dashboard/MyTasks";
import { Panel, Table, Dropdown, MenuItem } from "react-bootstrap";

class DashboardPage extends React.Component {
  constructor(props) {
    super(props);
    this.tabs = [
      {
        label: "My Tasks",
        component: <MyTasks tabName="Tasks" />
      },
      {
        label: "My Orders",
        component: <MyTasks tabName="Orders" />
      },
      {
        label: "My Bills",
        component: <MyTasks tabName="Bills" />
      },
      {
        label: "My Invoices",
        component: <MyTasks tabName="Invoices" />
      },
      {
        label: "My Shipments",
        component: <MyTasks tabName="Shipments" />
      },
      {
        label: "My Tickets",
        component: <MyTasks tabName="Tickets" />
      }
    ];
    this.state = {
      activeTab: this.tabs[0]
    };
  }

  toggleTab(activeTab) {
    this.setState({ activeTab });
  }

  renderTabs() {
    const { activeTab } = this.state;
    return (
      <ul>
        {this.tabs.map(item => (
          <li
            key={item.label}
            onClick={this.toggleTab.bind(this, item)}
            className={classNames({ active: item === activeTab })}
          >
            {item.label}
          </li>
        ))}
      </ul>
    );
  }

  renderContent() {
    const { activeTab, keyword } = this.state;
    if (!activeTab.component) return null;
    return React.cloneElement(activeTab.component, { ...this.props, keyword });
  }

  render() {
    return (
      <div className="dashboard-page page-container">
        <div className="tab-container">
          <h3>Dashboard</h3>
          <hr />
          <div className="tab-controls flex">
            <div className="flex-2 my-tasks">
              <Panel>
                <Panel.Heading>{this.renderTabs()}</Panel.Heading>
              </Panel>
            </div>
          </div>
          <div className="tab-content">{this.renderContent()}</div>
        </div>
      </div>
    );
  }
}
export default DashboardPage;

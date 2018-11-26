import React, { Component } from "react";
import classNames from "classnames";
import AllProjects from "../components/project/AllProjects";
import CreateProject from "/imports/ui/components/project/CreateProject";
import { SearchInput } from "../components/common";

export default class ProjectsPage extends Component {
  constructor(props) {
    super(props);
    this.tabs = [
      {
        label: "All Projects",
        component: <AllProjects />
      },
      {
        label: "Add Project",
        component: <CreateProject />
      }
    ];
    this.state = {
      activeTab: this.tabs[0]
    };
  }

  toggleTab(activeTab) {
    this.setState({ activeTab });
  }

  onChangeSearch = keyword => {
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    this.searchTimeout = setTimeout(() => {
      this.setState({ keyword });
    }, 500);
  };

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

  renderSearchBox() {
    const { keyword } = this.state;
    if (this.state.activeTab.label === "Add Project") return null;

    return (
      <div>
        <SearchInput onChange={this.onChangeSearch} value={keyword} />
      </div>
    );
  }

  render() {
    return (
      <div className="projects-page">
        <div className="tab-container">
          <div className="tab-controls flex">
            <div className="flex-2">{this.renderTabs()}</div>
            <div className="flex-1">{this.renderSearchBox()}</div>
          </div>
          <div className="tab-content">{this.renderContent()}</div>
        </div>
      </div>
    );
  }
}

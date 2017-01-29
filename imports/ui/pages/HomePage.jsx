import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames from 'classnames';

import Activity from '../components/home/Activity';

class HomePage extends React.Component{
    constructor(props){
        super(props);

        this.tabs = [
            {
                label: "Activity",
                content: <Activity/>
            },
            {
                label: "Quotes",
                content: <p>Quotes</p>
            },
            {
                label: "Details",
                content: <p>Details</p>
            },
            {
                label: "Invoices",
                content: <p>Invoices</p>
            },
            {
                label: "Documents",
                content: <p>Documents</p>
            }
        ];

        let asidePined = false;
        if(localStorage.getItem("asidePined") === "true"){
            asidePined = true;
        }

        this.state = {
            asideActive: asidePined,
            asidePined,
            activeTab: this.tabs[0]
        }
    }

    toggleAside(res){
        const { asidePined } = this.state;
        if(!asidePined){
            this.setState({asideActive: res})
        }
    }

    togglePinned(){
        const { asidePined } = this.state;
        this.setState({asidePined: !asidePined});
        localStorage.setItem("asidePined", !asidePined);
    }

    toggleTab(activeTab){
        this.setState({activeTab})
    }

    getTabs(){
        const { activeTab } = this.state;
        return this.tabs.map(item=>{
            return (
                <li key={item.label}
                    onClick={this.toggleTab.bind(this, item)}
                    className={classNames({"active": item === activeTab})}
                >{item.label}</li>
            )
        })
    }

    getContent(){
        const { activeTab } = this.state;
        return React.cloneElement(activeTab.content, this.props)
    }


    render() {
        return (
            <div className={classNames("home-page", {"active-aside": this.state.asideActive})}>
                <aside className="control-aside"
                       onMouseEnter={this.toggleAside.bind(this, true)}
                       onMouseLeave={this.toggleAside.bind(this, false)}>
                    <ul className="categories-list">
                        <li>Menu 1</li>
                        <li>Menu 2</li>
                        <li>Menu 3</li>
                        <li>Menu 4</li>
                        <li>Menu 5</li>
                    </ul>
                    <span className={classNames("pinnedMod", {"on": this.state.asidePined})}
                          onClick={this.togglePinned.bind(this)}/>
                </aside>
                <div className="aside-area"></div>
                <div className="main-content">
                    <div className="tab-container">
                        <div className="tab-controls">
                            <ul>
                                {this.getTabs()}
                            </ul>
                        </div>
                        <div className="tab-content">
                            {this.getContent()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default HomePage;
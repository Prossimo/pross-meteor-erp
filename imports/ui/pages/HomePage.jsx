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
                component: <Activity/>
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

        this.state = {
            activeTab: this.tabs[0]
        }
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
        if(activeTab.component){
            return React.cloneElement(activeTab.component, this.props);
        }else{
            return activeTab.content
        }

    }


    render() {
        return (
            <div className="home-page">
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
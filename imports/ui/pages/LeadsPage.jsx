import React, { Component } from 'react';
import classNames from 'classnames';
import AllProjects from '../components/project/AllProjects';
import CreateProject from '/imports/ui/components/admin/CreateProject';

class LeadsPage extends React.Component{
    constructor(props){
        super(props);
        this.tabs = [
            {
                label: 'All Leads',
                component: <AllProjects/>
            },
            {
                label: 'Add Lead',
                component: <CreateProject/>
            }
        ];
        this.state ={
            activeTab: this.tabs[0]
        }
        this.getTabs = this.getTabs.bind(this);
        this.toggleTab = this.toggleTab.bind(this);
        this.getContent = this.getContent.bind(this);
    }

     getTabs(){
        const { activeTab } = this.state;
        return <ul>
            {this.tabs.map(item=>{
                return (
                    <li key={item.label}
                        onClick={this.toggleTab.bind(this, item)}
                        className={classNames({'active': item === activeTab})}
                    >{item.label}</li>
                )
            })}
        </ul>
    }

    toggleTab(activeTab){
        this.setState({activeTab})
    }

    getContent(){
        const { activeTab } = this.state;
        if(!activeTab.component) return null;
        const salesRecords = this.props.salesRecords.filter(({ stage })=> stage === 'lead');
        return React.cloneElement(<AllProjects/>, { salesRecords });
    }

    render() {
        return (
            <div className='leads-page'>
                <div className='tab-container'>
                    <div className='tab-controls'>
                        {this.getTabs()}
                    </div>
                    <div className='tab-content'>
                        {this.getContent()}
                    </div>
                </div>
            </div>
        )
    }
}
export default LeadsPage;

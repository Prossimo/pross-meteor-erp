import React from 'react';
import classNames from 'classnames';
import AllSalesRecords from '../components/salesRecord/AllSalesRecords';
import CreateSalesRecord from '/imports/ui/components/admin/CreateSalesRecord';

class ProjectsPage extends React.Component{
    constructor(props){
        super(props);

        this.tabs = [
            {
                label: "All Deals",
                component: <AllSalesRecords/>
            },
            {
                label: "Add Deal",
                component: <CreateSalesRecord/>
            }
        ];

        this.state ={
            activeTab: this.tabs[0]
        }
    }

     getTabs(){
        const { activeTab } = this.state;

        return <ul>
            {this.tabs.map(item=>{
                return (
                    <li key={item.label}
                        onClick={this.toggleTab.bind(this, item)}
                        className={classNames({"active": item === activeTab})}
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

        return React.cloneElement(activeTab.component, this.props)
    }

    render() {
        return (
            <div className="projects-page">
             	<div className="tab-container">
              		<div className="tab-controls">
                		{this.getTabs()}
              		</div>
              		<div className="tab-content">
                		{this.getContent()}
              		</div>
             	</div>
            </div>
        )
    }
}
export default ProjectsPage;

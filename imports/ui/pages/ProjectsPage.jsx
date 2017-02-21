import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames from 'classnames';
import AllProjects from '../components/project/AllProjects';
import AddProject from '../components/project/AddProject';

class ProjectsPage extends React.Component{
    constructor(props){
        super(props);
        
        this.tabs = [
            {
                label: "All projects",
                content: <AllProjects projects={props.projects}/>
            },
            {
                label: "Add project",
                content: <AddProject/>
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
        return activeTab.content;
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
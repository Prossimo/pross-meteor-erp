import React from 'react';
import classNames from 'classnames';
import AllProjects from '../components/project/AllProjects';
import CreateProject from '/imports/ui/components/admin/CreateProject';

class ProjectsPage extends React.Component{
    constructor(props){
        super(props);
        
        this.tabs = [
            {
                label: "All projects",
                component: <AllProjects/>
            },
            {
                label: "Add project",
                component: <CreateProject/>
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
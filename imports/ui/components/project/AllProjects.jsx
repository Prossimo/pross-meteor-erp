import React from 'react';
import classNames from 'classnames';

class AllProjects extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            active: true,
            delivered: false
        }
    }

    toggleState(state){
        this.setState({[state]: !this.state[state]});
    }
    
    renderProjectList(){
        const { active, delivered } = this.state;
        const { projects } = this.props;
        const projectToShow = projects.filter((item)=>{
            if(!active && !delivered) return false;
            if(active && delivered) return true;
            if(!delivered && active == item.active)return true;
            if(!active && delivered == !item.active)return true;
        });

        return (
            <ul className="project-list">
                {projectToShow.map(project=>{
                    return(
                        <li key={project._id}
                            onClick={this.goToProject.bind(this, project)}
                            className={classNames("project-item", {"slack-integrate": !!project.slackChanel})}>
                            <div className="left-part">
                                <p className="title">{project.name}</p>
                                <p className={classNames("status", {[project.status]: project.status})}>{project.status}</p>
                            </div>
                            <div className="right-part"></div>
                        </li>
                    )
                })}
            </ul>
        )
    }
    
    goToProject(project){
        FlowRouter.go("Project", {id: project._id})
    }

    render() {
    	  const { active, delivered } = this.state;
        return (
           <div className=""> 
           		<div className="controls-panel">
           			<ul>
                        <li className={classNames("control-item", {"non-active": !active})}
                            onClick={this.toggleState.bind(this, "active")}>Active</li>
                        <li className={classNames("control-item", {"non-active": !delivered})}
                            onClick={this.toggleState.bind(this, "delivered")}>Delivered</li>
                    </ul>
           		</div>
               {this.renderProjectList()}
           </div>
		  )
    }
}

export default  AllProjects;
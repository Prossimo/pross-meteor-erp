import React from 'react';
import classNames from 'classnames';

class AllProjects extends React.Component{
    constructor(props){
        super(props);
    }
    
    renderProjectList(){
        const { projects } = this.props;

        return (
            <ul className="project-list">
                {projects.map(project=>{
                    return(
                        <li key={project._id}
                            onClick={this.goToProject.bind(this, project)}
                            className={classNames("project-item", {"slack-integrate": !!project.slackChanel})}>
                            <div className="left-part">
                                <p className="title">{project.name}</p>
                            </div>
                            <div className="right-part">

                            </div>
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
        return (
           <div className="">
               {this.renderProjectList()}
           </div>
		  )
    }
}

export default  AllProjects;
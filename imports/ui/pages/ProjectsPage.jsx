import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames from 'classnames';

class ProjectsPage extends React.Component{
    constructor(props){
        super(props);
        //todo load data as props
        this.projectList = [
            {
                name: "Foo",
                status: "active",
                active: true
            },
            {
                name: "Bar",
                status: "delivered",
                active: false
            },
            {
                name: "project 2",
                status: "active",
                active: true
            },
            {
                name: "project 4",
                status: "active",
                active: true
            },
            {
                name: "project 5",
                status: "delivered",
                active: false
            },

        ];

        this.state ={
            active: true,
            delivered: false
        }
    }

    renderProjectList(){
        const { active, delivered } = this.state;
        let projectToShow = this.projectList.filter((item)=>{
            if(!active && !delivered) return false;
            if(active && delivered) return true;
            if(!delivered && active == item.active)return true;
            if(!active && delivered == !item.active)return true;
        });
        console.log(projectToShow)


        return (
            <ul className="project-list">
                {projectToShow.map(item=>{
                    return(
                        <li key={item.name} className="project-item">
                            <div className="left-part">
                                <p>{item.name}</p>
                                <p>{item.status}</p>
                            </div>
                            <div className="right-part"></div>
                        </li>
                    )
                })}
            </ul>
        )
    }

    toggleState(state){
        this.setState({[state]: !this.state[state]});
    }

    render() {
        const { active, delivered } = this.state;
        return (
            <div className="projects-page">
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
export default ProjectsPage;
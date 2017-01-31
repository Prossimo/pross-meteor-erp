import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames from 'classnames';


class HomePage extends React.Component{
    constructor(props){
        super(props);

        this.pages = [
            {
                label: "Home",
                route: "Root"
            },
            {
                label: "Projects",
                route: "Projects"
            },
            {
                label: "Users",
                route: "Users"
            },
            {
                label: "Companies",
                route: "Companies"
            }
        ];

        this.state = {
            asideActive: localStorage.getItem("asidePined") === "true",
            asidePined: localStorage.getItem("asidePined") === "true",
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

    togglePage(item){
        FlowRouter.go(FlowRouter.path(item.route))
    }

    renderList(){
        return (
            <nav className="nav-list">
                <ul>
                    {this.pages.map(item=>{
                        return (
                            <li key={item.label}
                                onClick={this.togglePage.bind(this, item)}
                                className={classNames("nav-item", {"active": FlowRouter.getRouteName() === item.route})}
                            >{item.label}</li>
                        )
                    })}
                </ul>
            </nav>
        )
    }

    render() {
        return (
            <aside className={classNames("control-aside", {"active": this.state.asideActive})}
                   onMouseEnter={this.toggleAside.bind(this, true)}
                   onMouseLeave={this.toggleAside.bind(this, false)}>

                {this.renderList()}

                <span className={classNames("pinnedMod", {"on": this.state.asidePined})}
                      onClick={this.togglePinned.bind(this)}/>
            </aside>
        )
    }
}
export default HomePage;
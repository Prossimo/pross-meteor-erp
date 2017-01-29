import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames from 'classnames';

class HomePage extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            asideActive: false,
            asidePined: false
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
        this.setState({asidePined: !asidePined})
    }


    render() {
        return (
            <div className={classNames("home-page", {"active-aside": this.state.asideActive})}>
                <aside className="control-aside"
                       onMouseEnter={this.toggleAside.bind(this, true)}
                       onMouseLeave={this.toggleAside.bind(this, false)}>
                    <ul>
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
                    <div className="chat">
                        {this.props.users.map(item=>{
                            return (
                                <li key={item._id}>
                                    <p>{item.username}</p>
                                    <p>{item.profile.firstName}</p>
                                    <p>{item.profile.lastName}</p>
                                </li>
                            )
                        })}
                    </div>
                </div>
            </div>
        )
    }
}
export default HomePage;
import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';

class Header extends React.Component{
    constructor(props){
        super(props);

    }

    logout(){
        Meteor.logout((err)=>{
            if(!err) {
                FlowRouter.reload();
            }
        })
    }

    render() {
        let { user } = this.props;
        return (
            <div className="header-wrap">
                <header className="header">
                    <div className="user-info">
                        <div className="avatar">
                            <img src="http://lorempixel.com/100/100/people" alt=""/>
                        </div>
                        <div className="username">
                            {user ? user.username : "Guest"}
                            </div>
                        <div className="logout">
                            <button className="logout-btn"
                                onClick={this.logout.bind(this)}/>
                        </div>
                    </div>
                </header>
            </div>
        )
    }
}
export default Header;
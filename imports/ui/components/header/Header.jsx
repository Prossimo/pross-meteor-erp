import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames  from 'classnames';

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
        let { user, login } = this.props;
        return (
            <div className={classNames("header-wrap", {"hide": !login})}>
                <header className="header">
                    <div className="user-info">
                        <div className="avatar">
                            <img src={"/icons/user.png"} alt={user && user.username}/>
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
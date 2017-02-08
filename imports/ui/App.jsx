import React from 'react';
import classNames from 'classnames';
import Header from './components/header/Header';
import Aside from './components/aside/Aside';
import Alert from 'react-s-alert';

class App extends React.Component{
    constructor(props){
        super(props);

    }

    renderAside(){
        const { login, currentUser } = this.props;
        if(login){
            return <Aside currentUser={currentUser}/>
        }
    }

    render() {
        const { login } = this.props;
        return (
            <div className="app">
                <Header user={Meteor.user()} login={login}/>
                {this.renderAside()}
                <div className="page-content active-aside">
                    {React.cloneElement(this.props.content, {...this.props})}
                </div>
                <Alert stack={{limit: 3}}/>
            </div>
        )
    }
}

export default App;
import React from 'react';
import classNames from 'classnames';
import Header from './components/header/Header';
import Aside from './components/aside/Aside';
import Dialer from './components/dialer/Dialer';
import Alert from 'react-s-alert';

class App extends React.Component{
    constructor(props){
        super(props);

    }
    renderAside(currentUser){
        if(currentUser){
            return (
                <Aside currentUser={currentUser}/>
            )
        }
    }

    render() {
        const { currentUser } = this.props;
        return (
            <div className="app">
                <Header user={currentUser} />
                {this.renderAside(currentUser)}
                <Dialer />
                <div className="page-content active-aside">
                    {React.cloneElement(this.props.content, {...this.props})}
                </div>
                <Alert stack={{limit: 3}}/>
            </div>
        )
    }
}

export default App;
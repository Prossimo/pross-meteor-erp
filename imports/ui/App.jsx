import React from 'react';

import Header from './components/header/Header';
import Aside from './components/aside/Aside';

class App extends React.Component{
    render() {
        const {login} = this.props;
        return (
            <div className="app">
                <Header user={Meteor.user()} login={login}/>
                {login && <Aside/>}
                <div className="page-content">
                    {React.cloneElement(this.props.content, this.props)}
                </div>
            </div>
        )
    }
}

export default App;
import React from 'react';

import Header from './components/header/Header';

class App extends React.Component{
    render() {
        return (
            <div className="app">
                <Header user={Meteor.user()} login={this.props.login}/>
                <div className="page-content">
                    {React.cloneElement(this.props.content, this.props)}
                </div>
            </div>
        )
    }
}

export default App;
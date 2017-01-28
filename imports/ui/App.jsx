import React from 'react';

import Header from './components/header/Header';

class App extends React.Component{
    render() {
        return (
            <div className="app">
                <Header user={Meteor.user()}/>
                <div className="page-content">
                    {this.props.content}
                </div>
            </div>
        )
    }
}

export default App;
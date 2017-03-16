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
        const { currentUser } = this.props;
        if(!currentUser) return null;

        return <Aside key="main-control-aside"
                      salesRecords={this.props.salesRecords}
                      currentUser={currentUser}/>

    }

    render() {
        const { currentUser } = this.props;
        return (
            <div className="app">
                <Header user={currentUser} />
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
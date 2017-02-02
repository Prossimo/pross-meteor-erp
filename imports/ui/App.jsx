import React from 'react';
import classNames from 'classnames';
import Header from './components/header/Header';
import Aside from './components/aside/Aside';

class App extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            asideActive: false
        }
    }
    toggleAside(){
        const { asideActive } = this.state;
        this.setState({asideActive: !asideActive})
    }


    render() {
        const {login} = this.props;
        const { asideActive } = this.state;
        return (
            <div className="app">
                <Header user={Meteor.user()} login={login}/>
                {login && <Aside toggleAside={this.toggleAside.bind(this)}
                    asideActive={asideActive}/>}
                <div className={classNames("page-content", {"active-aside": asideActive})}>
                    {React.cloneElement(this.props.content, {...this.props})}
                </div>
            </div>
        )
    }
}

export default App;
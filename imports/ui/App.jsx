import React from 'react';
import classNames from 'classnames';
import Header from './components/header/Header';
import Aside from './components/aside/Aside';
import Alert from 'react-s-alert';

import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import { Loader, Types } from 'react-loaders';
import 'loaders.css/loaders.min.css';

class App extends React.Component{
    constructor(props){
        super(props);
        this.toggleLoader =  this.toggleLoader.bind(this);
        this.state = {
          blocking: false
        }
    }

    renderAside(){
        const { currentUser } = this.props;
        if(!currentUser) return null;

        return <Aside key="main-control-aside"
                      salesRecords={this.props.salesRecords}
                      currentUser={currentUser}/>

    }

    toggleLoader(blocking) {
      //disable scroller
      if(blocking === true) {
        $('.app').attr('style', 'overflow: hidden');
      } else {
          $('.app').attr('style', 'overflow: scroll');
      }
      this.setState({blocking: blocking})
    }

    render() {
        const { currentUser } = this.props;
        return (
            <BlockUi className="app" tag="div" loader={<Loader active type="line-spin-fade-loader" color="#5b8bff"/>} blocking={this.state.blocking}>
                <Header user={currentUser} />
                  {this.renderAside()}
                  <div className="page-content active-aside">
                      {React.cloneElement(this.props.content, {...this.props, toggleLoader: this.toggleLoader})}
                  </div>
                <Alert stack={{limit: 3}}/>
            </BlockUi>

        )
    }
}

export default App;

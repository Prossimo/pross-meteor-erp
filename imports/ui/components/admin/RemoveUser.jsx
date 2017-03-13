import React from 'react';
import { Button } from 'react-bootstrap';

class RemoveUser extends React.Component{
    constructor(props){
        super(props);
  
      this.handleRemoveUser = this.handleRemoveUser.bind(this);
    }
    
    handleRemoveUser(e) {
      console.log('===handleRemoveUser===');
      // console.log(e);
      console.log(this.props.userId);
      Meteor.call('adminRemoveUser', this.props.userId, (err)=>{
        if(err) return this.setState({[err.error]: err.reason});
        info('Successful removed user!');
        this.setState(this.defaultState);
      });
      console.log('======================');
    }

    render() {
      return (
          <Button bsStyle="danger" onClick={this.handleRemoveUser}>Remove</Button>
        )
    }
}

export default  RemoveUser;
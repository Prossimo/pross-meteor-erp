import React from 'react';
import { Button } from 'react-bootstrap';

class RemoveUser extends React.Component{
    constructor(props){
        super(props);
  
      this.handleRemoveUser = this.handleRemoveUser.bind(this);
    }
    
    handleRemoveUser(e) {
      console.log('===handleRemoveUser===');
      console.log(e);
      console.log(this.props.userId);
      console.log('======================');
    }

    render() {
      return (
          <Button bsStyle="danger" onClick={this.handleRemoveUser}>Remove</Button>
        )
    }
}

export default  RemoveUser;
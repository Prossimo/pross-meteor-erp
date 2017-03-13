import React from 'react';
import { Button } from 'react-bootstrap';
import { info } from '/imports/api/lib/alerts';

class RemoveUser extends React.Component{
    constructor(props){
        super(props);
  
      this.handleRemoveUser = this.handleRemoveUser.bind(this);
    }
    
    handleRemoveUser(e) {
      Meteor.call('adminRemoveUser', this.props.userId, (err) => {
        if(err) return this.setState({[err.error]: err.reason});
        info('User was successfully removed!');
      });
    }

    render() {
      return (
          <Button bsStyle="danger" onClick={this.handleRemoveUser}>Remove</Button>
        )
    }
}

export default  RemoveUser;
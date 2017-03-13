import React from 'react';
import classNames from 'classnames';
import { Button, Table, Modal } from 'react-bootstrap';

import CreateUser from '../components/admin/CreateUser';
import CreateProject from '../components/admin/CreateProject';
import EditUser  from '../components/admin/EditUser'
import RemoveUser  from '../components/admin/RemoveUser'

class CreateUserModal extends React.Component{
  constructor(props){
    super(props);
    
    this.state = {
      showModal: false
    };
    
    this.handleModalState = this.handleModalState.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }
  
  close() {
    this.setState({ showModal: false });
  }
  
  open() {
    this.setState({ showModal: true });
  }
  
  handleModalState () {
    this.setState({
      showModal: false
    });
  }
  
  render() {
    return (
      <div>
        <button className="btnn login-btn" onClick={this.open}>Create new user</button>
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>Create user</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CreateUser updateModalState={this.handleModalState}/>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={this.close}>Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

class AdminPage extends React.Component{
  constructor(props){
    super(props);
  }
  
  render() {
    return (
      <div className="page-container admin-page">
        <div className="main-content">
          <div className="tab-container">
            <h2 className="page-title">Admin page</h2>
            <CreateUserModal />
            <Table striped bordered condensed hover>
              <thead>
              <tr>
                <th>#</th>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Status</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
              </thead>
              {this.props.createdUsers.map((user, index) =>{
                return(
                  <tbody key={user._id}>
                  <tr>
                    <td>{index + 1}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.isActive ? "Active" : "Not active yet"}</td>
                    <td>{user.role}</td>
                    <td>
                      <EditUser user={user}/>
                      <RemoveUser userId={user._id} />
                    </td>
                  </tr>
                  </tbody>
                )
              })}
            </Table>
          </div>
        </div>
      </div>
    )
  }
}
export default AdminPage;
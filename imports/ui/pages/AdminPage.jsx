import React from 'react';
import classNames from 'classnames';
import { Button, Table, Modal } from 'react-bootstrap';

import CreateUser from '../components/admin/CreateUser';
import CreateProject from '../components/admin/CreateProject';
import RemoveUser  from '../components/admin/RemoveUser'

const Example = React.createClass({
  getInitialState() {
    return { showModal: false };
  },
  
  close() {
    this.setState({ showModal: false });
  },
  
  open() {
    this.setState({ showModal: true });
  },
  
  render() {
    return (
      <div>
          <button className="btnn login-btn" onClick={this.open}>Create new user</button>
          <Modal show={this.state.showModal} onHide={this.close}>
              <Modal.Header closeButton>
                  <Modal.Title>Modal heading</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                  <CreateUser/>
              </Modal.Body>
              <Modal.Footer>
                  <Button onClick={this.close}>Close</Button>
              </Modal.Footer>
          </Modal>
      </div>
    );
  }
});

class AdminPage extends React.Component{
    constructor(props){
        super(props);

        this.tabs = [
            {
                label: "Create user",
                component: <CreateUser/>
            }
        ];

        this.state = {
            activeTab: this.tabs[0]
        }
    }

    toggleTab(activeTab){
        this.setState({activeTab})
    }

    getTabs(){
        const { activeTab } = this.state;

        return <ul>
            {this.tabs.map(item=>{
                return (
                    <li key={item.label}
                        onClick={this.toggleTab.bind(this, item)}
                        className={classNames({"active": item === activeTab})}
                    >{item.label}</li>
                )
            })}
        </ul>
    }

    getContent(){
        const { activeTab } = this.state;
        if(!activeTab.component) return null;
        return React.cloneElement(activeTab.component, this.props)
    }

    render() {
        return (
            <div className="page-container admin-page">
                <div className="main-content">
                    <div className="tab-container">
                        <h2 className="page-title">Admin page</h2>
                        <Example />
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
                          {this.props.createdUsers.map((item, index) =>{
                            return(
                              <tbody key={item._id}>
                              <tr>
                                  <td>{index + 1}</td>
                                  <td>{item.firstName}</td>
                                  <td>{item.lastName}</td>
                                  <td>{item.username}</td>
                                  <td>{item.email}</td>
                                  <td>{item.isActive ? "Active" : "Not active yet"}</td>
                                  <td>{item.role}</td>
                                  <td>
                                      <Button bsStyle="primary">Edit</Button>
                                      <RemoveUser userId={item._id} />
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
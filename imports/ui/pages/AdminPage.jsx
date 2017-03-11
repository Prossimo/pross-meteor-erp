import React from 'react';
import classNames from 'classnames';
import { Button, Table } from 'react-bootstrap';

import CreateUser from '../components/admin/CreateUser';
import CreateProject from '../components/admin/CreateProject';

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
                    <button className="btnn login-btn" type="submit">Create new user</button>
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
                                                <Button bsStyle="danger">Remove</Button>
                                            </td>
                                        </tr>
                                    </tbody>
                                )
                            })}
                    </Table>
                    <div className="tab-container">
                        <h2 className="page-title">Admin page</h2>
                        <div className="tab-controls">
                            {this.getTabs()}
                        </div>
                        <div className="tab-content">
                            {this.getContent()}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
export default AdminPage;
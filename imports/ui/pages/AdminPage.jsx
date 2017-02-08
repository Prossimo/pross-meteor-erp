import React from 'react';
import classNames from 'classnames';

import CreateUser from '../components/admin/CreateUser';
import CreateProject from '../components/admin/CreateProject';

class AdminPage extends React.Component{
    constructor(props){
        super(props);

        this.tabs = [
            {
                label: "Create user",
                component: <CreateUser/>
            },
            {
                label: 'Add project',
                component: <CreateProject/>
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
        if(activeTab.component){
            return React.cloneElement(activeTab.component, this.props);
        }else{
            return activeTab.content
        }
    }

    render() {
        return (
            <div className="page-container admin-page">
                <div className="main-content">
                    <div className="tab-container">
                        <h2 className="page-title">Admin page 2</h2>
                        <div className="tab-controls">
                            {this.getTabs()}
                        </div>
                        <div className="tab-content">
                            {this.getContent()}
                        </div>
                    </div>
                </div>
                <aside className="right-sidebar">
                    <h2 className="title">Created users</h2>
                    <ol>
                        {this.props.createdUsers.map(item=>{
                            return(
                                <li key={item._id}>
                                    <h4>{item.email} {item.isActive ? "Active" : "Not active yet"} </h4>
                                    <h5>{item.role}</h5>
                                </li>
                            )
                        })}
                    </ol>
                </aside>
            </div>
        )
    }
}
export default AdminPage;
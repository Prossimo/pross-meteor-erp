import React from 'react';
import classNames from 'classnames';
import ContactInfo from '../components/account/ContactInfo';

class UserAccount extends React.Component{
    constructor(props){
        super(props);

        this.tabs = [
            {
                label: "Contact info",
                component: <ContactInfo user={props.currentUser}/>
            },
            {
                label: 'My uploads',
                content: <p>uploads</p>
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
            return React.cloneElement(activeTab.component);
        }else{
            return activeTab.content
        }
    }

    render() {
        return (
            <div className="page-container user-settings">
                <div className="main-content">
                    <div className="tab-container">
                        <h2 className="page-title">user-settings</h2>
                        <div className="tab-controls">
                            {this.getTabs()}
                        </div>
                        <div className="tab-content">
                            {this.getContent()}
                        </div>
                    </div>
                </div>
                <aside className="right-sidebar">
                    <h2 className="title">User info</h2>

                </aside>
            </div>
        )
    }
}
export default UserAccount;
import React from 'react'
import {Tabs, Tab, Panel, Button} from 'react-bootstrap'
import AccountStore from '../../api/nylas/account-store'
import AccountSettingForm from '../components/inbox/AccountSettingForm'
import NylasSigninForm from '../components/inbox/NylasSigninForm'


export default class InboxSettingsPage extends React.Component {
    static propTypes = {}

    constructor(props) {
        super(props)

        this.state = {
            addingInbox: false,
            addingTeamInbox: false
        }
    }


    componentDidMount() {

    }

    componentWillUnmount() {
        if (this.unsubscribes) {
            this.unsubscribes.forEach((unsubscribe) => {
                unsubscribe()
            });
        }
    }

    render() {
        if (Meteor.user().isAdmin())
            return this.renderTabs()
        else
            return this.renderComponent()
    }

    renderTabs() {
        return (
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
                <Tab eventKey={1} title="Team inboxes">{this.renderCompnent(true)}</Tab>
                <Tab eventKey={2} title="Individual inboxes">{this.renderCompnent()}</Tab>
            </Tabs>
        )
    }

    renderComponent(isTeamAccount = false) {
        let accounts = AccountStore.accounts()

        const {addingInbox, addingTeamInbox} = this.state
        if(addingInbox) {
            return <NylasSigninForm isAddingTeamInbox={addingTeamInbox} onCancel={() => this.setState({addingInbox: false})}/>
        } else {
            return (
                <div style={{padding:10,backgroundColor:'white'}}>
                    <div className="toolbar-panel">
                        <div style={{flex: 1}}>
                            <Button bsStyle="primary" onClick={() => this.setState({addingInbox: true, addingInbox: isTeamAccount})}>Add an inbox</Button>
                        </div>
                    </div>
                    {
                        accounts.map((account) => {
                            const header = (
                                <div style={{display: 'flex'}}>
                                    <div style={{flex:1}}>
                                        {account.emailAddress}
                                    </div>
                                    <div>
                                        <Button bsStyle="danger" bsSize="xsmall"><i className="fa fa-trash"/></Button>
                                    </div>
                                </div>
                            )

                            return (
                                <Panel key={account._id} header={header}>
                                    <AccountSettingForm account={account}/>
                                </Panel>
                            )
                        })
                    }
                </div>
            )
        }
    }
}


import React from 'react'
import {PanelGroup, Panel, Button, Col} from 'react-bootstrap'
import { CardGroup, Card, CardHeader, CardBody} from 'reactstrap'
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
import classnames from 'classnames'

import {Users} from '/imports/api/models'
import AccountStore from '/imports/api/nylas/account-store'
import Actions from '/imports/api/nylas/actions'
import {warning} from '/imports/api/lib/alerts'
import AccountSettingForm from '/imports/ui/components/inbox/AccountSettingForm'
import NylasSigninForm from '/imports/ui/components/inbox/NylasSigninForm'
import TemplatesView from '/imports/ui/components/mailtemplates/TemplatesView'
import {Selector} from '/imports/ui/components/common'

export default class InboxSettingsPage extends React.Component {
    static propTypes = {}
    state = {
        addingIndividualInbox: false,
        addingTeamInbox: false,
        accounts: AccountStore.accounts(),
        activeTab: 'inboxes'
    }

    componentDidMount() {
        this.unsubscribes = []
        this.unsubscribes.push(AccountStore.listen(this.onAccountStoreChanged))
    }

    componentWillUnmount() {
        if (this.unsubscribes) {
            this.unsubscribes.forEach((unsubscribe) => {
                unsubscribe()
            })
        }
    }

    onAccountStoreChanged = () => {
        this.setState({accounts: AccountStore.accounts()})
    }

    onSelectTeamMembers = (account, members) => {
        Meteor.call('updateNylasAccountTeamMembers', account._id, members.map(({value}) => value), (err, res) => {
            if(err) warning(err.reason)
        })
    }

    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    render() {
        return (
            <div>
                <Nav tabs>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'inboxes' })}
                            onClick={() => { this.toggle('inboxes'); }}
                        >
                            Inboxes
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink
                            className={classnames({ active: this.state.activeTab === 'templates' })}
                            onClick={() => { this.toggle('templates'); }}
                        >
                            Templates
                        </NavLink>
                    </NavItem>
                </Nav>
                <TabContent activeTab={this.state.activeTab}>
                    <TabPane tabId="inboxes">
                        {this.renderInboxesTab()}
                    </TabPane>
                    <TabPane tabId="templates">
                        {this.renderTemplatesTab()}
                    </TabPane>
                </TabContent>
            </div>

        )
    }

    renderInboxesTab = () => {
        return (
            <CardGroup style={{ height: '100%' }} id="pg-1" className="row">
                {Meteor.user().isAdmin() ? [
                    <Card className="col-12" id="inboxes" key='c'>
                        <CardHeader>
                            Team Inboxes
                        </CardHeader>
                        <CardBody>
                            {this.renderInboxesComponent(true)}
                        </CardBody>
                    </Card>,
                    <div className="w-100" key='d'></div>
                ] : null }
                <Card className="col-12" id="templates">
                    <CardHeader>
                        Individual Inboxes
                    </CardHeader>
                    <CardBody>
                        {this.renderInboxesComponent()}
                    </CardBody>
                </Card>
            </CardGroup>
        )
    }

    renderInboxesComponent = (isTeamAccount = false) => {
        const accounts = this.state.accounts.filter((account) => account.isTeamAccount == isTeamAccount)

        const {addingIndividualInbox, addingTeamInbox} = this.state
        if (addingIndividualInbox && !isTeamAccount || addingTeamInbox && isTeamAccount) {
            return <NylasSigninForm isAddingTeamInbox={isTeamAccount}
                                    onCancel={() => isTeamAccount ? this.setState({addingTeamInbox: false}) : this.setState({addingIndividualInbox: false})}
                                    onCompleted={() => isTeamAccount ? this.setState({addingTeamInbox: false}) : this.setState({addingIndividualInbox: false})}/>
        } else {
            return (
                <div style={{padding: 10, backgroundColor: 'white'}}>
                    <div className="toolbar-panel">
                        <div style={{flex: 1}}>
                            <Button bsStyle="primary"
                                    onClick={() => isTeamAccount ? this.setState({addingTeamInbox: true}) : this.setState({addingIndividualInbox: true})}>
                                Add an inbox
                            </Button>
                        </div>
                    </div>
                    {
                        accounts.map((account) => {
                            const header = (
                                <div style={{display: 'flex'}}>
                                    <div style={{flex: 1}}>
                                        {account.emailAddress}
                                    </div>
                                    <div>
                                        { isTeamAccount ? <Selector multiple
                                            triggerEl={<i className="fa fa-user"/>}
                                            value={(account.getTeamMembers() || []).map(m => ({
                                                value: m._id,
                                                label: m.name()
                                            }))}
                                            options={Users.find().map(u => ({
                                                value: u._id,
                                                label: u.name()
                                            }))}
                                            onSelect={(members) => this.onSelectTeamMembers(account, members)}/> : null
                                        }
                                        &nbsp;<Button bsStyle="danger" bsSize="xsmall" onClick={() => this.onClickRemoveAccount(account)}>
                                        <i className="fa fa-trash"/>
                                    </Button>
                                    </div>
                                </div>
                            )

                            return (
                                <Col md={6} key={account._id}>
                                    <Card>
                                        <CardHeader>
                                            {header}
                                        </CardHeader>
                                        <CardBody>
                                            <AccountSettingForm account={account}/>
                                        </CardBody>
                                    </Card>
                                </Col>
                            )
                        })
                    }
                </div>
            )
        }
    }

    onClickRemoveAccount = (account) => {
        if (confirm(`Are you sure to remove ${account.emailAddress}?`)) {
            Meteor.call('removeNylasAccount', account, (err, res) => {
                if (err) {
                    console.log(err)
                    return warning(err.message)
                }

                Actions.changedAccounts()
            })
        }
    }

    renderTemplatesTab = () => {
        return (
            <div style={{padding: 10, backgroundColor: 'white'}}>
                <TemplatesView/>
            </div>
        )
    }
}


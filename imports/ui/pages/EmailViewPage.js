import {FlowRouter} from 'meteor/kadira:flow-router'
import React, {PropTypes} from 'react'
import {createContainer} from 'meteor/react-meteor-data'
import {Alert} from 'react-bootstrap'
import {NylasAccounts} from '/imports/api/models'
import EmailFrame from '../components/inbox/EmailFrame'
import ItemMessage from '../components/inbox/ItemMessage'
import NylasAPI from '/imports/api/nylas/nylas-api'
import classnames from 'classnames'

class EmailViewPage extends React.Component {
    static propTypes = {
        messageId: PropTypes.string
    }

    constructor(props) {
        super(props)

        const {subscribing, messageId, accountId} = props
        //console.log('EmailViewPage', messageId, accountId, props, NylasAccounts.findOne({accountId}))
        this.state = {
            loading: subscribing,
            notFound: !messageId || !accountId
        }
    }

    componentDidMount() {//console.log('componentDidMount')
        this.loadMessage(this.props)
    }
    componentWillReceiveProps(newProps) {
        //console.log('componentWillReceiveProps', newProps)

        this.loadMessage(newProps)
    }

    loadMessage(props) {
        const {subscribing, messageId, accountId} = props
        if (subscribing) {
            return this.setState({loading: true})
        } else if (!messageId || !accountId) {
            return this.setState({notFound: true})
        }

        this.setState({loading: true})
        NylasAPI.makeRequest({
            path: `/messages/${messageId}`,
            method: 'GET',
            accountId
        }).then((result) => {
            this.setState({loading: false, message: result})
        }).catch(err => {
            console.error('catched error', err)
            this.setState({loading: false, notFound: true})
        })
    }
    render() {
        const notFoundAlert = (
            <Alert bsStyle="danger">
                We could not find message
            </Alert>
        )
        const loadingAlert = (
            <Alert bsStyle="info">
                <i className="fa fa-spinner fa-spin fa-fw"></i>
            </Alert>
        )

        const {loading, notFound, message} = this.state
        if (loading) return loadingAlert
        if (notFound || !message) return notFoundAlert


        const classNames = classnames({
            'message-item-wrap': true
        })
        return (
            <div className="inbox-page">
                <div className="list-message">
                    <div className="message-subject-wrap"><span className="message-subject">{message.subject}</span></div>
                    <ItemMessage
                        ref="message"
                        className={classNames}
                        message={message}
                        viewonly
                    />
                </div>
            </div>
        )
    }
}

export default createContainer(() => {
    const subscriber = Meteor.subscribe('getNylasAccounts')

    const messageId = FlowRouter.getParam('message_id')
    const accountId = FlowRouter.getQueryParam('account_id')

    return {
        subscribing: !subscriber.ready(),
        messageId,
        accountId
    }
}, EmailViewPage)
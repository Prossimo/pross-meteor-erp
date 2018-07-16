import React from 'react'
import NylasUtils from '../../../api/nylas/nylas-utils'
import { THREAD_STATUS_CLOSED } from '/imports/api/models/threads/threads'

class ItemThread extends React.Component{
    static propTypes = {
        thread: React.PropTypes.object.isRequired,
        onClick: React.PropTypes.func,
        selected: React.PropTypes.bool,
        onChangeStatus: React.PropTypes.func
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {participants, subject, snippet, unread, last_message_received_timestamp, message_ids, draft_ids, has_attachments, readByUsers, status} = this.props.thread

        const readMark = () => {
            if (unread || !readByUsers || readByUsers.length === 0 || !_.findWhere(readByUsers, {userId: Meteor.userId()})) return <div className="thread-icon thread-icon-unread"></div>
            else if(_.findWhere(readByUsers, {userId: Meteor.userId()})) return <div className="thread-icon thread-icon-read"></div>
        }

        return (
            <div className={`item${this.props.selected ? ' focused' :''}`}>
                <div className="thread-status-checkbox">
                    <input type="checkbox" onChange={e => this.props.onChangeStatus(e.target.checked)} checked={status === THREAD_STATUS_CLOSED} />
                </div>
                <div className="thread-info-column" onClick={(evt) => {this.props.onClick(evt)}}>
                    <div className="participants-wrapper">
                        {readMark()}
                        <div className="participants">
                            <span className={unread&&'unread'}>{NylasUtils.getParticipantsNamesString(participants, false)}</span>
                        </div>
                        {message_ids && message_ids.length>1 && <div>&nbsp;({message_ids.length})</div>}
                        {draft_ids && draft_ids.length>0 && <div className="thread-icon thread-icon-pencil" />}
                        {has_attachments && <div className="thread-icon thread-icon-attachment"></div>}
                        <span className="timestamp">{NylasUtils.shortTimeString(last_message_received_timestamp)}</span>
                    </div>
                    <div className="subject">
                        <span className={unread&&'unread'}>{subject}</span>
                    </div>
                    <div className="snippet-and-labels">
                        <div className="snippet">
                            {snippet}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ItemThread

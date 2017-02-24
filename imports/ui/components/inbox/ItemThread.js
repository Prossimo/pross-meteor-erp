import React from 'react';
import NylasUtils from '../../../api/nylas/nylas-utils';

class ItemThread extends React.Component{

    constructor(props) {
        super(props);
    }

    render() {
        const {participants, subject, snippet, unread, last_message_received_timestamp} = this.props.thread;
        return (
            <div className={`item${this.props.selected ? " focused" :""}`} onClick={(evt)=>{this.props.onClick(evt)}}>
                <div className="thread-info-column">
                    <div className="participants-wrapper">
                        <div className="participants">
                            <span className={unread&&"unread"}>{NylasUtils.getParticipantsNamesString(participants)}</span>
                        </div>
                        <span style={{flexGrow:1, flexShrink:1, flexBasis:'0%'}}></span>
                        <span className="timestamp">{NylasUtils.shortTimeString(last_message_received_timestamp)}</span>
                    </div>
                    <div className="subject">
                        <span className={unread&&"unread"}>{subject}</span>
                    </div>
                    <div className="snippet-and-labels">
                        <div className="snippet">
                            {snippet}
                        </div>
                        <div style={{flexGrow:1, flexShrink:1, flexBasis:'0%'}}>

                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ItemThread;

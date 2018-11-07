import React from 'react'
import PropTypes from 'prop-types'
import NylasUtils from '../../../api/nylas/nylas-utils'

class ItemDraft extends React.Component{
    static propTypes = {
        draft: PropTypes.object.isRequired,
        onClick: PropTypes.func,
        selected: PropTypes.bool
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {from, to, cc, bcc, subject, snippet, unread, date, files} = this.props.draft
       const participants = [].concat(from).concat(to).concat(cc).concat(bcc)
        return (
            <div className={`item${this.props.selected ? ' focused' :''}`} onClick={(evt) => {this.props.onClick(evt)}}>
                <div className="thread-info-column">
                    <div className="participants-wrapper">
                        <div className="participants">
                            <span className={unread&&'unread'}>{NylasUtils.getParticipantsNamesString(participants, false)}</span>
                        </div>
                        <div className="thread-icon thread-icon-pencil"></div>
                        {files.length>0 && <div className="thread-icon thread-icon-attachment"></div>}
                        <span style={{flexGrow:1, flexShrink:1, flexBasis:'0%'}}></span>
                        <span className="timestamp">{NylasUtils.shortTimeString(date)}</span>
                    </div>
                    <div className="subject">
                        <span className={unread&&'unread'}>{subject}</span>
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

export default ItemDraft

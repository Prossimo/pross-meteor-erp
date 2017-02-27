import _ from 'underscore';
import moment from 'moment'
import React from 'react';

class MessageTimestamp extends React.Component {
    static propTypes = {
        date: React.PropTypes.number.isRequired,
        className: React.PropTypes.string,
        isDetailed: React.PropTypes.bool,
        onClick: React.PropTypes.func
    }

    shouldComponentUpdate(nextProps, nextState) {
        return +nextProps.date != +this.props.date || nextProps.isDetailed != this.props.isDetailed
    }

    render() {
        msgDate = moment.tz(this.props.date*1000, NylasUtils.timezone)
        nowDate = this._today()
        formattedDate = this._formattedDate(msgDate, nowDate, this.props.isDetailed)

        return (
            <div className={this.props.className}
                 title={NylasUtils.fullTimeString(this.props.date)}
                 onClick={this.props.onClick}>{formattedDate}</div>
        )
    }

    _formattedDate(msgDate, now, isDetailed) {
        if (isDetailed)
            return msgDate.format("MMMM D, YYYY [at] h:mm A")
        else {

            diff = now.diff(msgDate, 'days', true)
            isSameDay = now.isSame(msgDate, 'days')
            if (diff < 1 && isSameDay)
                return msgDate.format("h:mm A")
            if (diff < 1.5 && !isSameDay) {
                timeAgo = msgDate.from(now)
                monthAndDay = msgDate.format("h:mm A")
                return monthAndDay + " (" + timeAgo + ")"
            }
            if (diff >= 1.5 && diff < 365)
                return msgDate.format("MMM D")
            if (diff >= 365)
                return msgDate.format("MMM D, YYYY")
        }
    }

    _today() {
        return moment.tz(NylasUtils.timezone);
    }

}


module.exports = MessageTimestamp

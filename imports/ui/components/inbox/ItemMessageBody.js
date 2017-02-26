import React from 'react';
import NylasUtils from '../../../api/nylas/nylas-utils';
import EmailFrame from './EmailFrame';

class ItemMessageBody extends React.Component{

    constructor(props) {
        super(props);
    }

    render() {
        return <EmailFrame showQuotedText={false} content={this.props.message.body}/>
    }
}

export default ItemMessageBody;

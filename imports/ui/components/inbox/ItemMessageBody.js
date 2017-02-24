import React from 'react';
import NylasUtils from '../../../api/nylas/nylas-utils';

class ItemMessageBody extends React.Component{

    constructor(props) {
        super(props);
    }

    render() {
        return <div>{this.props.message.body}</div>
    }
}

export default ItemMessageBody;

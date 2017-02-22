import React from 'react';

class ItemFolder extends React.Component{

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div>{this.props.data.name}</div>
        )
    }
}

export default ItemFolder;

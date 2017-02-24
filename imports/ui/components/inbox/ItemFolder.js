import React from 'react';

class ItemFolder extends React.Component{

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div className={`item${this.props.selected ? " focused" :""}`} onClick={(evt)=>{this.props.onClick(evt)}}>{this.props.folder.name}</div>
        )
    }
}

export default ItemFolder;

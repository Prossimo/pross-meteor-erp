import React from 'react';
import Utils from '../../utils/Utils';

class ItemFolder extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {

        return (
            <div
                className={`item${this.props.selected ? " focused" : ""}`}
                onClick={(evt) => {
                    this.props.onClick(evt)
                }}>
                <span><img src={Utils.iconForFolder(this.props.folder)} width="16px"/></span>&nbsp;
                <span>{this.props.folder.display_name}</span>
            </div>
        )
    }
}

export default ItemFolder;

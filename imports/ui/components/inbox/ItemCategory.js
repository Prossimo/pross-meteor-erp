import React from 'react';
import Utils from '../../utils/Utils';

class ItemCategory extends React.Component {
    /*static propTypes = {
        category: React.PropTypes.object.required,
        onClick: React.PropTypes.func,
        selected: React.PropTypes.bool
    }*/

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
                <span><img src={Utils.iconForCategory(this.props.category)} width="16px"/></span>&nbsp;
                <span>{this.props.category.display_name}</span>
            </div>
        )
    }
}

export default ItemCategory;

import React from 'react'
import PropTypes from 'prop-types'

export default class Panel extends React.Component {
    static propTypes = {
        icon: PropTypes.string, // icon name
        title: PropTypes.string,
        actions: PropTypes.element
    }

    constructor(props) {
        super(props)
    }

    render() {
        const {title, actions, children} = this.props
        return (
            <div>
                <div style={{display:'flex'}}>
                    <div style={{flex:1,fontWeight:'bold'}}>{title}</div>
                    <div style={{cursor:'pointer'}}>{actions}</div>
                </div>
                <div style={{padding:10}}>{children}</div>
            </div>
        )
    }
}
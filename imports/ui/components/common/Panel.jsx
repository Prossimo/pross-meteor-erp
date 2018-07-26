import React from 'react'
import PropTypes from 'prop-types'
import {Card, CardHeader, CardBody} from 'reactstrap';

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
            <Card>
                <CardHeader style={{display:'flex'}}>
                    <div style={{flex:1,fontWeight:'bold'}}>{title}</div>
                    <div style={{cursor:'pointer'}}>{actions}</div>
                </CardHeader>
                <CardBody style={{padding:10}}>{children}</CardBody>
            </Card>
        )
    }
}
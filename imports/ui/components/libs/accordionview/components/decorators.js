'use strict';

import React from 'react'
import PropTypes from 'prop-types';
import Radium from 'radium';
import {VelocityComponent} from 'velocity-react';

const Loading = (props) => {
    return (
        <div style={props.style}>
            loading...
        </div>
    );
};

Loading.propTypes = {
    style: PropTypes.object
};

const Toggle = (props) => {
    const style = props.style;
    const height = style.height;
    const width = style.width;
    let midHeight = height * 0.5;
    let points = `0,0 0,${height} ${width},${midHeight}`;
    return (
        <div style={style.base}>
            <div style={style.wrapper}>
                <svg height={height} width={width}>
                    <polygon
                        points={points}
                        style={style.arrow}
                    />
                </svg>
            </div>
        </div>
    );
};

Toggle.propTypes = {
    style: PropTypes.object
};

const Header = (props) => {
    const style = props.style;
    return (
        <div style={style.base}>
            <div style={style.title}>
                {props.node.name}
            </div>
        </div>
    );
};

Header.propTypes = {
    style: PropTypes.object,
    node: PropTypes.object.isRequired
};

@Radium
class Container extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        const {style, decorators, terminal, onClick, node} = this.props;
        return (
            <div
                ref="clickable"
                onClick={onClick}
                style={style.container}>
                { !terminal ? this.renderToggle() : null }
                <decorators.Header
                    node={node}
                    style={style.header}
                    removeFile={this.props.removeFile}
                />
            </div>
        );
    }
    renderToggle(){
        const animations = this.props.animations;
        if(!animations){ return this.renderToggleDecorator(); }
        return (
            <VelocityComponent ref="velocity"
                duration={animations.toggle.duration}
                animation={animations.toggle.animation}>
                {this.renderToggleDecorator()}
            </VelocityComponent>
        );
    }
    renderToggleDecorator(){
        const {style, decorators} = this.props;
        return (<decorators.Toggle style={style.toggle}/>);
    }
}

Container.propTypes = {
    style: PropTypes.object.isRequired,
    decorators: PropTypes.object.isRequired,
    terminal: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    animations: PropTypes.oneOfType([
        PropTypes.object,
        PropTypes.bool
    ]).isRequired,
    node: PropTypes.object.isRequired,
    removeFile: PropTypes.func
};

export default {
    Loading,
    Toggle,
    Header,
    Container
};

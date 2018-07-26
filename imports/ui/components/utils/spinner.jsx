import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { omit } from '/imports/utils/Utils'
import classNames from 'classnames'

export default class Spinner extends Component {
    state = {
        hidden: true,
        paused: true
    }

    static propTypes = {
        visible: PropTypes.bool,
        withCover: PropTypes.bool,
        style: PropTypes.object
    }

    constructor(props) {
        super(props);
        this.timer = null;
    }

    componentDidMount() {
        if (this.state.visible && this.state.hidden)
            this.showAfterDelay()
    }

    componentWillUnmount() {
        if(this.timer) clearTimeout(this.timer)
    }

    componentWillReceiveProps(nextProps) {
        const hidden = !nextProps.visible;

        if(!this.state.hidden && hidden) {
            this.setState({hidden: true})
            this.pauseAfterDelay()
        } else if (this.state.hidden && !hidden) {
            this.showAfterDelay()
        }
    }

    pauseAfterDelay = () => {
        if(this.timer) clearTimeout(this.timer)

        this.timer = setTimeout(()=> {
            if (this.props.visible) return;
            this.setState({paused: true});
        },250);
    }

    showAfterDelay = () => {
        if(this.timer) clearTimeout(this.timer)

        this.timer = setTimeout(()=> {
            if(!this.props.visible) return;
            this.setState({paused: false, hidden: false});
        }, 300);
    }

    render() {
        if(this.props.withCover) {
            return this._renderDotsWithCover();
        } else {
            return this._renderSpinnerDots();
        }
    }


    _renderDotsWithCover = () => {
        const coverClasses = classNames({
            "spinner-cover": true,
            "hidden": this.state.hidden
        })

        const style = Object.assign({}, (this.props.style ? this.props.style : {}), {
            'position': 'absolute',
            'display': this.state.hidden ? "none" : "block",
            'top': '0',
            'left': '0',
            'width': '100%',
            'height': '100%',
            'background': 'rgba(255,255,255,0.9)',
            'zIndex': 1000
        });

        return (
            <div className={coverClasses} style={style}>
                {this._renderSpinnerDots()}
            </div>
        )
    }

    _renderSpinnerDots = () => {

        const spinnerClass = classNames({
            'spinner': true,
            'hidden': this.state.hidden,
            'paused': this.state.paused
        })

        const style = Object.assign({}, (this.props.style ? this.props.style : {}), {
            'position': 'absolute',
            'left': '45%',
            'top': '50%',
            'zIndex': 1001,
            'transform': 'translate(-50%,-50%)'
        });

        const otherProps = omit(this.props, Object.keys(this.constructor.propTypes));

        otherProps.visible = otherProps.visible ? 'true' : false;
        return (
            <div className={spinnerClass} {...otherProps} style={style}>
                <div className="bounce1"></div>
                <div className="bounce2"></div>
                <div className="bounce3"></div>
                <div className="bounce4"></div>
            </div>
        )
    }
}

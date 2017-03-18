import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';

export default class AutoFormWrapper extends Component {
    constructor() {
        super();
        this.renderWithData = (view, props, container) => {
            const { schema, id, type  } = props;
            if (view) Blaze.remove(view);
            return Blaze.renderWithData(Template.quickForm, {
                schema,
                id,
                type,
            }, container);
        };
    }

    componentWillUnmount() {
        Blaze.remove(this.view);
    }

    componentDidUpdate() {
        this.view = this.renderWithData(this.view, this.props, this.refs.container);
    }

    componentDidMount() {
        this.view = this.renderWithData(this.view, this.props, this.refs.container);
    }

    render() {
        return <div ref="container"/>;
    }
}


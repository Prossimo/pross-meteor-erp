import React, { Component } from 'react';
import Dropzone from 'react-dropzone';

class Files extends React.Component{
    constructor(props){
        super(props);
        this.onDrop = this.onDrop.bind(this);
        this.supportedMineTypes = [
            'application/vnd.google-apps.document',
        ]
    }

    onDrop() {

    }

    render() {
        return (
            <div className="invoices-inbox-tab">
                <Dropzone onDrop={this.onDrop} accept={['application/pdf']}/>
            </div>
        )
    }
}

export default Files;

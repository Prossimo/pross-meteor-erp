import React from 'react';
import Textarea from 'react-textarea-autosize';

class EmailSignature extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            text: '',
        }
    }

    changeText(event){
        this.setState({text: event.target.value})
    }

    render() {
        const { text } = this.state;
        return (
            <div className="email-signature">
                <Textarea
                          value={text}
                          onChange={this.changeText.bind(this)}/>
                <button className="btn primary-btn">{text ? 'Update' : 'Add'} signature</button>
            </div>
        )
    }
}

export default  EmailSignature;
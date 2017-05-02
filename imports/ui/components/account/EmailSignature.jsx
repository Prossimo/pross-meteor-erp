import React from 'react';
import Textarea from 'react-textarea-autosize';
import Alert from 'react-s-alert';
import BlockUi from 'react-block-ui';
import 'react-block-ui/style.css';
import { Loader, Types } from 'react-loaders';
import 'loaders.css/loaders.min.css';

class EmailSignature extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            text: props.user.profile.signature ? decodeURI(props.user.profile.signature) : '',
            blocking: false
        }
    }

    changeText(event){
        this.setState({text: event.target.value})
    }
    updateSignature(){
        const { text } = this.state;
        const self = this;
        function updateUserCustomFieldCb(err){
            self.setState({blocking: false})
            if(err)  {
                Alert.warning(`Cannot update signature, try again!`, {
                    position: 'bottom-right',
                    effect: 'bouncyflip',
                    timeout: 5000
                });
            }else{
                Alert.info(`Signature successful updated!`, {
                    position: 'bottom-right',
                    effect: 'bouncyflip',
                    timeout: 3500
                });
            }
        }
        if(text){
            this.setState({blocking: true})
            Meteor.call("updateUserProfileField", 'signature', encodeURI(text), updateUserCustomFieldCb)
        }
    }

    render() {
        const { text } = this.state;
        return (
            <BlockUi className="email-signature" tag="div" loader={<Loader active type="line-spin-fade-loader" color="#5b8bff"/>} blocking={this.state.blocking}>
                <Textarea rows={3}
                          placeholder="Enter text or html"
                          className="signature-textarea"
                          value={text}
                          onChange={this.changeText.bind(this)}/>
                <button onClick={this.updateSignature.bind(this)}
                        className="btnn primary-btn">Update signature</button>
            </BlockUi>
        )
    }
}

export default  EmailSignature;

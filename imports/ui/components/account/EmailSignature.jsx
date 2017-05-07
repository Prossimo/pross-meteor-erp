import React from 'react';
import Textarea from 'react-textarea-autosize';
import Alert from 'react-s-alert';


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
            this.props.toggleLoader(true)
            Meteor.call("updateUserProfileField", 'signature', encodeURI(text), updateUserCustomFieldCb)
        }
    }

    render() {
        const { text } = this.state;
        return (
            <div className="email-signature">
                <Textarea rows={3}
                          placeholder="Enter text or html"
                          className="signature-textarea"
                          value={text}
                          onChange={this.changeText.bind(this)}/>
                <button onClick={this.updateSignature.bind(this)}
                        className="btnn primary-btn">Update signature</button>
            </div>
        )
    }
}

export default  EmailSignature;

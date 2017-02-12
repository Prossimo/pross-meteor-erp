import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames from 'classnames';
import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from '../../../api/constants/roles';


class Popup extends React.Component{
    constructor(props){
        super(props);

    }

    hide(){
        const { hide } = this.props;
        if(typeof hide === 'function'){
            hide();
        }
    }

    render() {
        const { active, title, content } = this.props;
        if(active){
            return (
                <div className="popup-area">
                    <div className="popup-container">
                        <span onClick={this.hide.bind(this)} className="close-popup"/>
                        <header className="pop-head">
                            <h3 >{title ? title : ''}</h3>
                        </header>
                        <div className="body">
                            {content}
                        </div>
                    </div>
                </div>
            )
        }else{
            return null;
        }

    }
}
export default Popup;
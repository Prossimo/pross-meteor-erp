import React from 'react';
import {FlowRouter} from 'meteor/kadira:flow-router';
import classNames from 'classnames';
import { ADMIN_ROLE, SUPER_ADMIN_ROLE } from '../../../api/constatnts/roles';


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
        const { active } = this.props;
        if(active){
            return (
                <div className="popup-area">
                    <div className="popup-container">
                        <header className="pop-head">
                            <h3 >User data</h3>
                        </header>
                        <div className="body">
                            {this.props.content}
                        </div>
                        <footer className="pop-footer">
                            <button className="btn primary-btn">Ok</button>
                            <button onClick={this.hide.bind(this)} className="btn default-btn">Cancel</button>
                        </footer>
                    </div>
                </div>
            )
        }else{
            return null;
        }

    }
}
export default Popup;
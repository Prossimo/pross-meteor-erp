import React from 'react';
import { getUserName, getUserEmail, getUserRoles } from '../../../api/lib/filters';

class ContactInfo extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            username: props.username,
            firstName: props.user.profile.firstName || '',
            lastName: props.user.profile.lastName || '',
            socials: props.user.profile.socials,
            roles: props.roles,
        }

    }

    render() {
        const { firstName, lastName, username } = this.state;

        return (
           <div className="contact-info">
               <div className="username">
                   <span className="label">Username</span>
                   <input value={username} type="text"/>
                   <span className="value">{username}</span>
               </div>
               <div className="first-name">
                   <span className="label">Firs name</span>
                   <input value={firstName} type="text"/>
                   <span className="value">{firstName}</span>
               </div>
               <div className="last-name">
                   <span className="label">Last name</span>
                   <span>{lastName}</span>
                   <input value={lastName} type="text"/>
               </div>
               <div className="socials">
                   <div className="twitter"></div>
                   <div className="facebook"></div>
                   <div className="linkedIn"></div>
               </div>
               <div className="role"></div>
               <ul className="emails">
                   <li>
                       <span className="address">{}</span>
                       <span className="is-default"></span>
                   </li>
               </ul>
               <ul className="phone-numbers">
                   <li>
                       <span className="number"></span>
                       <span className="extension"></span>
                       <span className="type"></span>
                       <span className="is-default"></span>
                   </li>
               </ul>
               <div className="company">
                   <span className="name"></span>
                   <span className="position"></span>
               </div>
           </div>
        )
    }
}

export default  ContactInfo;
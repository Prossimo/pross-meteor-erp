import '../models/users/users';
import moment from 'moment';

module.exports = {
    getParticipantsNamesString: (participants, excludeMe=true)=>{
        const currentUser = Meteor.user();
        if(!currentUser) return;

        if(excludeMe) {
            const others = participants.filter((participant)=>{
                return participant.email != currentUser.email()
            });
            return others.map((participant)=>{return participant.name && participant.name.length ? participant.name : participant.email;}).join(', ');
        } else {
            return participants.map((participant)=>{return participant.name && participant.name.length ? participant.name : participant.email;}).join(', ');
        }
    },

    getParticipantsNamesArray: (participants, excludeMe=true)=>{
        const currentUser = Meteor.user();
        if(!currentUser) return;

        if(excludeMe) {
            const others = participants.filter((participant)=>{
                return participant.email != currentUser.email()
            });
            return others.map((participant)=>{return participant.name && participant.name.length ? participant.name : participant.email;});
        } else {
            return participants.map((participant)=>{return participant.name && participant.name.length ? participant.name : participant.email;});
        }
    },

    useFolder: ()=>{
        const currentUser = Meteor.user();
        if(!currentUser) return false;

        return currentUser.nylas && currentUser.nylas.organization_unit=='folder';
    },

    shortTimeString: (time) => {
        if(!time) return "";

        const diff = moment().diff(moment(time*1000), 'days', true);

        let format;
        if(diff <= 1) {
            format = "h:mm a";
        } else if(diff > 1 && diff <= 365) {
            format = "MMM d";
        } else {
            format = "MMM D YYYY";
        }
        format = "MMM D YYYY";
        return moment(time*1000).format(format);
    }
}
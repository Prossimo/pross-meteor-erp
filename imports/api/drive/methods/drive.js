import google from 'googleapis';
import config from '../../config/config';
import { googleServerApiAutToken } from '../../../api/server/functions';

const driveScopes = [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.appdata',
    'https://www.googleapis.com/auth/drive.apps.readonly'
];

let syncGoogleServerApiAutToken = Meteor.wrapAsync(googleServerApiAutToken);
let googleToken =  syncGoogleServerApiAutToken(driveScopes);

const OAuth2Client = google.auth.OAuth2;
const oauth2Client = new OAuth2Client(
    config.google.clientDriveId,
    config.google.clientDriveSecret,
    config.google.redirectUri);

oauth2Client.setCredentials({
    access_token: googleToken
});

export default google.drive({ version: 'v3', auth: oauth2Client });

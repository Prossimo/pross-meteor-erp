import google from 'googleapis';
import { prossDocDrive } from '../../config/config';

const { clientId, clientSecret, redirectUri, refreshToken } = prossDocDrive;
const OAuth2Client = google.auth.OAuth2;
const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
oauth2Client.setCredentials({
    refresh_token: refreshToken,
});

export default google.drive({ version: 'v3', auth: oauth2Client });

import { OAuth2Client } from 'google-auth-library';
import config from './constants.js';

const client = new OAuth2Client(config.googleClientId);

export default client;

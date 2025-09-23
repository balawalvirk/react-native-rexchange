import { fbConfig } from './config';
import * as functions from 'firebase-functions';

const sgMail = require('@sendgrid/mail');
const config =
  JSON.stringify(functions.config()) != '{}' ? functions.config() : fbConfig;
sgMail.setApiKey(config.sendgrid.key);

export default sgMail;

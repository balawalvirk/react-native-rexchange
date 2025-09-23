import axios from 'axios';
import * as functions from 'firebase-functions';
import { fbConfig } from './config';

const config =
  JSON.stringify(functions.config()) != '{}' ? functions.config() : fbConfig;
const HOME_JUNCTION_API_KEY = config.homejunction.key;
const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'Set-Cookie': 'HttpOnly;Secure;SameSite=Strict',
  Authorization: `Bearer ${HOME_JUNCTION_API_KEY}`,
};
export const homeJunctionClient = axios.create({
  baseURL: 'https://slipstream.homejunction.com/ws/',
  headers,
});

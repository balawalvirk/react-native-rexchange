import * as admin from 'firebase-admin';
import { firestore } from 'firebase-admin';

admin.initializeApp();

export const propertiesCollection = firestore().collection('properties');
export const positionsCollection = firestore().collection('thtls');
export const fpbsCollection = firestore().collection('fixedPriceBids');
export const rextimatePriceHistoriesCollection = firestore().collection('rextimatePriceHistories');

export default admin;

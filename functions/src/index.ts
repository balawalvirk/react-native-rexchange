import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import {
  calculateNewRextimate,
  createNewRextimatePrice,
  getProperty,
  pullModifiedProperties,
  pullPendingProperties,
  pullSoldProperties,
  sendErrorEmail,
  sendPropertiesEmail,
  setPropertyInFirebase,
  statusWasUpdated,
  updateFPBsWithPropertyStatus,
  updatePositionsWithPropertyStatus,
} from './functions';
import sgMail from './sendGrid';
import * as admin from 'firebase-admin';
import { fbConfig } from './config';
const config =
  JSON.stringify(functions.config()) != '{}' ? functions.config() : fbConfig;
import * as cors from 'cors';
const corsHandler = cors({ origin: true });

// export const pullNewPropertiesSinceYesterday = functions.pubsub
//   .schedule('0 0 * * *')
//   .timeZone('America/Costa_Rica')
//   .onRun(async () => {
//     try {
//       const propertiesResponse = await pullNewProperties();
//       const finalizedProperties = await getFinalizedForSaleProperties(
//         propertiesResponse,
//       );
//       for (const property of finalizedProperties) {
//         await setPropertyInFirebase(property);
//       }
//       sendPropertiesEmail(finalizedProperties, 'For Sale properties added');
//     } catch (error: any) {
//       sendErrorEmail(
//         'Error pulling For Sale properties since yesterday',
//         error,
//       );
//     } finally {
//       return Promise.resolve();
//     }
//   });

export const updatePendingPropertiesSinceYesterday = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('America/Costa_Rica')
  .onRun(async () => {
    try {
      const pendingPropertiesResponse = await pullPendingProperties();
      for (const property of pendingPropertiesResponse) {
        const existingProperty = await getProperty(property.id);
        if (existingProperty) {
          await setPropertyInFirebase(property);
        }
      }
      sendPropertiesEmail(
        pendingPropertiesResponse,
        'Pending properties updated',
      );
    } catch (error: any) {
      // TODO send an email if this fails
      // sentry?

      sendErrorEmail('Error pulling pending properties since yesterday', error);
    } finally {
      return Promise.resolve();
    }
  });

export const checkForUpdatesToForSaleProperties = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('America/Costa_Rica')
  .onRun(async () => {
    try {
      const modifiedProperties = await pullModifiedProperties();
      for (const property of modifiedProperties) {
        const existingProperty = await getProperty(property.id);
        if (existingProperty) {
          await setPropertyInFirebase(property);
        }
      }
      sendPropertiesEmail(modifiedProperties, 'Modified properties updated');
    } catch (error: any) {
      sendErrorEmail(
        'Error pulling modified properties since yesterday',
        error,
      );
    } finally {
      return Promise.resolve();
    }
  });

export const updateSoldPropertiesSinceYesterday = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('America/Costa_Rica')
  .onRun(async () => {
    try {
      const soldPropertiesResponse = await pullSoldProperties();
      for (const property of soldPropertiesResponse) {
        const existingProperty = await getProperty(property.id);
        if (existingProperty) {
          await setPropertyInFirebase(property);
        }
      }
      sendPropertiesEmail(soldPropertiesResponse, 'Sold properties updated');
    } catch (error: any) {
      sendErrorEmail('Error pulling Sold properties since yesterday', error);
    } finally {
      return Promise.resolve();
    }
  });

/**
 * When the status of a house changes, update all of the positions
 * and fixed price bids on that house to reflect the property's status
 */
export const updateTHTLsOnPropertyStatusUpdate = functions.firestore
  .document('properties/{propertyId}')
  .onUpdate(async (change) => {
    const beforeProperty = change.before.data() as any;
    const afterProperty = change.after.data() as any;

    if (statusWasUpdated(beforeProperty, afterProperty)) {
      await updatePositionsWithPropertyStatus(afterProperty);
      await updateFPBsWithPropertyStatus(afterProperty);
    }
  });

export const createNewRextimatePriceHistoryOnTHTLCreate = functions.firestore
  .document('thtls/{thtlId}')
  .onCreate(async (querySnapshot) => {
    const thtl = querySnapshot.data() as any;
    const isOpenHouse = thtl.isOpenHouse;
    if (thtl.type === 2) return;
    const newRextimate = await calculateNewRextimate(
      thtl.mlsId,
      thtl.type,
      isOpenHouse,
    );
    return createNewRextimatePrice(thtl.mlsId, newRextimate, isOpenHouse);
  });

export const onPropertyCreate = functions.firestore
  .document('properties/{propertyId}')
  .onCreate(async (querySnapshot) => {
    const property = querySnapshot.data() as any;
    await createNewRextimatePrice(property.id, property.listPrice, false);
    return createNewRextimatePrice(property.id, property.listPrice, true);
  });
export const sendOpenHouseEmail = functions.https.onRequest((req, res) => {
  const {
    query: { to, firstName, lastName, address },
  } = req;
  const msg = {
    to,
    from: 'info@rexchange.app',
    templateId: 'd-1799378cf8cd4c8281755e83b5a7c696',
    dynamicTemplateData: {
      firstName,
      lastName,
      address,
    },
  };

  sgMail.send(msg).then(
    () => {
      res.send('success!');
    },
    (error: any) => {
      res.send(error);
      console.error(error);

      if (error.response) {
        console.error(error.response.body);
        res.send(error.response.body);
      }
    },
  );
});

exports.deleteAllUsers = functions.https.onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === 'POST') {
      if (req.headers.authorization !== `Bearer ${config.admin_key.key}`) {
        res.status(403).send('Unauthorized');
        return;
      }
      const maxResults = 1000;
      let pageToken;

      do {
        try {
          const listUsersResult: any = await admin
            .auth()
            .listUsers(maxResults, pageToken);
          pageToken = listUsersResult.pageToken;

          const uids = listUsersResult.users.map((user: any) => user.uid);
          await Promise.all(
            uids.map((uid: string) => admin.auth().deleteUser(uid)),
          );

          if (!pageToken) break;
        } catch (error) {
          console.error('Error listing/deleting users', error);
          res.status(500).send('Internal Server Error');
          return;
        }
      } while (pageToken);

      res.send('All users have been deleted.');
      res.status(200).send('POST request received');
    } else {
      res.status(405).send('Method Not Allowed');
    }
  });
});

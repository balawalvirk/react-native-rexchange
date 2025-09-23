import { AxiosResponse } from 'axios';
import { homeJunctionClient } from './axios';
import {
  fpbsCollection,
  positionsCollection,
  propertiesCollection,
  rextimatePriceHistoriesCollection,
} from './firebase';
import sgMail from './sendGrid';
import { yesterday } from './yesterday';

export const pullNewProperties = async (): Promise<any[]> => {
  const properties = await homeJunctionClient
    .get(
      `listings/search?market=GSREIN&listingType=residential&status=active&propertyType=detached&listingDate=>=${yesterday}&listPrice=250000:700000&address.zip=70119,70118,70122,70124,70115&images=true&pageSize=1000&extended=true&details=true&features=true`,
    )
    .then((res: AxiosResponse) => res.data.result.listings);
  return properties;
};
export const pullModifiedProperties = async (): Promise<any[]> => {
  const properties = await homeJunctionClient
    .get(
      `listings/search?market=GSREIN&listingType=residential&status=active&propertyType=detached&modifiedDate=>=${yesterday}&listPrice=250000:700000&address.zip=70119,70118,70122,70124,70115&images=true&pageSize=1000&extended=true&details=true&features=true`,
    )
    .then((res: AxiosResponse) => res.data.result.listings);
  return properties;
};

export const getFinalizedForSaleProperties = async (
  properties: any[],
): Promise<any[]> => {
  const finalizedProperties = [];
  for (const property of properties) {
    const hasRightQuality = isNewOrExcellent(property) && hasImages(property);
    if (hasRightQuality) {
      const propertyWithInitializedData = getFormattedForSaleProperty(property);
      finalizedProperties.push(propertyWithInitializedData);
    }
  }

  return finalizedProperties;
};

export const pullPendingProperties = async (): Promise<any[]> => {
  const properties = await homeJunctionClient
    .get(
      `listings/search?market=GSREIN&listingType=residential&status=Pending&propertyType=detached&pageSize=1000&listPrice=250000:700000&address.zip=70119,70118,70122,70124,70115`,
    )
    .then((res: AxiosResponse) => res.data.result.listings);
  return properties;
};

export const pullSoldProperties = async (): Promise<any[]> => {
  const properties = await homeJunctionClient
    .get(
      `sales/search?market=GSREIN&saleDate=>=${yesterday}&zip=70119,70118,70122,70124,70115&propertyType=single&pageSize=1000`,
    )
    .then((res: AxiosResponse) => res.data.result.sales);
  return properties;
};

export const isNewOrExcellent = (property: any): boolean => {
  const conditionArray = property.xf_propertycondition;
  for (let i = 0; i < conditionArray.length; i++) {
    const condition = conditionArray[i].toLowerCase();
    if (
      condition.includes('new') ||
      condition.includes('excellent') ||
      condition.includes('very good')
    ) {
      return true;
    }
  }

  return false;
};

const hasImages = (property: any): boolean => {
  return property.imageCount > 0;
};

const getFormattedForSaleProperty = (property: any): any => {
  const formattedProperty = {
    ...property,
    isActive: true,
    deleted: false,
    zipCode: property?.address?.zip,
    deliveryLine: property?.address?.deliveryLine,
    city: property?.address?.city,
    state: property?.address?.state,
    street: property?.address?.street,
    dateCreated: new Date(),
    offMarket: false,
    isOpenHouse: false,
  };
  return formattedProperty;
};

export const setPropertyInFirebase = async (property: any) => {
  try {
    const formattedProperty = getFormattedForSaleProperty(property);
    await propertiesCollection
      .doc(property.id)
      .set(formattedProperty, { merge: true });
    // TODO make sure new rextimate is created here
  } catch (error) {
    // TODO send an email if this fails
    // sentry?
    console.log(JSON.stringify(error));
  }
};

export const getProperty = async (id: string): Promise<any> => {
  const property = await propertiesCollection
    .doc(id)
    .get()
    .then((res: FirebaseFirestore.DocumentSnapshot) => res?.data());
  return property;
};

export const statusWasUpdated = (
  beforeProperty: any,
  afterProperty: any,
): boolean => {
  return (
    beforeProperty.status != afterProperty.status ||
    beforeProperty.isGameHouse != afterProperty.isGameHouse
  );
};

export const updatePositionsWithPropertyStatus = async (property: any) => {
  const querySnapshot = await positionsCollection
    .where('mlsId', '==', property.id)
    .get();

  const positions = [...querySnapshot.docs];
  for (const position of positions) {
    await setPositionInFirebase(
      {
        ...position.data(),
        propertyStatus: property.status,
        isOpenHouse: property.isOpenHouse,
        isGameHouse: property.isGameHouse,
      },
      position.ref.id,
    );
  }
};
export const updateFPBsWithPropertyStatus = async (property: any) => {
  const querySnapshot = await fpbsCollection
    .where('mlsId', '==', property.id)
    .get();

  const fpbs = [...querySnapshot.docs];
  for (const bid of fpbs) {
    await setFPBInFirebase(
      {
        ...bid.data(),
        propertyStatus: property.status,
        isOpenHouse: property.isOpenHouse,
        isGameHouse: property.isGameHouse,
      },
      bid.ref.id,
    );
  }
};

export const setPositionInFirebase = async (position: any, id: string) => {
  return await positionsCollection.doc(id).set(position, { merge: true });
};

export const setFPBInFirebase = async (fpb: any, id: string) => {
  return await fpbsCollection.doc(id).set(fpb, { merge: true });
};

export const calculateNewRextimate = async (
  mlsId: string,
  type: number,
  isOpenHouse: boolean,
) => {
  const tooHighPositions = await positionsCollection
    .where('type', '==', 1)
    .where('mlsId', '==', mlsId)
    .where('isOpenHouse', '==', isOpenHouse)
    .get()
    .then((res: FirebaseFirestore.QuerySnapshot) => res.docs);
  const tooLowPositions = await positionsCollection
    .where('type', '==', 0)
    .where('mlsId', '==', mlsId)
    .where('isOpenHouse', '==', isOpenHouse)
    .get()
    .then((res: FirebaseFirestore.QuerySnapshot) => res.docs);
  const justRightPositions = await positionsCollection
    .where('type', '==', 2)
    .where('mlsId', '==', mlsId)
    .where('isOpenHouse', '==', isOpenHouse)
    .get()
    .then((res: FirebaseFirestore.QuerySnapshot) => res.docs);
  const currentRextimate = await getCurrentRextimate(mlsId, isOpenHouse);
  const direction = type === 0 ? 1 : type === 1 ? -1 : 0;
  const newRextimate = Math.round(
    currentRextimate +
      (currentRextimate * direction) /
        (100 +
          tooHighPositions.length +
          tooLowPositions.length +
          justRightPositions.length),
  );

  return newRextimate;
};

const getCurrentRextimate = async (
  mlsId: string,
  isOpenHouse: boolean,
): Promise<number> => {
  const currentRextimate = await rextimatePriceHistoriesCollection
    .where('mlsId', '==', mlsId)
    .where('isOpenHouse', '==', isOpenHouse)
    .limit(1)
    .orderBy('dateCreated', 'desc')
    .get()
    .then((res: FirebaseFirestore.QuerySnapshot) => res.docs[0]?.data().amount);
  return currentRextimate;
};

export const createNewRextimatePrice = async (
  mlsId: string,
  amount: number,
  isOpenHouse: boolean,
) => {
  return rextimatePriceHistoriesCollection.add({
    amount,
    mlsId,
    dateCreated: Date.now(),
    isOpenHouse,
  });
};

export const sendPropertiesEmail = async (
  properties: any[],
  subject: string,
) => {
  if (!properties.length) return;

  const fullProperties = [];
  for (const prop of properties) {
    const property = await getProperty(prop.id);
    fullProperties.push(property);
  }
  const html = `
  <h1>${subject}: ${new Date().toDateString()}</h1>
  ${fullProperties?.map((property) => {
    return `
      <h2>${property.deliveryLine || property?.address?.deliveryLine}</h2>
      <a href="https://rexchange-bfb0a.web.app/c/properties/${
        property.id
      }">View in CMS</a>
      <ul>
        <li>MLSID: ${property.id}</li>
        <li>List Price: ${property.listPrice}</li>
        <li>Listing Office: ${property.listingOffice?.name}</li>
        <li>Statue: ${property.status}</li>
      </ul>
        `;
  })}

`;

  const msg = {
    to: [
      'nina@wherewego.org',
      'Ben@rexchange.app',
      'kcb@rexchange.app',
      'karla@rexchange.app',
    ],
    from: 'nina@wherewego.org',
    subject,
    html,
  };
  sgMail.send(msg);
};

export const sendErrorEmail = (subject: string, error: Error) => {
  const html = `
  <h1>${subject}: ${new Date().toDateString()}</h1>
  <p>${error.message}</p>
  <p>${JSON.stringify(error)}</p>
`;
  const msg = {
    to: 'nina@wherewego.org',
    from: 'nina@wherewego.org',
    html,
    subject,
  };
  sgMail.send(msg);
};

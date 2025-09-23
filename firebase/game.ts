import {
  getFirestore,
  query,
  where,
  orderBy,
  collection,
  getDocsFromServer,
} from 'firebase/firestore';
import _ from 'lodash';
import { Property } from '../lib/models/property';

export type Skip = { zipCode: string; mlsId: string };

export const getPropertiesForGame = async (): Promise<Property[]> => {
  try {
    let q;
    q = query(
      collection(getFirestore(), 'properties'),
      where('status', '==', 'Active'),
      where('isGameHouse', '==', true),
      orderBy('dateCreated', 'desc'),
    );

    const querySnapshot = await getDocsFromServer(q).catch((err) =>
      console.log(err),
    );
    const properties = querySnapshot?.docs?.map((doc: any) => {
      const property = doc.data() as Property;
      property.docSnapshot = doc;
      return property;
    });

    return properties || [];
  } catch (err) {
    console.log(JSON.stringify(err));
  }
  return [];
};

export const getQueuedProperties = async (
  notInMLSIds: string[],
): Promise<Property[]> => {
  const allProperties = await getPropertiesForGame();
  const filteredProperties = allProperties.filter(
    (prop) => !notInMLSIds.includes(prop.id),
  );

  return filteredProperties;
};

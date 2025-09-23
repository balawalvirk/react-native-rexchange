import {
  collection,
  doc,
  DocumentSnapshot,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  where,
} from 'firebase/firestore';
import { Property } from '../../lib/models/property';
import * as _ from 'lodash';

export const getProperties = async (mlsIds?: string[]): Promise<Property[]> => {
  query(collection(getFirestore(), 'properties'));
  let q = query(collection(getFirestore(), 'properties'));

  if (mlsIds) {
    q = query(
      collection(getFirestore(), 'properties'),
      where('id', 'in', mlsIds),
    );
  }
  const querySnapshot = await getDocs(q);
  const properties = _.map(
    querySnapshot.docs,
    (doc: DocumentSnapshot) => doc.data() as Property,
  );
  return properties;
};

export const getProperty = async (mlsId: string): Promise<Property> => {
  const docref = doc(getFirestore(), 'properties', mlsId);
  const _doc = await getDoc(docref);
  return _doc.data() as Property;
};

export const getOpenHouseProperties = async (): Promise<Property[]> => {
  let q = query(
    collection(getFirestore(), 'properties'),
    where('isOpenHouse', '==', true),
    where('status', '==', 'Active'),
    limit(100),
  );
  const querySnapshot = await getDocs(q);
  const properties = _.map(
    querySnapshot.docs,
    (doc: DocumentSnapshot) => doc.data() as Property,
  );
  return properties;
};

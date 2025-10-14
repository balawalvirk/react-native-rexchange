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
  let q = query(collection(getFirestore(), 'properties'), where('status', 'in', ['Active', 'active']));

  if (mlsIds) {
    q = query(
      collection(getFirestore(), 'properties'),
      where('id', 'in', mlsIds),
      where('status', 'in', ['Active', 'active']),
    );
  }
  const querySnapshot = await getDocs(q);
  const properties = _.map(
    querySnapshot.docs,
    (doc: DocumentSnapshot) => doc.data() as Property,
  );
  
  return properties;
};

export const getProperty = async (mlsId: string): Promise<Property | null> => {
  try {
    const docref = doc(getFirestore(), 'properties', mlsId);
    const _doc = await getDoc(docref);
    
    if (!_doc.exists()) {
      return null;
    }
    
    const property = _doc.data() as Property;
    
    // Only return if status is Active or active
    if (property.status !== 'Active' && property.status !== 'active') {
      return null;
    }
    
    return property;
  } catch (error) {
    console.error(`Error fetching property ${mlsId}:`, error);
    return null;
  }
};

export const getOpenHouseProperties = async (): Promise<Property[]> => {
  let q = query(
    collection(getFirestore(), 'properties'),
    where('isOpenHouse', '==', true),
    where('status', 'in', ['Active', 'active']),
    limit(100),
  );
  const querySnapshot = await getDocs(q);
  const properties = _.map(
    querySnapshot.docs,
    (doc: DocumentSnapshot) => doc.data() as Property,
  );
  
  return properties;
};

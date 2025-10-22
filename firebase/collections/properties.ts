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
  
  if (!mlsIds || mlsIds.length === 0) {
    let q = query(collection(getFirestore(), 'properties'), where('status', 'in', ['Active', 'active']));
    const querySnapshot = await getDocs(q);
    const properties = _.map(
      querySnapshot.docs,
      (doc: DocumentSnapshot) => doc.data() as Property,
    );
    return properties;
  }

  // Firebase has a limit of 30 items in 'in' queries, so we need to batch them
  const BATCH_SIZE = 20; // Keep well under 30 to be safe
  const allProperties: Property[] = [];
  
  for (let i = 0; i < mlsIds.length; i += BATCH_SIZE) {
    const batch = mlsIds.slice(i, i + BATCH_SIZE);
    
    try {
      // Use a single status filter to avoid disjunction issues
      const q = query(
        collection(getFirestore(), 'properties'),
        where('id', 'in', batch),
        where('status', '==', 'Active'), // Use single status instead of 'in'
      );
      const querySnapshot = await getDocs(q);
      const batchProperties = _.map(
        querySnapshot.docs,
        (doc: DocumentSnapshot) => doc.data() as Property,
      );
      
      // Also check for lowercase 'active' in memory as fallback
      const activeProperties = batchProperties.filter(
        property => property.status === 'Active' || property.status === 'active'
      );
      
      allProperties.push(...activeProperties);
    } catch (error) {
      // Continue with next batch instead of failing completely
    }
  }
  
  return allProperties;
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

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
import { validatePropertyBidData } from '../lib/helpers/display';

export type Skip = { zipCode: string; mlsId: string };

export const getPropertiesForGame = async (): Promise<Property[]> => {
  try {
    // Get properties for the game

    // Now check properties with only status filter
    // Get properties with status=Active
    const statusQuery = query(
      collection(getFirestore(), 'properties'),
      where('status', '==', 'Active')
    );
    const statusSnapshot = await getDocsFromServer(statusQuery).catch((err) =>
      console.log('Error fetching status filtered properties:', err),
    );
    
    // Properties with status=Active loaded

    // Now check properties with only isGameHouse filter
    // Get properties with isGameHouse=true
    const gameHouseQuery = query(
      collection(getFirestore(), 'properties'),
      where('isGameHouse', '==', true)
    );
    const gameHouseSnapshot = await getDocsFromServer(gameHouseQuery).catch((err) =>
      console.log('Error fetching isGameHouse filtered properties:', err),
    );
    
    // Properties with isGameHouse=true loaded

    // Check properties with isGameHouse=false
    // Get properties with isGameHouse=false
    const gameHouseFalseQuery = query(
      collection(getFirestore(), 'properties'),
      where('isGameHouse', '==', false)
    );
    const gameHouseFalseSnapshot = await getDocsFromServer(gameHouseFalseQuery).catch((err) =>
      console.log('Error fetching isGameHouse=false filtered properties:', err),
    );
    
    // Properties with isGameHouse=false loaded

    // Check properties with both true and false
    // Get properties with isGameHouse in [true, false]
    const gameHouseBothQuery = query(
      collection(getFirestore(), 'properties'),
      where('isGameHouse', 'in', [true, false])
    );
    const gameHouseBothSnapshot = await getDocsFromServer(gameHouseBothQuery).catch((err) =>
      console.log('Error fetching isGameHouse in [true,false] filtered properties:', err),
    );
    
    // Properties with isGameHouse in [true,false] loaded

    // Modified query to include both true and false isGameHouse values
    let q;
    q = query(
      collection(getFirestore(), 'properties'),
      where('status', 'in', ['Active', 'active']),
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

    // Validate bid data for each property
    properties?.forEach((property) => {
      validatePropertyBidData(property, property.id);
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

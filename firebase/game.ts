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
    // First, get ALL properties to see what's in the database
    console.log('=== DEBUGGING: ALL PROPERTIES IN DATABASE ===');
    const allPropertiesQuery = query(collection(getFirestore(), 'properties'));
    const allPropertiesSnapshot = await getDocsFromServer(allPropertiesQuery).catch((err) =>
      console.log('Error fetching all properties:', err),
    );
    
    console.log(`Total properties in database: ${allPropertiesSnapshot?.docs?.length || 0}`);
    
    // Log all properties with their status and isGameHouse values
    allPropertiesSnapshot?.docs?.forEach((doc, index) => {
      const data = doc.data();
      console.log(`${index + 1}. ID: ${data.id}, Status: ${data.status}, isGameHouse: ${data.isGameHouse}, Name: ${data.fullListingAddress || 'No name'}, Price: $${data.listPrice || 'N/A'}`);
    });

    // Now check properties with only status filter
    console.log('=== DEBUGGING: PROPERTIES WITH STATUS=Active ===');
    const statusQuery = query(
      collection(getFirestore(), 'properties'),
      where('status', '==', 'Active')
    );
    const statusSnapshot = await getDocsFromServer(statusQuery).catch((err) =>
      console.log('Error fetching status filtered properties:', err),
    );
    
    console.log(`Properties with status=Active: ${statusSnapshot?.docs?.length || 0}`);

    // Now check properties with only isGameHouse filter
    console.log('=== DEBUGGING: PROPERTIES WITH isGameHouse=true ===');
    const gameHouseQuery = query(
      collection(getFirestore(), 'properties'),
      where('isGameHouse', '==', true)
    );
    const gameHouseSnapshot = await getDocsFromServer(gameHouseQuery).catch((err) =>
      console.log('Error fetching isGameHouse filtered properties:', err),
    );
    
    console.log(`Properties with isGameHouse=true: ${gameHouseSnapshot?.docs?.length || 0}`);

    // Check properties with isGameHouse=false
    console.log('=== DEBUGGING: PROPERTIES WITH isGameHouse=false ===');
    const gameHouseFalseQuery = query(
      collection(getFirestore(), 'properties'),
      where('isGameHouse', '==', false)
    );
    const gameHouseFalseSnapshot = await getDocsFromServer(gameHouseFalseQuery).catch((err) =>
      console.log('Error fetching isGameHouse=false filtered properties:', err),
    );
    
    console.log(`Properties with isGameHouse=false: ${gameHouseFalseSnapshot?.docs?.length || 0}`);

    // Check properties with both true and false
    console.log('=== DEBUGGING: PROPERTIES WITH isGameHouse IN [true, false] ===');
    const gameHouseBothQuery = query(
      collection(getFirestore(), 'properties'),
      where('isGameHouse', 'in', [true, false])
    );
    const gameHouseBothSnapshot = await getDocsFromServer(gameHouseBothQuery).catch((err) =>
      console.log('Error fetching isGameHouse in [true,false] filtered properties:', err),
    );
    
    console.log(`Properties with isGameHouse in [true,false]: ${gameHouseBothSnapshot?.docs?.length || 0}`);

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

    // Console log properties from API and validate bid data
    console.log('=== PROPERTIES FROM API (FINAL RESULT) ===');
    console.log(`Total properties: ${properties?.length || 0}`);
    properties?.forEach((property, index) => {
      console.log(`${index + 1}. ID: ${property.id}, Name: ${property.fullListingAddress || 'No name'}, Price: $${property.listPrice || 'N/A'}`);
      // Validate bid data for each property
      validatePropertyBidData(property, property.id);
    });
    console.log('=== END PROPERTIES FROM API ===');

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

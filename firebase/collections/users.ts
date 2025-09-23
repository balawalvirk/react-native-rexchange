import {
  getDocs,
  getFirestore,
  where,
  query,
  collection,
  setDoc,
  doc,
  addDoc,
  deleteDoc,
} from 'firebase/firestore';
import { RXCUser } from '../../lib/models/rxcUser';

export const getUser = async (uid: string): Promise<RXCUser> => {
  const querySnapshot = await getDocs(
    query(collection(getFirestore(), 'users'), where('id', '==', uid)),
  );

  const rxcUser = (querySnapshot.docs[0].data() as RXCUser) || ({} as RXCUser);
  rxcUser.docId = querySnapshot.docs[0].ref.id;
  return rxcUser;
};

export const updateUser = async (
  docId: string = '',
  props: any,
): Promise<any> => {
  const userRef = doc(getFirestore(), 'users', docId);
  return setDoc(userRef, props, { merge: true });
};

export const addUser = async (rxcUser: any) => {
  return addDoc(collection(getFirestore(), 'users'), rxcUser);
};

export const deleteUserData = async (userId: string, docId: string) => {
  try {
    // Delete user document from Firestore
    const userRef = doc(getFirestore(), 'users', docId);
    await deleteDoc(userRef);
    
    // You might also want to delete related data like positions, etc.
    // Add more delete operations here if needed
    
    console.log('User data deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting user data:', error);
    throw error;
  }
};

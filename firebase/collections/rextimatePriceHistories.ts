import {
  collection,
  DocumentSnapshot,
  getDocs,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import _ from 'lodash';
import { RextimatePriceHistory } from '../../lib/models/rextimatePriceHistory';

export const getRextimatePriceHistories = async (
  mlsId: string,
  isOpenHouse = false,
): Promise<RextimatePriceHistory[]> => {
  const querySnapshot = await getDocs(
    query(
      collection(getFirestore(), 'rextimatePriceHistories'),
      where('mlsId', '==', mlsId),
      where('isOpenHouse', '==', isOpenHouse),
      orderBy('dateCreated', 'asc'),
    ),
  );
  const rextimatePriceHistories = querySnapshot.docs.map(
    (doc: DocumentSnapshot) => doc.data() as RextimatePriceHistory,
  );
  return rextimatePriceHistories;
};

export const getCurrentRextimateSnapshot = async (
  mlsId: string,
  onNext: (snapshot: any) => void,
  isOpenHouse: boolean = false,
) => {
  try {
    const q = query(
      collection(getFirestore(), 'rextimatePriceHistories'),
      where('mlsId', '==', mlsId),
      where('isOpenHouse', '==', isOpenHouse),
      orderBy('dateCreated', 'desc'),
      limit(1),
    );

    return onSnapshot(q, (snapshot) => {
      onNext(snapshot);
    });
  } catch (error) {
    console.error('Error in getCurrentRextimateSnapshot:', error);
  }
};

export const getRextimatePriceHistoriesSnapshot = async (
  mlsId: string,
  onNext: (snapshot: any) => void,
) => {
  try {
    const q = query(
      collection(getFirestore(), 'rextimatePriceHistories'),
      where('mlsId', '==', mlsId),
    );

    return onSnapshot(q, onNext);
  } catch (error) {
    console.error('Error in getRextimatePriceHistoriesSnapshot:', error);
  }
};

export const getCurrentRextimate = async (
  mlsId: string,
): Promise<RextimatePriceHistory> => {
  const q = query(
    collection(getFirestore(), 'rextimatePriceHistories'),
    where('mlsId', '==', mlsId),
    orderBy('dateCreated', 'desc'),
    limit(1),
  );

  const querySnapshot = await getDocs(q);
  const rph = querySnapshot.docs[0].data() as RextimatePriceHistory;
  return rph;
};

export const updateAllRPHs = async () => {
  const q = query(collection(getFirestore(), 'rextimatePriceHistories'));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const rph = doc.data();
    if (!rph.isOpenHouse) {
      updateDoc(doc.ref, { isOpenHouse: false });
    }
  });
};

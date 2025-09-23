import {
  getFirestore,
  query,
  collection,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  getDocs,
  updateDoc,
} from 'firebase/firestore';
import { FixedPriceBid } from '../../lib/models/fixedPriceBids';
import { RXCUser } from '../../lib/models/rxcUser';

export const getFixedPriceBidsSnapshot = async (
  userId: string,
  mlsId: string,
  onNext: (snapshot: any) => void,
  isOpenHouse: boolean = false,
) => {
  const q = query(
    collection(getFirestore(), 'fixedPriceBids'),
    where('userId', '==', userId),
    where('mlsId', '==', mlsId),
    where('isOpenHouse', '==', isOpenHouse),
    orderBy('dateCreated', 'desc'),
  );
  return onSnapshot(q, onNext);
};

export const getFixedPriceBid = async (userId: string, mlsId: string) => {
  const q = query(
    collection(getFirestore(), 'fixedPriceBids'),
    where('userId', '==', userId),
    where('mlsId', '==', mlsId),
    orderBy('dateCreated', 'desc'),
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs[0]?.data() as FixedPriceBid;
};
export const recordFixedPriceBid = async (
  amount: number,
  user: RXCUser | null,
  mlsId: string,
  isOpenHouse = false,
) => {
  await addDoc(collection(getFirestore(), 'fixedPriceBids'), {
    amount: amount,
    userId: user?.id,
    mlsId,
    dateCreated: new Date(),
    isOpenHouse,
  });
};

export const updateAllFPBs = async () => {
  const q = query(collection(getFirestore(), 'fixedPriceBids'));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const fpb = doc.data();
    if (!fpb.isOpenHouse) {
      updateDoc(doc.ref, { isOpenHouse: false });
    }
  });
};

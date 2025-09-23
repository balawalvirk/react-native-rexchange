import { Unsubscribe } from 'firebase/auth';
import {
  addDoc,
  collection,
  DocumentSnapshot,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import _ from 'lodash';
import { Position } from '../../lib/models/positions';
import { RXCUser } from '../../lib/models/rxcUser';
import * as Sentry from '@sentry/react-native';

export const getPositions = async (
  userId: string,
  mlsId: string,
): Promise<Position[]> => {
  const querySnapshot = await getDocs(
    query(
      collection(getFirestore(), 'thtls'),
      where('userId', '==', userId),
      where('mlsId', '==', mlsId),
      where('isGameHouse', '==', true),
      orderBy('dateCreated', 'desc'),
    ),
  );
  const positions = _.map(
    querySnapshot.docs,
    (doc: DocumentSnapshot) => doc.data() as Position,
  );
  return positions;
};

export const getPositionsSnapshot = async (
  userId: string,
  mlsId: string,
  onNext: (snapshot: any) => void,
  isOpenHouse: boolean = false,
) => {
  const q = query(
    collection(getFirestore(), 'thtls'),
    where('userId', '==', userId),
    where('mlsId', '==', mlsId),
    where('isOpenHouse', '==', isOpenHouse),
    orderBy('dateCreated', 'desc'),
  );
  return onSnapshot(q, onNext);
};

export const getPositionsSinceMidnightSnapshot = async (
  userId: string,
  mlsId: string,
  onNext: (snapshot: any) => void,
) => {
  try {
    const today = new Date();
    today.setSeconds(0);
    const q = query(
      collection(getFirestore(), 'properties'),
      where('userId', '==', userId),
      where('mlsId', '==', mlsId),
      where('isGameHouse', '==', true),
      where('dateCreated', '>=', today),
    );
    return onSnapshot(q, onNext);
  } catch (error) {
    Sentry.captureException(error, {
      tags: {
        userId,
        mlsId,
      },
    });
  }
};

export const getNumJustRightSnapshot = async (
  mlsId: string,
  onNext: (snapshot: any) => void,
) => {
  try {
    const q = query(
      collection(getFirestore(), 'thtls'),
      where('mlsId', '==', mlsId),
      where('type', '==', 2),
      where('isGameHouse', '==', true),
      orderBy('dateCreated', 'desc'),
    );
    return onSnapshot(q, onNext);
  } catch (error) {
    console.log(JSON.stringify(error));
  }
};

export const getNumJustRight = async (mlsId: string) => {
  const q = query(
    collection(getFirestore(), 'thtls'),
    where('mlsId', '==', mlsId),
    where('type', '==', 2),
    where('isGameHouse', '==', true),
    orderBy('dateCreated', 'desc'),
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.length;
};
export const recordAPosition = async (
  type: 0 | 1 | 2,
  user: RXCUser | null,
  currentRextimateAmount: number,
  mlsId: string,
  isOpenHouse = false,
) => {
  try {
    await addDoc(collection(getFirestore(), 'thtls'), {
      type,
      userId: user?.id,
      rextimate: currentRextimateAmount,
      mlsId,
      dateCreated: new Date(),
      propertyStatus: 'Active',
      isOpenHouse,
      isGameHouse: !isOpenHouse,
    });
  } catch (err) {
    Sentry.captureException(err, {
      tags: { userId: user?.id, function: 'recordAPosition' },
    });
    console.log('record a postion', user);
    console.log(JSON.stringify(err));
  }
};

export const positionsSinceMidnightSnapshot = (
  userId: string,
  onNext: (args: any) => any,
): Unsubscribe => {
  const midnight = new Date(new Date().setHours(0, 0, 0, 0));
  const q = query(
    collection(getFirestore(), 'thtls'),
    where('userId', '==', userId),
    where('propertyStatus', '==', 'Active'),
    where('dateCreated', '>=', midnight),
    where('isGameHouse', '==', true),
    orderBy('dateCreated', 'desc'),
  );
  return onSnapshot(q, onNext);
};

export const getUniqMLSIdsForOpenPositions = async (userId: string = '') => {
  const midnight = new Date(new Date().setHours(0, 0, 0, 0));
  const afterMidnightQ = query(
    collection(getFirestore(), 'thtls'),
    where('userId', '==', userId),
    where('propertyStatus', '==', 'Active'),
    where('dateCreated', '>=', midnight),
    where('isGameHouse', '==', true),
    orderBy('dateCreated', 'desc'),
  );
  const beforeMidnightQ = query(
    collection(getFirestore(), 'thtls'),
    where('userId', '==', userId),
    where('propertyStatus', '==', 'Active'),
    where('dateCreated', '<=', midnight),
    where('isGameHouse', '==', true),
    orderBy('dateCreated', 'desc'),
  );

  const afterMidnightSnapshot = await getDocs(afterMidnightQ);
  const beforeMidnightSnapshot = await getDocs(beforeMidnightQ);
  const mlsIdsOfAfterMidnight = _.uniq(
    _.map(afterMidnightSnapshot.docs, (doc) => doc.data().mlsId),
  );
  const mlsIdsOfBeforeMidnight = _.difference(
    _.uniq(_.map(beforeMidnightSnapshot.docs, (doc) => doc.data().mlsId)),
    mlsIdsOfAfterMidnight,
  );

  const positions = [...mlsIdsOfBeforeMidnight, ...mlsIdsOfAfterMidnight];
  return positions;
};
export const getUniqMLSIdsForClosedPositions = async (userId: string = '') => {
  const q = query(
    collection(getFirestore(), 'thtls'),
    where('userId', '==', userId),
    where('propertyStatus', '!=', 'Active'),
    where('isGameHouse', '==', true),
    orderBy('propertyStatus', 'asc'),
    orderBy('dateCreated', 'desc'),
  );

  const querySnapshot = await getDocs(q);

  const positions = [
    ..._.uniq(_.map(querySnapshot.docs, (doc) => doc.data().mlsId)),
  ];

  return positions;
};

export const getAllPositionsForUserSnapshot = (
  userId: string = '',
  onNext: (args: any) => any,
): Unsubscribe => {
  const q = query(
    collection(getFirestore(), 'thtls'),
    where('userId', '==', userId),
    where('isGameHouse', '==', true),
  );

  return onSnapshot(q, onNext);
};

export const updateAllPositions = async () => {
  const q = query(collection(getFirestore(), 'thtls'));

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    const position = doc.data();
    if (!position.isOpenHouse) {
      updateDoc(doc.ref, { isOpenHouse: false });
    }
  });
};

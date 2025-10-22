import {
  getNumJustRightSnapshot,
  getPositionsSnapshot,
} from './collections/positions';
import { getFixedPriceBidsSnapshot } from './collections/fixedPriceBids';
import { Position } from '../lib/models/positions';
import { FixedPriceBid } from '../lib/models/fixedPriceBids';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { DocumentSnapshot, QuerySnapshot } from '@google-cloud/firestore';
import { getCurrentRextimateSnapshot } from './collections/rextimatePriceHistories';
import { RextimatePriceHistory } from '../lib/models/rextimatePriceHistory';
import {
  getFixedPriceBidEquity,
  getPositionEquity,
  isSinceMidnight,
} from '../lib/helpers/calculations';
import { useAuth } from '../providers/authProvider';
import { RXCUser } from '../lib/models/rxcUser';
import { Unsubscribe } from 'firebase/auth';

type RXCState = {
  equity: number;
  positions: Position[];
  fixedPriceBid: FixedPriceBid | null;
  currentRextimate: RextimatePriceHistory;
  numJustRight: number;
  positionSinceMidnight: Position | null;
};

export const useEquity = (
  mlsId: string = '',
  listPrice: number = 0,
  salePrice?: number,
  isOpenHouse?: boolean,
): RXCState => {
  const [positions, setPositions] = useState([] as Position[]);
  const [equity, setEquity] = useState(0);
  const [fixedPriceBid, setFixedPriceBid] = useState<FixedPriceBid | null>(
    null,
  );
  const [fixedPriceBids, setFixedPriceBids] = useState<FixedPriceBid[]>([]);
  const [currentRextimate, setCurrentRextimate] = useState({
    amount: listPrice || 0,
  } as RextimatePriceHistory);
  const [numJustRight, setNumJustRight] = useState(0);
  const [positionSinceMidnight, setPositionSinceMidnight] =
    useState<Position | null>(null);
  const { user } = useAuth();
  const userId = user ? (user as RXCUser).id : null;
  useEffect(() => {
    calculateEquity();
  }, [positions, currentRextimate, fixedPriceBid, positionSinceMidnight]);

  useEffect(() => {
    if (!userId) return; // Don't access Firestore if user is not authenticated
    
    let posUnsubscribe: Unsubscribe | undefined;
    getPositionsSnapshot(
      userId,
      mlsId,
      (snapshot: QuerySnapshot) => {
        const positions = _.map(
          snapshot.docs,
          (doc: DocumentSnapshot) => doc.data() as Position,
        );

        setPositions(positions);
        const positionSinceMidnight =
          positions.find((position) => isSinceMidnight(position)) || null;
        setPositionSinceMidnight(positionSinceMidnight);
      },
      isOpenHouse,
    ).then((unsubscribe) => {
      posUnsubscribe = unsubscribe;
    });

    let fpbUnsubscribe: Unsubscribe | undefined;
    getFixedPriceBidsSnapshot(
      userId,
      mlsId,
      (snapshot: any) => {
        if (isOpenHouse) {
          const fixedPriceBids = _.map(snapshot.docs, (doc) =>
            doc.data(),
          ) as FixedPriceBid[];
          setFixedPriceBids(fixedPriceBids);
        } else {
          const fixedPriceBid = snapshot?.docs?.length
            ? snapshot.docs[0]?.data()
            : null;
          setFixedPriceBid(fixedPriceBid || null);
        }
      },
      isOpenHouse,
    ).then((unsubscribe) => {
      fpbUnsubscribe = unsubscribe;
    });

    let rexUnsubscribe: Unsubscribe | undefined;
    getCurrentRextimateSnapshot(
      mlsId,
      (snapshot: any) => {
        // Rextimate snapshot received
        
        const currentRextimate = snapshot?.docs?.length
          ? snapshot.docs[0].data()
          : { amount: listPrice || 0 };
        
        // Setting current rextimate
        setCurrentRextimate(currentRextimate);
      },
      isOpenHouse,
    ).then((unsubscribe) => {
      rexUnsubscribe = unsubscribe;
    });

    let numJustRightUnsubscribe: Unsubscribe | undefined;
    getNumJustRightSnapshot(mlsId, (snapshot: any) => {
      const numJustRight = snapshot.docs?.length || 0;
      setNumJustRight(numJustRight);
    }).then((unsubscribe) => {
      numJustRightUnsubscribe = unsubscribe;
    });

    return () => {
      numJustRightUnsubscribe && numJustRightUnsubscribe();
      posUnsubscribe && posUnsubscribe();
      fpbUnsubscribe && fpbUnsubscribe();
      rexUnsubscribe && rexUnsubscribe();
    };
  }, [userId, mlsId, isOpenHouse]);

  const calculateEquity = async () => {
    const positionEquity = getPositionEquity(
      positions,
      salePrice || currentRextimate.amount,
      numJustRight,
      Boolean(salePrice),
    );
    const fixedPriceBidEquity = Boolean(salePrice)
      ? getFixedPriceBidEquity(
          fixedPriceBid,
          salePrice || currentRextimate.amount,
          numJustRight,
        )
      : 0;

    setEquity(positionEquity + fixedPriceBidEquity);
  };

  return {
    positions,
    equity,
    fixedPriceBid,
    currentRextimate,
    numJustRight,
    positionSinceMidnight,
  };
};

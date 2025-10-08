import { createContext, useContext, useEffect, useState } from 'react';
import { Position } from '../lib/models/positions';
import {
  getAllPositionsForUserSnapshot,
  getNumJustRight,
} from '../firebase/collections/positions';
import { useAuth } from './authProvider';
import _, { Dictionary } from 'lodash';
import { getProperty } from '../firebase/collections/properties';
import { getPositionEquity } from '../lib/helpers/calculations';
import { getFixedPriceBidEquity } from '../lib/helpers/calculations';
import { getCurrentRextimate } from '../firebase/collections/rextimatePriceHistories';
import { getFixedPriceBid } from '../firebase/collections/fixedPriceBids';
import { Property } from '../lib/models/property';
import { Unsubscribe } from 'firebase/firestore';

const PortfolioContext = createContext({
  totalGainsLosses: 0,
  closedGainsLosses: 0,
  openGainsLosses: 0,
  portfolioLineItems: [] as PortfolioLineItem[],
  subscriptions: [] as Unsubscribe[],
  refresh: () => {},
  isRefreshing: false,
});

type PortfolioLineItem = {
  equity: number;
  address: string;
  status: string;
  mlsId: string;
  property: Property;
};

export function PortfolioProvider({ children }: any) {
  const [positionsByMlsId, setPositionsByMlsId] = useState(
    {} as Dictionary<Position[]>,
  );
  const [totalGainsLosses, setTotalGainsLosses] = useState(0);
  const [closedGainsLosses, setClosedGainsLosses] = useState(0);
  const [openGainsLosses, setOpenGainsLosses] = useState(0);
  const { user } = useAuth();
  const [portfolioLineItems, setPortfolioLineItems] = useState(
    [] as PortfolioLineItem[],
  );
  const [subscriptions, setSubscriptions] = useState([] as Unsubscribe[]);
  const [_ref, setRefresh] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(true); // Start with loading state

  const refresh = () => {
    setIsRefreshing(true);
    setRefresh((prev) => prev + 1);
  };
  useEffect(() => {
    if (!user?.id) {
      return; // Don't access Firestore if user is not authenticated
    }
    
    const unsubsribe = getAllPositionsForUserSnapshot(
      user?.id,
      (querySnapshot) => {
        const positions = _.map(
          querySnapshot.docs,
          (doc) => doc.data() as Position,
        );

        const keyedPositions = _.groupBy(positions, 'mlsId');
        setPositionsByMlsId(keyedPositions);
      },
    );

    setSubscriptions([unsubsribe]);

    return () => unsubsribe();
  }, [user]);

  useEffect(() => {
    if (!user?.id) return; // Don't calculate equity if user is not authenticated
    getEquityByPosition();
  }, [positionsByMlsId, _ref, user]);

  useEffect(() => {
    if (!user?.id) return; // Don't calculate gains/losses if user is not authenticated
    getGainsLosses();
  }, [portfolioLineItems, user]);

  const getPropertyGainsLosses = async (
    mlsId: string,
    userId: string = '',
    positions: Position[],
  ): Promise<number> => {
    const property = await getProperty(mlsId);
    if (!property) {
      return 0;
    }
    let currentRextimateOrSalePrice = property.salePrice;
    if (!currentRextimateOrSalePrice) {
      currentRextimateOrSalePrice = (await getCurrentRextimate(mlsId)).amount;
    }
    const numJustRight = await getNumJustRight(mlsId);
    const fixedPriceBid = await getFixedPriceBid(userId, mlsId);
    const positionEquity = getPositionEquity(
      positions,
      currentRextimateOrSalePrice,
      numJustRight,
    );
    const fixedPriceBidEquity = getFixedPriceBidEquity(
      fixedPriceBid,
      currentRextimateOrSalePrice,
      numJustRight,
    );

    return positionEquity + fixedPriceBidEquity;
  };
  const getEquityByPosition = async () => {
    const mlsIds = Object.keys(positionsByMlsId);
    
    // If no positions, set loading to false immediately
    if (mlsIds.length === 0) {
      setPortfolioLineItems([]);
      setIsRefreshing(false);
      return;
    }
    
    // Only show loading if we don't have any data yet
    if (portfolioLineItems.length === 0) {
      setIsRefreshing(true);
    }
    
    const plis = [] as PortfolioLineItem[];
    for (const id of mlsIds) {
      try {
        const property = await getProperty(id);
        
        if (!property) {
          // Property doesn't exist - skip this position
          continue;
        }
        
        // Only include properties that are still active
        if (property.status !== 'Active') {
          continue;
        }
        
        const equity = await getPropertyGainsLosses(
          id,
          user?.id,
          positionsByMlsId[id],
        );
        
        plis.push({
          equity,
          address: property.address?.deliveryLine || 'Address not available',
          status: property.status || 'Unknown',
          mlsId: id,
          property,
        });
      } catch (error) {
        // Silently handle errors for individual properties
      }
    }
    setPortfolioLineItems(plis);
    setIsRefreshing(false);
  };

  const getGainsLosses = () => {
    const ogl = _.reduce(
      portfolioLineItems.filter((item) => item.status != 'Sold'),
      (total, current) => total + current.equity,
      0,
    );
    const cgl = _.reduce(
      portfolioLineItems.filter((item) => item.status == 'Sold'),
      (total, current) => total + current.equity,
      0,
    );
    setOpenGainsLosses(ogl);
    setClosedGainsLosses(cgl);
    setTotalGainsLosses(ogl + cgl);
  };
  return (
    <PortfolioContext.Provider
      value={{
        totalGainsLosses,
        closedGainsLosses,
        openGainsLosses,
        portfolioLineItems,
        subscriptions,
        refresh,
        isRefreshing,
      }}
    >
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => {
  return useContext(PortfolioContext);
};

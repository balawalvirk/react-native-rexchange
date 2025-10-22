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
    property: Property,
    mlsId: string,
    userId: string = '',
    positions: Position[],
  ): Promise<number> => {
    // Parallelize all Firebase calls for this property
    const [currentRextimate, numJustRight, fixedPriceBid] = await Promise.all([
      // Only fetch rextimate if property hasn't sold
      property.salePrice ? Promise.resolve({ amount: property.salePrice }) : getCurrentRextimate(mlsId),
      getNumJustRight(mlsId),
      getFixedPriceBid(userId, mlsId),
    ]);
    
    const currentRextimateOrSalePrice = property.salePrice || currentRextimate.amount;
    
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
    
  
    if (mlsIds.length === 0) {
      setPortfolioLineItems([]);
      setIsRefreshing(false);
      return;
    }
    
    if (portfolioLineItems.length === 0) {
      setIsRefreshing(true);
    }
    
    const uniqueMlsIds = [...new Set(mlsIds)];
    
    const propertyPromises = uniqueMlsIds.map(async (id) => {
      try {
        const property = await getProperty(id);
        
        if (!property) {
          return null;
        }
        
        const equity = await getPropertyGainsLosses(
          property,
          id,
          user?.id,
          positionsByMlsId[id],
        );
        
        return {
          equity,
          address: property.address?.deliveryLine || property.fullListingAddress || 'Address not available',
          status: property.status || 'Unknown',
          mlsId: id,
          property,
        } as PortfolioLineItem;
      } catch (error) { 
        return null;
      }
    });
    
    const results = await Promise.all(propertyPromises);
    
    const plis = results.filter((item): item is PortfolioLineItem => item !== null);
    
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

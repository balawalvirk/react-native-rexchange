export interface Property {
  address: Address;
  baths: Baths;
  beds: number;
  features: Features;
  id: string;
  imageCount: number;
  images: string[];
  lastUpdated: Date;
  listingAgent: ListingAgent;
  listingOffice: ListingOffice;
  listPrice: number;
  newConstruction: boolean;
  propertyType: string;
  size: number;
  status: string;
  style: string;
  subdivision: string;
  fullListingAddress: string;

  // firebase
  docSnapshot?: any;
  // details
  xf_propertycondition: string[];
  xf_lotfeatures: {
    xf_lotsizearea: number;
  };

  // sale
  expiredDate: Date;
  modifiedDate: Date;
  pendingDate: Date;
  propertyId: string;
  saleDate: Date;
  salePrice: number;
  listingDate: Date;
  yearBuild: number;

  // internal
  offMarket: boolean;
  rexId?: string;
  dateCreated?: any;
  rexIsActive?: boolean;
  rexDeleted?: boolean;
  zipCode: string;

  // for home screen
  cantBid?: boolean;
  currentRextimateString?: string;
  equityString?: string;
  listString?: string;
  saleString?: string;
  fixedPriceBidString?: string;
  openPositionsString?: string;
}

type Address = {
  city: string;
  deliveryLine: string;
  state: string;
  street: string;
  zip: string;
};
type Baths = {
  full: number;
  half: number;
  total: number;
};

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Features = {
  bathrooms: string[];
  bedrooms: string[];
  cooling: string[];
  fireplaces: string[];
  foundation: string[];
  heating: string[];
  house: string[];
  listing: string[];
  location: string[];
  Lot: string[];
  property: string[];
  roof: string[];
  sewer: string[];
};

type ListingAgent = {
  id: string;
  email: string;
  name: string;
};

type ListingOffice = {
  id: string;
  name: string;
  phone: string;
};

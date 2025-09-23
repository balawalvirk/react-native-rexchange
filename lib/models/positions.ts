export interface Position {
  userId: string;
  mlsId: string;
  dateCreated: string;
  propertyStatus: 'Sold' | 'Pending' | 'For Sale';
  rextimate: number;
  type: 0 | 1 | 2;
}

import { formatMoney } from './money';

/**
 * Safely formats money values, showing appropriate fallbacks for invalid data
 */
export const safeFormatMoney = (value: any, fallback: string = 'Not Available'): string => {
  // Handle null, undefined, or empty values
  if (value === null || value === undefined || value === '') {
    console.warn('safeFormatMoney: Received null/undefined/empty value:', { value, fallback });
    return fallback;
  }
  
  // Convert string to number if needed
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle NaN or invalid numbers
  if (isNaN(numValue) || !isFinite(numValue)) {
    console.warn('safeFormatMoney: Received invalid number:', { value, numValue, fallback });
    return fallback;
  }
  
  // Handle zero or negative values (might want to show different message)
  if (numValue <= 0) {
    console.warn('safeFormatMoney: Received zero or negative value:', { value, numValue, fallback });
    return fallback;
  }
  
  return formatMoney(numValue);
};

/**
 * Safely formats price per square foot
 */
export const safeFormatPricePerSqft = (
  price: any, 
  sqft: any, 
  priceFallback: string = 'Not Available',
  sqftFallback: string = 'Not Available'
): string => {
  // Handle null, undefined, or empty values
  if (price === null || price === undefined || price === '' || 
      sqft === null || sqft === undefined || sqft === '') {
    return priceFallback;
  }
  
  // Convert to numbers if needed
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  const numSqft = typeof sqft === 'string' ? parseFloat(sqft) : sqft;
  
  // Handle NaN or invalid numbers
  if (isNaN(numPrice) || isNaN(numSqft) || !isFinite(numPrice) || !isFinite(numSqft)) {
    return priceFallback;
  }
  
  // Handle zero square footage
  if (numSqft <= 0) {
    return sqftFallback;
  }
  
  // Handle zero or negative price
  if (numPrice <= 0) {
    return priceFallback;
  }
  
  return formatMoney(numPrice / numSqft);
};

/**
 * Safely formats numeric values with appropriate fallbacks
 */
export const safeFormatNumber = (value: any, fallback: string = 'N/A'): string => {
  // Handle null, undefined, or empty values
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  
  // Convert string to number if needed
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Handle NaN or invalid numbers
  if (isNaN(numValue) || !isFinite(numValue)) {
    return fallback;
  }
  
  return numValue.toString();
};

/**
 * Safely formats square footage
 */
export const safeFormatSqft = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return 'Size not available';
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || !isFinite(numValue) || numValue <= 0) {
    return 'Size not available';
  }
  
  return `${Math.round(numValue).toLocaleString()} sqft`;
};

/**
 * Safely formats bed/bath counts
 */
export const safeFormatBedBath = (value: any, type: 'bed' | 'bath'): string => {
  if (value === null || value === undefined || value === '') {
    return `${type === 'bed' ? 'Bed' : 'Bath'} count not available`;
  }
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue) || !isFinite(numValue) || numValue < 0) {
    return `${type === 'bed' ? 'Bed' : 'Bath'} count not available`;
  }
  
  const count = Math.round(numValue);
  return count === 1 ? `${count} ${type}` : `${count} ${type}s`;
};

export const safeFormatRextimateChange = (
  listPrice: number | string | null | undefined,
  rextimate: number | string | null | undefined,
  fallback: string = '$0'
): string => {
  if (listPrice === null || listPrice === undefined || listPrice === '') {
    return fallback;
  }
  if (rextimate === null || rextimate === undefined || rextimate === '') {
    return fallback;
  }
  
  const numListPrice = typeof listPrice === 'string' ? parseFloat(listPrice) : listPrice;
  const numRextimate = typeof rextimate === 'string' ? parseFloat(rextimate) : rextimate;
  
  if (isNaN(numListPrice) || !isFinite(numListPrice) || isNaN(numRextimate) || !isFinite(numRextimate)) {
    return fallback;
  }
  
  return formatMoney(numRextimate - numListPrice);
};

/**
 * Validates property data and logs potential issues with bid values
 */
export const validatePropertyBidData = (property: any, propertyId?: string): void => {
  const issues: string[] = [];
  
  // Check listPrice
  if (property.listPrice === null || property.listPrice === undefined) {
    issues.push('listPrice is null/undefined');
  } else if (property.listPrice === 0) {
    issues.push('listPrice is 0');
  } else if (typeof property.listPrice === 'string' && property.listPrice === '') {
    issues.push('listPrice is empty string');
  }
  
  // Check salePrice if it exists
  if (property.salePrice !== undefined) {
    if (property.salePrice === null || property.salePrice === undefined) {
      issues.push('salePrice is null/undefined');
    } else if (property.salePrice === 0) {
      issues.push('salePrice is 0');
    } else if (typeof property.salePrice === 'string' && property.salePrice === '') {
      issues.push('salePrice is empty string');
    }
  }
  
  // Log issues if any found
  if (issues.length > 0) {
    console.warn('Property bid data validation issues:', {
      propertyId: propertyId || property.id,
      address: property.fullListingAddress || property.address?.deliveryLine || 'Unknown address',
      issues,
      listPrice: property.listPrice,
      salePrice: property.salePrice,
      status: property.status
    });
  }
};

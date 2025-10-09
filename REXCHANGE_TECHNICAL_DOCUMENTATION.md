# Rexchange Technical Documentation

**Version:** 3.1.16  
**Last Updated:** October 9, 2025  
**Platform:** React Native (iOS & Android)

---

## Table of Contents
1. [Rextimate Logic Clarification](#1-rextimate-logic-clarification)
2. [Data Checking & MLS Integration](#2-data-checking--mls-integration)
3. [Fresh Data Management](#3-fresh-data-management)
4. [Feature Specifications](#4-feature-specifications)
5. [iOS and Android Minimum Versions](#5-ios-and-android-minimum-versions)
6. [MLS API Specifications](#6-mls-api-specifications)
7. [Image Preview System](#7-image-preview-system)

---

## 1. Rextimate Logic Clarification

### What is Rextimate?
**Rextimate** is Rexchange's proprietary real-time property valuation algorithm that dynamically adjusts based on user predictions.

### How It Works

#### Initial Rextimate
When a property is first added to the system:
- **Starting Value:** Property's MLS list price
- **Created:** Automatically when property document is created in Firestore
- **Location:** Cloud Function `onPropertyCreate` (functions/src/index.ts:147-153)

```typescript
// Initial Rextimate = List Price
await createNewRextimatePrice(property.id, property.listPrice, false);
await createNewRextimatePrice(property.id, property.listPrice, true);
```

#### Rextimate Update Algorithm

**Formula:**
```
New Rextimate = Current Rextimate + (Current Rextimate × Direction) / (100 + Total Bids)

Where:
- Direction = +1 for "Too Low", -1 for "Too High", 0 for "Just Right"
- Total Bids = Count of all "Too High" + "Too Low" + "Just Right" bids
```

**Implementation:** `functions/src/functions.ts:176-211`

```typescript
const direction = type === 0 ? 1 : type === 1 ? -1 : 0;
const newRextimate = Math.round(
  currentRextimate +
    (currentRextimate * direction) /
      (100 + tooHighPositions.length + tooLowPositions.length + justRightPositions.length)
);
```

#### User Bid Types

| Bid Type | Value | Direction | Effect on Rextimate |
|----------|-------|-----------|---------------------|
| **Too Low** | 0 | +1 | Increases Rextimate |
| **Too High** | 1 | -1 | Decreases Rextimate |
| **Just Right** | 2 | 0 | No change to Rextimate |

#### Update Trigger
- **When:** User submits a bid ("Too Low" or "Too High" only)
- **Event:** Cloud Function `createNewRextimatePriceHistoryOnTHTLCreate`
- **Location:** `functions/src/index.ts:133-145`
- **Note:** "Just Right" bids do NOT trigger Rextimate updates

#### Example Calculation

**Scenario:**
- Current Rextimate: $500,000
- Existing bids: 5 "Too Low", 3 "Too High", 2 "Just Right"
- New bid: "Too Low"

**Calculation:**
```
Total Bids = 5 + 3 + 2 = 10
Direction = +1 (Too Low)
New Rextimate = 500000 + (500000 × 1) / (100 + 10)
New Rextimate = 500000 + 500000 / 110
New Rextimate = 500000 + 4545.45
New Rextimate = $504,545 (rounded)
```

#### Key Characteristics
1. **Dampening Effect:** As more bids accumulate, each new bid has less impact
2. **Real-Time:** Updates happen immediately after bid submission
3. **Historical:** All Rextimate changes are stored in `rextimatePriceHistories` collection
4. **Separation:** Regular game and Open House properties have separate Rextimate values

---

## 2. Data Checking & MLS Integration

### Data Source
**Provider:** HomeJunction MLS API  
**MLS Board:** GSREIN (Greater South Real Estate Information Network)  
**Base URL:** `https://slipstream.homejunction.com/ws/`

### Data Verification Process

#### 1. Property Data Pull
**Function:** `pullNewProperties()` - `functions/src/functions.ts:12-19`

```typescript
// API Query Parameters
market=GSREIN
listingType=residential
status=active
propertyType=detached
listingDate=>={yesterday}
listPrice=250000:700000
address.zip=70119,70118,70122,70124,70115
images=true
pageSize=1000
extended=true
details=true
features=true
```

#### 2. Data Fields Verified

**Critical Fields:**
- `id` - MLS Listing ID (unique identifier)
- `status` - Active/Pending/Sold
- `listPrice` - Current listing price
- `address` - Full address including zip code
- `images` - Array of property images
- `dateCreated` - Listing date
- `listingOffice` - Broker information
- `salePrice` - Final sale price (when sold)

**Validation:** Client-side validation in `lib/helpers/display.ts`
```typescript
validatePropertyBidData(property, propertyId)
```

#### 3. Data Integrity Checks

**Firestore Rules:**
- Only authenticated users can read properties
- Only Cloud Functions can write/update properties
- MLS ID is immutable once set

**Modified Property Updates:**
```typescript
pullModifiedProperties() // Checks for status changes
updatePositionsWithPropertyStatus() // Updates user positions
updateFPBsWithPropertyStatus() // Updates fixed price bids
```

---

## 3. Fresh Data Management

### Data Freshness Strategy

#### 1. Active Listing Filter
**Location:** `firebase/game.ts:82-87`

```typescript
query(
  collection(getFirestore(), 'properties'),
  where('status', '==', 'Active'),
  where('isGameHouse', '==', true),
  orderBy('dateCreated', 'desc')
)
```

**Result:** Only properties with status='Active' appear in game feed

#### 2. Property Status Updates

**Automatic Updates via Cloud Functions:**
```typescript
// When property status changes in Firestore
updateTHTLsOnPropertyStatusUpdate() // Updates user bids
updateFPBsWithPropertyStatus() // Updates fixed price bids
```

**Trigger:** Any change to property document in Firestore  
**Location:** `functions/src/index.ts:121-131`

#### 3. Valuation List Filtering

**Open Valuations (Home Screen):**
```typescript
// Only show Active properties
const filteredNext = nextProperties.filter((p) => p.status === "Active");
```

**Closed Valuations:**
```typescript
// Only show Pending/Sold properties
const filteredNext = nextProperties.filter((p) =>
  ["Pending", "Sold"].includes(p.status)
);
```

**Location:** `screens/Home/HomeTab/index.tsx:72-118`

#### 4. Data Sync Schedule

**Recommended Schedule:**
1. **New Properties:** Pull daily (listings from yesterday)
2. **Modified Properties:** Pull every 6 hours (status updates)
3. **Price Updates:** Real-time via MLS webhooks (if available)
4. **Image Updates:** Only on initial property creation

---

## 4. Feature Specifications

### Core Features

#### A. Property Feed / Game Screen

**Purpose:** Swipeable feed of active MLS listings for user valuation

**User Flow:**
1. User opens app → Sees vertical scrollable property feed
2. Each property displays:
   - Property images (swipeable)
   - List price
   - Current Rextimate
   - Property details (beds, baths, sqft)
3. User submits valuation:
   - **Too Low** - User thinks it will sell for more
   - **Too High** - User thinks it will sell for less (max 25% of list price)
   - **Just Right** - User thinks Rextimate is accurate
4. User enters specific price guess (optional)
5. Submission updates Rextimate in real-time

**Restrictions:**
- One valuation per property per day (midnight reset)
- Can skip properties
- Active listings only

**Location:** `screens/Game/index.tsx`

---

#### B. Valuation (Home) Screen

**Purpose:** View properties user has already bid on

**Two Tabs:**

**1. Open Valuations**
- Shows Active properties user has bid on
- Displays current equity (gains/losses)
- Shows number of valuations submitted
- Can view property details
- **Cannot bid again** (shows "already bid" message)

**2. Closed Valuations**
- Shows Pending/Sold properties
- Displays final equity calculation
- Shows sale price vs user's guess
- Historical view only

**Equity Calculation:**
- Displayed in real-time as Rextimate changes
- Formula based on user's bid direction and Rextimate movement

**Location:** `screens/Home/HomeTab/index.tsx`

---

#### C. Bidding System

**Bid Types:**

**1. Valuation Bid (Required)**
- Too Low / Too High / Just Right
- Limited to once per day per property
- Directly affects Rextimate

**2. Fixed Price Bid (Optional)**
- User's specific price prediction
- Stored separately in `fixedPriceBids` collection
- Used for final equity calculation when property sells
- **Bonus:** If within $2,000 of sale price, user gets extra reward

**Bid Submission Process:**
```
1. Select valuation type (Too Low/Too High/Just Right)
2. Enter specific price guess (optional)
3. Submit → Cloud Function triggers
4. Rextimate updates (if Too Low/Too High)
5. User sees confirmation
6. Property marked as "already bid" for 24 hours
```

**Location:** `components/Property/index.tsx:383-453`

---

#### D. Portfolio / Profile Tab

**Purpose:** Track overall performance and settings

**Displays:**
- Total Gains/Losses
- Open Valuations summary
- Closed Valuations summary
- List of all properties bid on
- Settings access

**Portfolio Calculation:**
- Updates in real-time via `portfolioProvider.tsx`
- Aggregates equity across all properties
- Separates open vs closed valuations

**Location:** `screens/Home/ProfileTab/index.tsx`

---

#### E. Authentication

**Supported Methods:**
1. **Email/Password** - Firebase Auth
2. **Apple Sign-In** - iOS native
3. **Facebook Login** - Facebook SDK
4. **Promo Code** - Custom invite system

**Auth Flow:**
```
1. User opens app
2. If not authenticated → Promo code screen
3. Enter promo code → Verify → Register
4. Complete profile → Main app
5. If authenticated → Direct to property feed
```

**Security:**
- Firebase Authentication
- Secure token refresh every 10 minutes
- Auth state persists across app restarts

**Location:** `providers/authProvider.tsx`

---

#### F. Image Preview System

**Features:**
1. **Property Card Images**
   - Swipeable carousel
   - Image counter (1 of X)
   - Optimized loading (first 3 images high quality)

2. **Full-Screen Preview**
   - Tap any image to expand
   - Pinch to zoom (1x - 3x)
   - Swipe between images
   - Swipe down to close
   - Long-press to save to device

3. **Image Optimization**
   - Uses `images.weserv.nl` CDN
   - Responsive sizing: 1200x800 for first 3, 800x600 for rest
   - Quality: 90% for first 3 images, 75% for rest
   - Caching: 1 year cache headers
   - Lazy loading for off-screen images

**Save to Gallery:**
- iOS: Native photo library integration
- Android: Storage permissions required
- Location: `components/Property/ImageSliderModal.tsx:226-229`

**Implementation:** `components/Property/ImageSlider.tsx` & `ImageSliderModal.tsx`

---

#### G. Price History Chart

**Purpose:** Visualize Rextimate changes over time

**Features:**
- Line chart showing Rextimate progression
- Shows list price baseline
- Displays date range
- Interactive tooltip (tap for specific values)

**Library:** `react-native-chart-kit`

**Location:** `components/Property/PriceHistoryChart.tsx`

---

#### H. Activity Grid

**Purpose:** Show property bid statistics

**Displays:**
- Total number of "Too Low" bids
- Total number of "Too High" bids  
- Total number of "Just Right" bids
- User's equity on this property
- Number of positions user has taken

**Location:** `components/Property/ActivityGrid.tsx`

---

## 5. iOS and Android Minimum Versions

### iOS Support

**Minimum Version:** iOS 13.4  
**Deployment Target:** 13.4  
**Source:** `ios/Podfile:31`

```ruby
platform :ios, '13.4'
```

**Recommended:** iOS 14.0+ for optimal performance

**iOS Version Coverage:**
- iOS 13.4 - 13.7: Basic support
- iOS 14.0+: Full feature support
- iOS 15.0+: Recommended
- iOS 16.0+: Best performance

**Device Support:**
- iPhone 6s and newer
- iPad (5th generation) and newer
- iPad Pro (all models)
- iPad Air 2 and newer
- iPad mini 4 and newer

---

### Android Support

**Minimum SDK:** 23 (Android 6.0 Marshmallow)  
**Target SDK:** 34 (Android 14)  
**Compile SDK:** 34  
**Source:** `android/build.gradle:6-8`

```gradle
minSdkVersion = 23
targetSdkVersion = 34
compileSdkVersion = 34
```

**Android Version Coverage:**
- API 23 (Android 6.0): Minimum support
- API 24-27 (Android 7.0-8.1): Basic support
- API 28-29 (Android 9-10): Full support
- API 30+ (Android 11+): Recommended
- API 34 (Android 14): Best performance

**Device Requirements:**
- ARM or ARM64 processor
- Minimum 2GB RAM (3GB+ recommended)
- Google Play Services installed

---

### React Native Version

**Version:** 0.74.5  
**Source:** `package.json:40`

**Dependencies:**
- React: 18.2.0
- Expo SDK: ~51.0.0
- Firebase: 10.8.1

**JavaScript Engine:**
- Hermes (default)
- Optimized bytecode compilation
- Faster app startup

---

## 6. MLS API Specifications

### Provider Information

**API Provider:** HomeJunction  
**API Name:** Slipstream API  
**Base URL:** `https://slipstream.homejunction.com/ws/`  
**Authentication:** Bearer Token

**Source:** `functions/src/axios.ts:14-17`

```typescript
{
  baseURL: 'https://slipstream.homejunction.com/ws/',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${HOME_JUNCTION_API_KEY}`
  }
}
```

---

### API Endpoints

#### 1. New Listings Search

**Endpoint:** `GET /listings/search`

**Purpose:** Pull new active listings from yesterday

**Query Parameters:**
```
market=GSREIN
listingType=residential
status=active
propertyType=detached
listingDate=>={yesterday}
listPrice=250000:700000
address.zip=70119,70118,70122,70124,70115
images=true
pageSize=1000
extended=true
details=true
features=true
```

**Parameter Details:**

| Parameter | Value | Description |
|-----------|-------|-------------|
| `market` | GSREIN | Greater South Real Estate Information Network |
| `listingType` | residential | Residential properties only |
| `status` | active | Only active listings |
| `propertyType` | detached | Single-family detached homes |
| `listingDate` | >={yesterday} | Properties listed since yesterday |
| `listPrice` | 250000:700000 | Price range $250K - $700K |
| `address.zip` | 70119,70118... | New Orleans area zip codes |
| `images` | true | Include property images |
| `pageSize` | 1000 | Max results per request |
| `extended` | true | Include extended property details |
| `details` | true | Include detailed information |
| `features` | true | Include property features |

---

#### 2. Modified Listings

**Endpoint:** `GET /listings/search`

**Purpose:** Detect status changes (Active → Pending → Sold)

**Query Parameters:**
```
market=GSREIN
modifiedDate=>={yesterday}
pageSize=1000
```

**Use Case:** Run periodically to catch:
- Properties that sold
- Status changes (Active → Pending)
- Price changes
- Image updates

---

### Response Format

**Success Response:**
```json
{
  "result": {
    "listings": [
      {
        "id": "12345678",
        "status": "Active",
        "listPrice": 450000,
        "salePrice": null,
        "address": {
          "deliveryLine": "123 Main St",
          "street": "Main",
          "city": "New Orleans",
          "state": "LA",
          "zip": "70119"
        },
        "images": [
          "https://cdn.homejunction.com/image1.jpg",
          "https://cdn.homejunction.com/image2.jpg"
        ],
        "dateCreated": "2025-10-08T10:30:00Z",
        "listingOffice": {
          "name": "ABC Realty",
          "phone": "504-555-1234"
        },
        "details": {
          "bedrooms": 3,
          "bathrooms": 2.5,
          "squareFeet": 2100,
          "lotSize": 7500,
          "yearBuilt": 1995
        },
        "features": {
          "parking": "2 car garage",
          "cooling": "Central AC",
          "heating": "Gas",
          "flooring": "Hardwood"
        }
      }
    ],
    "totalCount": 25,
    "page": 1
  }
}
```

---

### Rate Limits

**Recommended:**
- Maximum 100 requests per hour
- Use pagination for large result sets
- Cache responses for 5 minutes minimum

**Error Handling:**
- 401: Invalid authentication token
- 429: Rate limit exceeded
- 500: MLS API error

---

### Data Sync Strategy

**Recommended Schedule:**

1. **New Listings Pull**
   - **Frequency:** Daily at 6:00 AM
   - **Endpoint:** `/listings/search` (new listings)
   - **Purpose:** Add new properties to game feed

2. **Modified Listings Check**
   - **Frequency:** Every 6 hours
   - **Endpoint:** `/listings/search` (modified)
   - **Purpose:** Update status changes

3. **Real-time Updates**
   - **Method:** Cloud Function triggers on Firestore changes
   - **Purpose:** Update user positions when property status changes

---

## 7. Image Preview System

### Architecture

#### Components
1. **ImageSlider** - Horizontal carousel on property card
2. **ImageSliderModal** - Full-screen preview with zoom
3. **LazyLoadedImage** - Optimized image loading component

---

### Image Pipeline

#### 1. Source Images
- **Origin:** HomeJunction MLS API
- **Format:** JPEG/PNG
- **Size:** Variable (typically 1920x1080 - 4000x3000)
- **Quantity:** 5-30 images per property

#### 2. CDN Optimization
**Service:** images.weserv.nl (Cloudinary alternative)

**Transformation URL Format:**
```
https://images.weserv.nl/?url={encoded_source_url}&w={width}&h={height}&fit=cover&q={quality}
```

**Parameters:**
- `w` - Width in pixels
- `h` - Height in pixels
- `fit=cover` - Crop to fit dimensions
- `q` - Quality percentage (1-100)

**Implementation:** `components/Property/index.tsx:164-182`

```typescript
const imageUrls = useMemo(() => {
  return property.images.map((image, index) => {
    const quality = index < 3 ? 90 : 75;
    const width = index < 3 ? 1200 : 800;
    const height = index < 3 ? 800 : 600;
    
    return {
      url: `https://images.weserv.nl/?url=${encodeURIComponent(image)}&w=${width}&h=${height}&fit=cover&q=${quality}`,
      headers: {
        'Cache-Control': 'public, max-age=31536000'
      }
    };
  });
}, [property.images]);
```

---

### Image Loading Strategy

#### Priority Loading
1. **First 3 images:** High priority (1200x800 @ 90% quality)
2. **Remaining images:** Lower priority (800x600 @ 75% quality)
3. **Preloading:** First 2 images preloaded immediately
4. **Lazy Loading:** Images load as user scrolls

#### Batch Loading
```typescript
const batchSize = 2;
// Load first batch immediately
await Promise.all(firstBatch.map(img => preload(img)));

// Load remaining in background with delay
setTimeout(() => {
  loadRemainingImages();
}, 1000);
```

---

### Full-Screen Preview Features

#### Gestures
- **Tap image:** Open full-screen
- **Swipe left/right:** Navigate between images
- **Swipe down:** Close preview
- **Pinch:** Zoom 1x - 3x
- **Double-tap:** Quick zoom to 2x
- **Long-press:** Save to device photo gallery

#### Save to Gallery

**iOS Implementation:**
```typescript
// Uses @react-native-camera-roll/camera-roll
await CameraRoll.save(imageUrl, { type: 'photo' });
```

**Android Implementation:**
```typescript
// Requires storage permissions
await PermissionsAndroid.requestMultiple([
  PERMISSIONS.READ_EXTERNAL_STORAGE,
  PERMISSIONS.WRITE_EXTERNAL_STORAGE
]);
await CameraRoll.save(imageUrl, { type: 'photo' });
```

**Location:** `components/Property/ImageSliderModal.tsx:66-161`

---

### Caching Strategy

#### Browser/App Cache
- **Cache-Control:** `public, max-age=31536000` (1 year)
- **Reason:** Images are immutable (MLS images don't change)

#### Image Viewer Library
**Package:** `react-native-image-zoom-viewer`  
**Features:**
- Native gesture handling
- Hardware-accelerated zoom
- Preloading adjacent images
- Memory-efficient rendering

**Configuration:**
```typescript
<ImageViewer
  imageUrls={optimizedImageUrls}
  enablePreload={true}
  enableImageZoom={true}
  maxOverflow={5}  // Preload 5 images ahead
  minScale={1}
  maxScale={3}
  saveToLocalByLongPress={true}
  onSave={handleSaveImage}
/>
```

---

### Screenshot Examples

#### 1. Property Card Image Slider
- Horizontal swipe carousel
- Image counter badge (bottom right)
- "1 of 12" indicator
- Fullscreen button overlay

#### 2. Image Carousel Controls
- Dots indicator (below images)
- Left/right navigation arrows
- Auto-scroll disabled (manual only)

#### 3. Full-Screen Preview
- Black background
- Pinch-to-zoom enabled
- Image counter overlay
- Close button (top right)
- Save icon (bottom right)

#### 4. Save to Gallery Confirmation
- Toast notification: "Image saved to gallery"
- Duration: 2 seconds
- Position: Bottom center

#### 5. Zoom State
- 1x: Full image visible
- 2x: Zoomed in (double-tap)
- 3x: Maximum zoom (pinch)

---

### Performance Metrics

**Target Performance:**
- First image load: < 500ms
- Image transition: 60 FPS
- Zoom gesture: 60 FPS (hardware accelerated)
- Memory usage: < 100MB for 20 images

**Optimizations:**
1. Progressive JPEG loading
2. Image dimension pre-calculation
3. Virtualized list rendering
4. Automatic memory cleanup on unmount
5. CDN edge caching

---

## Additional Technical Details

### Database Structure

#### Firestore Collections

**1. properties**
```typescript
{
  id: string,              // MLS ID
  status: 'Active' | 'Pending' | 'Sold',
  listPrice: number,
  salePrice: number | null,
  address: {
    deliveryLine: string,
    city: string,
    state: string,
    zip: string
  },
  images: string[],        // Image URLs
  dateCreated: timestamp,
  isGameHouse: boolean,
  isOpenHouse: boolean
}
```

**2. thtls** (Too High, Too Low, Just Right)
```typescript
{
  userId: string,
  mlsId: string,
  type: 0 | 1 | 2,         // 0=TooLow, 1=TooHigh, 2=JustRight
  dateCreated: timestamp,
  rextimate: number,        // Rextimate at time of bid
  propertyStatus: string,
  isGameHouse: boolean,
  isOpenHouse: boolean
}
```

**3. fixedPriceBids**
```typescript
{
  userId: string,
  mlsId: string,
  amount: number,           // User's price guess
  dateCreated: timestamp,
  isOpenHouse: boolean
}
```

**4. rextimatePriceHistories**
```typescript
{
  mlsId: string,
  amount: number,           // Rextimate value
  dateCreated: timestamp,
  isOpenHouse: boolean
}
```

**5. users**
```typescript
{
  id: string,
  email: string,
  displayName: string,
  isOpenHouse: boolean,
  tutorialFinished: boolean,
  dateCreated: timestamp
}
```

---

### Cloud Functions

**Deployed Functions:**

1. `pullNewPropertiesDaily` - Scheduled: Daily 6 AM
2. `updateTHTLsOnPropertyStatusUpdate` - Trigger: Property update
3. `createNewRextimatePriceHistoryOnTHTLCreate` - Trigger: New bid
4. `onPropertyCreate` - Trigger: New property
5. `sendOpenHouseEmail` - HTTP: Email notifications

---

### Security Rules

**Firestore Rules:**
- Users can read all properties (status=Active)
- Users can only write their own positions/bids
- Cloud Functions have admin access
- MLS IDs are immutable

**Authentication:**
- Firebase Auth required for all operations
- Token refresh every 10 minutes
- Secure session management

---

### Error Handling

**Sentry Integration:**
- DSN: Configured in `App.tsx:47-49`
- Captures all unhandled exceptions
- Performance monitoring enabled
- User context attached to errors

---

## Appendix

### Key Files Reference

| Feature | Primary File |
|---------|-------------|
| Rextimate Calculation | `functions/src/functions.ts:176-211` |
| Property Feed | `screens/Game/index.tsx` |
| Home/Valuations | `screens/Home/HomeTab/index.tsx` |
| Property Detail | `components/Property/index.tsx` |
| Image Preview | `components/Property/ImageSliderModal.tsx` |
| Authentication | `providers/authProvider.tsx` |
| MLS Integration | `functions/src/functions.ts:12-27` |

---

### Contact & Support

**Rexchange, LLC**  
1207 N Galvez St.  
New Orleans, LA 70119  
Phone: 505 376 3789  
Email: info@rexchange.app

**Licensed Broker:**  
Kenneth C Borders  
Louisiana Licensed Broker  
Email: kcb@rexchange.app

---

**Document Version:** 1.0  
**Last Updated:** October 9, 2025  
**Maintained By:** Development Team


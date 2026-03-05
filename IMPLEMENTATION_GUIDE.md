# Ratings and Messaging System - Implementation Guide

## ✅ Completed Components

### 1. **Rating Components**

#### SellerRatingDialog (`src/components/SellerRatingDialog.tsx`)
- Allows buyers to rate sellers (1-5 stars)
- Optional comment field
- Linked to orders for context

**Usage Example:**
```tsx
import { SellerRatingDialog } from "@/components/SellerRatingDialog";

export function OrderPage() {
  const [ratingOpen, setRatingOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setRatingOpen(true)}>Rate Seller</button>
      <SellerRatingDialog
        open={ratingOpen}
        onOpenChange={setRatingOpen}
        sellerId="seller-123"
        sellerName="Store Name"
        orderId="order-456"
      />
    </>
  );
}
```

#### DriverRatingDialog (`src/components/DriverRatingDialog.tsx`)
- Allows sellers to rate drivers (1-5 stars)
- Optional comment field
- Linked to orders for context

**Usage Example:**
```tsx
import { DriverRatingDialog } from "@/components/DriverRatingDialog";

export function SellerOrdersPage() {
  const [ratingOpen, setRatingOpen] = useState(false);
  
  return (
    <>
      <button onClick={() => setRatingOpen(true)}>Rate Driver</button>
      <DriverRatingDialog
        open={ratingOpen}
        onOpenChange={setRatingOpen}
        driverId="driver-123"
        driverName="Driver Name"
        orderId="order-456"
      />
    </>
  );
}
```

#### RatingsDisplay (`src/components/RatingsDisplay.tsx`)
- Shows average ratings and rating count
- Displays recent comments
- Works for both sellers and drivers

**Usage Example:**
```tsx
import { RatingsDisplay } from "@/components/RatingsDisplay";

export function SellerProfile() {
  return (
    <div>
      <h3>Seller Rating</h3>
      <RatingsDisplay targetId="seller-123" type="seller" showComments={true} />
    </div>
  );
}
```

### 2. **Messaging Components**

#### ContactButton (`src/components/ContactButton.tsx`)
- Easy-to-use button for initiating contact
- Automatically navigates to messages page
- Works for buyer→seller, seller→driver, and any user→user messaging

**Usage Example:**
```tsx
import { ContactButton } from "@/components/ContactButton";

export function SellerProfile() {
  return (
    <ContactButton
      targetUserId="seller-123"
      targetUserName="Store Name"
      initialMessage="Hi, I'm interested in your products!"
    />
  );
}
```

#### SellerCard (`src/components/SellerCard.tsx`)
- Complete seller profile card
- Shows rating, location, store description
- Includes contact button and view store button

**Usage Example:**
```tsx
import { SellerCard } from "@/components/SellerCard";

export function SellersDirectory() {
  return (
    <SellerCard
      sellerId="seller-123"
      sellerName="John Doe"
      storeName="Premium Store"
      location="New York, NY"
      storeDescription="Quality products at great prices"
      productCount={45}
      showContact={true}
      showRating={true}
    />
  );
}
```

#### Enhanced Messages Page (`src/pages/Messages.tsx`)
- Shows user profiles in conversation list
- Marks messages as read automatically
- Auto-invalidates on unread count change

### 3. **Hooks**

#### useUnreadMessagesCount (`src/hooks/useUnreadMessagesCount.ts`)
- Returns count of unread messages for current user
- Refetches every 5 seconds
- Used in BottomNav for badge display

**Usage Example:**
```tsx
import { useUnreadMessagesCount } from "@/hooks/useUnreadMessagesCount";

export function MyComponent() {
  const { data: unreadCount } = useUnreadMessagesCount();
  return <span>Unread: {unreadCount}</span>;
}
```

### 4. **Navigation Updates**

#### BottomNav (`src/components/layout/BottomNav.tsx`)
- Added Messages link to all user types (buyers, sellers, drivers)
- Shows unread message count badge
- Positioned prominently in navigation

## 📍 Where to Integrate These Components

### For Buyers:

1. **Orders Page** - Add `SellerRatingDialog` after order delivery
   ```tsx
   // After delivery status, show rate button
   {order.status === "delivered" && (
     <SellerRatingDialog {...props} />
   )}
   ```

2. **Seller Profile Page** - Add `RatingsDisplay` and `ContactButton`
   ```tsx
   <RatingsDisplay targetId={sellerId} type="seller" showComments={true} />
   <ContactButton targetUserId={sellerId} />
   ```

3. **Product Detail Page** - Add seller info with `ContactButton`
   ```tsx
   <ContactButton
     targetUserId={product.seller_id}
     initialMessage={`I'm interested in ${product.title}`}
   />
   ```

### For Sellers:

1. **Seller Orders Page** - Add `DriverRatingDialog` for delivered orders
   ```tsx
   {order.status === "delivered" && (
     <DriverRatingDialog {...props} />
   )}
   ```

2. **Driver Profile Page** - Show driver ratings and contact option
   ```tsx
   <RatingsDisplay targetId={driverId} type="driver" showComments={true} />
   <ContactButton targetUserId={driverId} />
   ```

3. **Delivery Drivers Page** - List all drivers with ratings and contact
   ```tsx
   {drivers.map(driver => (
     <SellerCard
       key={driver.id}
       sellerId={driver.id}
       sellerName={driver.name}
       showRating={true}
       showContact={true}
     />
   ))}
   ```

### For All Users:

1. **BottomNav** - Messages link with unread badge (✅ Already implemented)

2. **Profile Pages** - Show received ratings
   ```tsx
   <div>
     <h3>Your Rating</h3>
     <RatingsDisplay targetId={userId} type="seller" showComments={true} />
   </div>
   ```

## 🗄️ Database Schema

### seller_ratings table
```sql
- id (uuid, primary key)
- buyer_id (uuid, not null)
- seller_id (uuid, not null)
- order_id (uuid, optional)
- rating (integer, 1-5)
- comment (text, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

### driver_ratings table
```sql
- id (uuid, primary key)
- seller_id (uuid, not null)
- driver_id (uuid, not null)
- order_id (uuid, optional)
- rating (integer, 1-5)
- comment (text, optional)
- created_at (timestamp)
- updated_at (timestamp)
```

### Indexes
- `idx_seller_ratings_buyer_id`
- `idx_seller_ratings_seller_id`
- `idx_seller_ratings_order_id`
- `idx_driver_ratings_seller_id`
- `idx_driver_ratings_driver_id`
- `idx_driver_ratings_order_id`

## 🔐 Row-Level Security (RLS)

All policies are configured to:
- ✅ Allow everyone to view ratings
- ✅ Allow only the rater to create/update their own ratings
- ✅ Prevent unauthorized access

## 📱 Mobile Optimization

All components are:
- ✅ Responsive and mobile-friendly
- ✅ Touch-friendly with adequate button sizes
- ✅ Optimized for small screens
- ✅ Follow your app's design system (shadcn/ui + Tailwind)

## 🚀 Next Steps

1. Test each component by running the dev server
2. Integrate components into existing pages (see "Where to Integrate" section)
3. Verify database queries work correctly
4. Test RLS policies with different user types
5. Deploy to production

## ✨ Key Features

✅ **Buyer → Seller Ratings** - Buyers can rate sellers after purchases
✅ **Seller → Driver Ratings** - Sellers can rate drivers for deliveries
✅ **Easy Messaging** - One-click contact buttons throughout the app
✅ **Unread Badges** - Messages badge shows unread count in navigation
✅ **Auto-mark Read** - Messages auto-marked as read when viewing conversation
✅ **User Profiles** - Conversations show user names and avatars
✅ **Responsive Design** - Works on all screen sizes
✅ **Secure** - RLS policies prevent unauthorized access

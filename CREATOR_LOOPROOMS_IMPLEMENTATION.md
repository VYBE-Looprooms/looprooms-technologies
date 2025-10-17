# 🎨 Creator Looprooms - Complete Implementation Plan

## 📋 Overview

Enable creators to create, manage, and share their own looprooms with public/private options.

---

## 🎯 Features to Implement

### Phase 1: Quick Fixes (5 minutes)

- [x] Fix "AI Rooms" → "AI Looprooms" in Quick Links
- [x] Link Quick Links to `/ai-looprooms`

### Phase 2: Database Updates (10 minutes)

- [ ] Add `isPrivate` field to Looproom model (BOOLEAN)
- [ ] Add `accessCode` field to Looproom model (STRING)
- [ ] Add `shareableLink` field to Looproom model (STRING)

### Phase 3: Create Looproom Page (30 minutes)

- [ ] Create `/creator/looproom/create` page
- [ ] Multi-step wizard:
  - Step 1: Basic Info (name, description, category)
  - Step 2: Settings (duration, max participants, privacy)
  - Step 3: Media (banner, music playlist)
  - Step 4: Review & Create

### Phase 4: Backend API Updates (15 minutes)

- [ ] Update POST `/api/looprooms` to handle new fields
- [ ] Add POST `/api/looprooms/join-private` endpoint
- [ ] Add GET `/api/looprooms/verify-code/:code` endpoint

### Phase 5: Join Private Looproom (20 minutes)

- [ ] Add "Join Private Looproom" button in `/looprooms`
- [ ] Create modal for entering access code
- [ ] Validate code and redirect to room

### Phase 6: Individual Room UI (40 minutes)

- [ ] Update `/looproom/[id]` page
- [ ] Show shareable link for creators
- [ ] Show access code for private rooms
- [ ] Different UI for creator vs participant
- [ ] Copy link/code buttons

---

## 📊 Database Schema Changes

### Looproom Model Updates

```javascript
// Add to backend/src/models/Looproom.js

isPrivate: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
  allowNull: false,
  field: 'is_private'
},
accessCode: {
  type: DataTypes.STRING(10),
  allowNull: true,
  unique: true,
  field: 'access_code',
  comment: 'Code for joining private rooms'
},
shareableLink: {
  type: DataTypes.STRING(500),
  allowNull: true,
  field: 'shareable_link',
  comment: 'Unique shareable link for the room'
}
```

---

## 🎨 UI Components to Create

### 1. Create Looproom Wizard

**Location:** `frontend/src/app/creator/looproom/create/page.tsx`

**Steps:**

1. **Basic Info**

   - Room name (required)
   - Description (required)
   - Category (dropdown: recovery, meditation, fitness, healthy-living, wellness)

2. **Settings**

   - Duration (15, 30, 45, 60 minutes)
   - Max participants (10, 25, 50, 100, unlimited)
   - Privacy toggle (Public/Private)
   - If private: Auto-generate access code

3. **Media** (Optional)

   - Banner image upload
   - Music playlist (future)

4. **Review**
   - Show all settings
   - Create button

### 2. Join Private Looproom Modal

**Location:** `frontend/src/components/join-private-modal.tsx`

**Features:**

- Input field for access code
- Validate button
- Error messages
- Success redirect

### 3. Room Share Component

**Location:** `frontend/src/components/room-share.tsx`

**Features:**

- Shareable link display
- Copy link button
- Access code display (if private)
- Copy code button
- QR code (future)

---

## 🔄 API Endpoints

### Create Looproom

```javascript
POST /api/looprooms
Body: {
  name: string,
  description: string,
  category: string,
  duration: number,
  maxParticipants: number,
  isPrivate: boolean,
  bannerUrl?: string,
  musicPlaylist?: array
}
Response: {
  success: true,
  looproom: {...},
  accessCode?: string,  // if private
  shareableLink: string
}
```

### Join Private Looproom

```javascript
POST /api/looprooms/join-private
Body: {
  accessCode: string
}
Response: {
  success: true,
  looproomId: number,
  message: "Access granted"
}
```

### Verify Access Code

```javascript
GET /api/looprooms/verify-code/:code
Response: {
  success: true,
  looproom: {...}
}
```

---

## 🎯 User Flows

### Flow 1: Creator Creates Public Looproom

1. Click "Create Looproom" in feed
2. Fill in basic info
3. Set duration and max participants
4. Keep privacy as "Public"
5. Click "Create"
6. Redirected to room page
7. See shareable link
8. Room appears in `/looprooms` for everyone

### Flow 2: Creator Creates Private Looproom

1. Click "Create Looproom" in feed
2. Fill in basic info
3. Set duration and max participants
4. Toggle privacy to "Private"
5. Auto-generated access code shown
6. Click "Create"
7. Redirected to room page
8. See shareable link AND access code
9. Room does NOT appear in public `/looprooms`
10. Creator shares link or code with friends

### Flow 3: User Joins Private Looproom (via Code)

1. Go to `/looprooms`
2. Click "Join Private Looproom"
3. Enter access code
4. Click "Join"
5. Redirected to room page
6. Can now participate

### Flow 4: User Joins Private Looproom (via Link)

1. Click shareable link (e.g., `/looproom/123?code=ABC123`)
2. Code validated automatically
3. Redirected to room page
4. Can now participate

---

## 🎨 UI Mockups

### Create Looproom Page

```
┌─────────────────────────────────────┐
│  Create Your Looproom               │
├─────────────────────────────────────┤
│  Step 1 of 3: Basic Information     │
│                                     │
│  Room Name *                        │
│  [________________________]         │
│                                     │
│  Description *                      │
│  [________________________]         │
│  [________________________]         │
│                                     │
│  Category *                         │
│  [▼ Select Category      ]         │
│                                     │
│  [Cancel]  [Next: Settings →]      │
└─────────────────────────────────────┘
```

### Join Private Looproom Modal

```
┌─────────────────────────────────────┐
│  Join Private Looproom         [X]  │
├─────────────────────────────────────┤
│  Enter the access code shared by    │
│  the creator to join this room.     │
│                                     │
│  Access Code                        │
│  [________________________]         │
│                                     │
│  [Cancel]  [Join Room]              │
└─────────────────────────────────────┘
```

### Room Share Section (Creator View)

```
┌─────────────────────────────────────┐
│  Share This Room                    │
├─────────────────────────────────────┤
│  Shareable Link                     │
│  https://vybe.com/looproom/123      │
│  [📋 Copy Link]                     │
│                                     │
│  Access Code (Private Room)         │
│  ABC123                             │
│  [📋 Copy Code]                     │
└─────────────────────────────────────┘
```

---

## 📝 File Structure

```
frontend/src/
├── app/
│   ├── creator/
│   │   └── looproom/
│   │       └── create/
│   │           └── page.tsx          # NEW: Create looproom wizard
│   ├── looprooms/
│   │   └── page.tsx                  # UPDATE: Add "Join Private" button
│   └── looproom/
│       └── [id]/
│           └── page.tsx              # UPDATE: Add share section
├── components/
│   ├── join-private-modal.tsx        # NEW: Modal for entering code
│   ├── room-share.tsx                # NEW: Share link/code component
│   └── looproom-wizard/              # NEW: Wizard components
│       ├── step-basic-info.tsx
│       ├── step-settings.tsx
│       ├── step-media.tsx
│       └── step-review.tsx

backend/src/
├── models/
│   └── Looproom.js                   # UPDATE: Add new fields
└── routes/
    └── looprooms.js                  # UPDATE: Add new endpoints
```

---

## ✅ Implementation Checklist

### Quick Fixes

- [ ] Update "AI Rooms" to "AI Looprooms" in feed sidebar
- [ ] Link to `/ai-looprooms`

### Database

- [ ] Add `isPrivate` field
- [ ] Add `accessCode` field
- [ ] Add `shareableLink` field
- [ ] Test database sync

### Backend

- [ ] Update Looproom model
- [ ] Update POST `/api/looprooms` endpoint
- [ ] Create POST `/api/looprooms/join-private` endpoint
- [ ] Create GET `/api/looprooms/verify-code/:code` endpoint
- [ ] Add access code generation utility
- [ ] Add shareable link generation

### Frontend - Create Flow

- [ ] Create wizard page structure
- [ ] Build Step 1: Basic Info
- [ ] Build Step 2: Settings
- [ ] Build Step 3: Media (optional)
- [ ] Build Step 4: Review
- [ ] Connect to API
- [ ] Add validation
- [ ] Add success redirect

### Frontend - Join Private

- [ ] Add "Join Private Looproom" button
- [ ] Create join modal component
- [ ] Add code validation
- [ ] Handle errors
- [ ] Redirect on success

### Frontend - Room Page

- [ ] Add share section for creators
- [ ] Show shareable link
- [ ] Show access code (if private)
- [ ] Add copy buttons
- [ ] Handle link with code parameter
- [ ] Auto-validate code from URL

### Testing

- [ ] Test creating public looproom
- [ ] Test creating private looproom
- [ ] Test joining via code
- [ ] Test joining via link
- [ ] Test creator permissions
- [ ] Test non-creator view

---

## 🚀 Implementation Order

1. **Quick Fixes** (5 min) - Update sidebar links
2. **Database** (10 min) - Add new fields to model
3. **Backend API** (15 min) - Update endpoints
4. **Create Wizard** (30 min) - Build creation flow
5. **Join Private** (20 min) - Build join modal
6. **Room Share** (15 min) - Add share section
7. **Testing** (20 min) - Test all flows

**Total Estimated Time:** ~2 hours

---

## 🎯 Success Criteria

✅ Creators can create public looprooms  
✅ Creators can create private looprooms  
✅ Private rooms generate access codes  
✅ Users can join private rooms via code  
✅ Users can join private rooms via link  
✅ Creators see share options in their rooms  
✅ Public rooms appear in `/looprooms`  
✅ Private rooms do NOT appear in `/looprooms`  
✅ All fields sync with database automatically

---

**Ready to implement!** 🚀

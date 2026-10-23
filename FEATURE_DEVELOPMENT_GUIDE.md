# Mentara Learning — Feature Development & Integration Guide

> **Audience:** External Developers & Contributors  
> **Purpose:** This document provides everything you need to build, test, and deliver a self-contained feature for **Mentara Learning** that can be integrated into the main project seamlessly.

---

## 1. Project Overview & Architecture Philosophy

Mentara Learning is a full-stack educational web application built for Cambridge Primary education. It includes dedicated portals for:
- **Students:** Interactive Virtual Labs, checkpoint exams, worksheets, and AI tutoring.
- **Teachers:** Classroom management, assignment sharing, and interactive teaching boards.
- **Admins:** Curriculum management, question generation studio, and student tracking.

### Core Architectural Principle: **Isolated Feature Modules**
To make your feature plug-and-play:
- All UI, sub-components, and local logic must live inside a single self-contained directory: `frontend/src/features/<feature_name>/`.
- Do **not** modify shared layouts or core routing files directly—provide a simple routing snippet for the main project maintainer to add.
- Follow the existing API response contracts and design tokens.

---

## 2. Technology Stack

### Frontend
| Layer | Technology | Version | Notes |
| :--- | :--- | :--- | :--- |
| **Framework** | React + Vite | React 18.3, Vite 5.4 | Fast ESM-based bundling |
| **Routing** | React Router DOM | v6.26 | Uses `lazy()` code splitting |
| **Styling** | Tailwind CSS + CSS Modules | v3.4 | Utility-first + CSS variables |
| **Icons** | Lucide React | ^0.446 | Standard icon library |
| **Animation** | Framer Motion | ^11.5 | Smooth micro-interactions & transitions |
| **Global State** | Zustand | ^4.5 | Lightweight auth & notification stores |
| **HTTP Client** | Axios | ^1.7 | Pre-configured client with JWT interceptor |
| **Notifications**| React Hot Toast | ^2.4 | Toasts for success, loading, and error states |

### Backend
| Layer | Technology | Version | Notes |
| :--- | :--- | :--- | :--- |
| **Runtime** | Node.js | v18+ | JavaScript runtime |
| **Framework** | Express | ^5.2 | RESTful API endpoints |
| **Database** | PostgreSQL | `pg` ^8.21 | Parameterized SQL queries |
| **Authentication** | JWT (JSON Web Tokens) | ^9.0 | Bearer token in headers |
| **File Storage** | Cloudinary | ^2.10 | Media/PDF assets (if applicable) |

---

## 3. Directory Structure & Where to Put Your Code

```
Mentera/
├── frontend/
│   └── src/
│       ├── api/
│       │   ├── client.js          <-- Shared Axios instance (auto Bearer token)
│       │   └── services.js        <-- Export feature API functions here
│       ├── components/
│       │   ├── ui/                <-- Reusable UI: PageWrapper, Button, Skeleton, Card
│       │   ├── layout/            <-- StudentLayout, AdminLayout, etc.
│       │   └── shared/            <-- SEOHead, CertificateCard, etc.
│       ├── store/
│       │   └── authStore.js       <-- Access current user & token
│       └── features/
│           └── <your_feature_name>/  <-- 🎯 ALL YOUR FRONTEND CODE GOES HERE
│               ├── MyFeaturePage.jsx       (Main Page component)
│               ├── components/             (Feature-specific components)
│               │   ├── FeatureHeader.jsx
│               │   └── FeatureItemCard.jsx
│               └── hooks/                  (Custom hooks if needed)
│                   └── useFeatureData.js
└── backend/
    └── src/
        ├── routes/
        │   └── <your_feature>.routes.js     <-- 🎯 Your API Route definitions
        ├── controllers/
        │   └── <your_feature>.controller.js <-- 🎯 Your Request handlers
        └── models/ (or db queries)          <-- 🎯 Your SQL database operations
```

---

## 4. State & Authentication Integration

You do **not** need to build a new authentication system. The current logged-in user is available anywhere in your component using Zustand:

```javascript
import useAuthStore from '@/store/authStore';

export default function MyFeaturePage() {
  const { user, token } = useAuthStore();

  // user object contains:
  // - user.id
  // - user.full_name
  // - user.email
  // - user.role ('student' | 'teacher' | 'admin')
  // - user.stage ('Stage 1', 'Stage 2', etc.)
  // - user.is_premium (boolean)

  return (
    <div>Welcome back, {user?.full_name}!</div>
  );
}
```

---

## 5. API Communication Standards

### 1. Calling Backend from Frontend
Always use the pre-configured Axios client located at `@/api/client`. It automatically injects the active user's JWT Authorization token on every request.

Add your service calls to `frontend/src/api/services.js` (or keep them in your feature folder):

```javascript
import api from '@/api/client';

export const featureApi = {
  // GET request
  getFeatureItems: async (stage) => {
    const res = await api.get('/feature-items', { params: { stage } });
    return res.data;
  },

  // POST request
  submitAction: async (payload) => {
    const res = await api.post('/feature-items/submit', payload);
    return res.data;
  }
};
```

### 2. Standard API Response Contract
All backend controllers must return responses conforming to this format:

#### ✅ Success Response (`200 OK` or `201 Created`):
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Introduction to Forces",
      "status": "completed"
    }
  ],
  "message": "Items retrieved successfully"
}
```

#### ❌ Error Response (`400`, `401`, `403`, `500`):
```json
{
  "success": false,
  "message": "Unable to process your request. Please check input parameters."
}
```

### 3. User Feedback & Notifications
Use `react-hot-toast` for all interactions:
```javascript
import toast from 'react-hot-toast';

try {
  const toastId = toast.loading('Saving progress...');
  await featureApi.submitAction(data);
  toast.success('Progress saved successfully!', { id: toastId });
} catch (err) {
  toast.error(err.response?.data?.message || 'Failed to save progress');
}
```

---

## 6. Backend API Development (If Feature Requires New Endpoints)

If your feature requires new backend logic or database tables:

### 1. Routes (`backend/src/routes/<feature>.routes.js`)
Use the existing auth middleware to protect your endpoints:
```javascript
const express = require('express');
const router = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth.middleware');
const controller = require('../controllers/myfeature.controller');

// Accessible by all authenticated users
router.get('/', verifyToken, controller.getAll);

// Accessible only by teachers or admins
router.post('/create', verifyToken, requireRole(['teacher', 'admin']), controller.create);

module.exports = router;
```

### 2. Controller (`backend/src/controllers/<feature>.controller.js`)
Always use parameterized PostgreSQL queries to prevent SQL injections:
```javascript
const db = require('../config/db');

exports.getAll = async (req, res) => {
  try {
    const userId = req.user.id; // extracted from JWT token
    const result = await db.query(
      'SELECT * FROM user_features WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Feature controller error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error retrieving feature data'
    });
  }
};
```

---

## 7. Styling, Design System & Theme Guidelines

Mentara Learning uses a high-contrast dark theme by default with clean neon glassmorphism accents, and supports a light theme via `.light` / `html.light`.

### Color Palette Reference
| Element | Hex / Style | Usage |
| :--- | :--- | :--- |
| **Background Dark** | `#020617` / `#09090B` | Page and sidebar backgrounds |
| **Card Surface** | `rgba(255, 255, 255, 0.03)` | Glass panels with `backdrop-filter: blur(16px)` |
| **Card Border** | `rgba(255, 255, 255, 0.08)` | Subtle border styling |
| **Primary Brand** | `#7C3AED` (Violet) / `#00D4FF` (Cyan) | Gradient accents, primary CTA buttons |
| **Success** | `#10B981` (Emerald) | Completed tasks, passing grades |
| **Premium / Amber** | `#F59E0B` (Amber) | Pro badges, streak icons |
| **Primary Text** | `#FFFFFF` / `#F4F4F5` | Headings and titles |
| **Muted Text** | `#94A3B8` / `#71717A` | Sub-labels, dates, instructions |

### Typography
- Headings: `font-family: 'Outfit', sans-serif`
- Labels & Badges: `font-family: 'Space Grotesk', monospace`
- Body Text: `font-family: 'Quicksand', 'Inter', sans-serif`

### Reusable UI Components
Import standardized UI primitives from `@/components/ui`:
```javascript
import { PageWrapper, Button, Skeleton } from '@/components/ui';

export default function MyFeaturePage() {
  return (
    <PageWrapper className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold font-['Outfit'] text-white">Feature Title</h1>
        <Button variant="primary">Create New</Button>
      </div>
      {/* Feature Content */}
    </PageWrapper>
  );
}
```

---

## 8. Integration & Delivery Checklist

When handing over your feature, supply the following files/snippets:

### 📦 1. Frontend Code
- Complete folder: `frontend/src/features/<feature_name>/`
- API additions: The exported functions to append to `frontend/src/api/services.js`.
- Route registration snippet for `frontend/src/App.jsx`:
  ```javascript
  // 1. Lazy import:
  const MyFeaturePage = lazy(() => import('@/features/<feature_name>/MyFeaturePage'));

  // 2. Route inside role-protected Route block:
  <Route path="/student/my-feature" element={<MyFeaturePage />} />
  ```

### 📦 2. Backend Code (If applicable)
- Route file: `backend/src/routes/<feature_name>.routes.js`
- Controller file: `backend/src/controllers/<feature_name>.controller.js`
- Mount line for `backend/src/app.js`:
  ```javascript
  app.use('/api/<feature_name>', require('./routes/<feature_name>.routes'));
  ```

### 📦 3. Database Migration Script (If applicable)
A clean `.sql` file with table definitions:
```sql
CREATE TABLE IF NOT EXISTS feature_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 📦 4. Any New Dependencies
- Specify any third-party npm libraries you added with exact versions. (Keep additions minimal and check if existing libraries in `package.json` like `framer-motion`, `recharts`, or `lucide-react` already fulfill your requirement).

---

## 9. Quality Verification Before Handover

Before delivering the code, make sure:
1. `npm run build` inside `frontend/` succeeds with **0 errors**.
2. No hardcoded API URLs (always use `api.get('/endpoint')` so the proxy handles environment ports).
3. Responsive on desktop, tablet, and mobile viewports.
4. Clean cleanup in `useEffect` hooks (e.g., clear timers or event listeners).

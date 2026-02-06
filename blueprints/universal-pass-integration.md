# 🎫 Universal Pass Integration Proposal

**Generated:** 2026-02-05  
**Author:** Cursor Agent  
**Status:** Draft Proposal

---

## Executive Summary

This proposal outlines how to integrate the **Universal Pass Structure** into the existing HR ESS system. The pass provides a unified mobile-first interface for three user types:

1. **Candidate Pass** - Recruitment journey tracking
2. **Manager Pass** - Hiring manager dashboard
3. **Employee Pass** - Employee self-service

The design follows a "one layout, three modes" philosophy with a minimal front face and feature-rich menu system.

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIVERSAL PASS SYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Candidate   │  │   Manager    │  │   Employee   │          │
│  │    Pass      │  │    Pass      │  │    Pass      │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └────────────┬────┴────────────────┘                   │
│                      │                                          │
│              ┌───────▼───────┐                                  │
│              │  Unified API  │                                  │
│              │   /api/pass   │                                  │
│              └───────┬───────┘                                  │
│                      │                                          │
│     ┌────────────────┼────────────────┐                        │
│     │                │                │                         │
│     ▼                ▼                ▼                         │
│ ┌────────┐    ┌────────────┐    ┌──────────┐                   │
│ │Recruit │    │  Employee  │    │  Wallet  │                   │
│ │ Module │    │   Module   │    │ Generator│                   │
│ └────────┘    └────────────┘    └──────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Data Model Design

### 2.1 Unified Pass Schema

```typescript
interface UniversalPass {
  // Core Identity
  id: string;                    // CAND-BWT-120-001, EMP-2025-042, MAN-2025-121
  type: 'candidate' | 'manager' | 'employee';
  entityCode: string;            // Multi-entity support
  
  // Personal Information
  personal: {
    name: string;
    position: string;
    email: string;
    phone?: string;
    photo?: string;
    location?: string;
    // Candidate-specific
    visa?: string;
    expectedSalary?: number;
    noticePeriod?: number;
    relocationPreference?: boolean;
    // Employee-specific
    department?: string;
    joinDate?: string;
    employeeNumber?: string;
  };
  
  // Stage/Timeline
  stage: {
    current: number;
    labels: string[];
    status: string;              // "Confirm availability", "Pending documents"
    statusType: 'info' | 'warning' | 'action_required';
  };
  
  // Evaluation (Candidate/Manager)
  evaluation?: {
    profileFit?: number;
    softSkills?: number;
    technicalSkills?: number;
    interviewScore?: number;
    overallScore?: number;
    remarks?: string[];
  };
  
  // Menu Configuration
  menu: {
    options: MenuOption[];
  };
  
  // Support
  support: {
    whatsapp?: string;
    email: string;
    emergency?: string;
  };
  
  // Metadata
  createdAt: string;
  updatedAt: string;
  qrCode?: string;
  walletUrl?: string;
}

type MenuOption = 
  // Candidate options
  | 'timeline' | 'evaluation' | 'inbox' | 'save_wallet' | 'interview_tips' | 'calendar'
  // Manager options
  | 'candidate_timeline' | 'evaluation_panel' | 'interview_questions' | 'approvals' | 'hr_notes'
  // Employee options
  | 'profile' | 'payslips' | 'leave_balance' | 'requests' | 'policies';
```

### 2.2 Stage Configurations

```typescript
const STAGE_CONFIG = {
  candidate: {
    labels: ['Application', 'Screening', 'Assessment', 'Interview', 'Offer', 'Onboarding'],
    count: 6
  },
  manager: {
    labels: ['RRF Review', 'Shortlist', 'Interview', 'Evaluation', 'Offer Approval', 'Onboarding'],
    count: 6
  },
  employee: {
    labels: ['Probation', 'Confirmed', '1 Year', '3 Years', '5 Years', '10+ Years'],
    count: 6
  }
};
```

---

## 3. API Design

### 3.1 Pass Endpoints

```
GET    /api/pass/:id              # Get pass data
GET    /api/pass/:id/qr           # Get QR code (SVG/PNG)
GET    /api/pass/:id/wallet       # Download wallet file (.pkpass)
GET    /api/pass/:id/profile      # Get full profile
PATCH  /api/pass/:id/stage        # Update stage
POST   /api/pass/:id/evaluation   # Add evaluation score
GET    /api/pass/my               # Get current user's pass
```

### 3.2 Response Format

```json
{
  "pass": {
    "id": "CAND-BWT-120-001",
    "type": "candidate",
    "personal": {
      "name": "Sarah Jenkins",
      "position": "HR Specialist",
      "email": "sarah@example.com"
    },
    "stage": {
      "current": 3,
      "labels": ["Application", "Screening", "Assessment", "Interview", "Offer", "Onboarding"],
      "status": "Confirm availability",
      "statusType": "action_required"
    }
  },
  "qrCodeUrl": "/api/pass/CAND-BWT-120-001/qr",
  "walletUrl": "/api/pass/CAND-BWT-120-001/wallet"
}
```

---

## 4. Integration with Existing ESS

### 4.1 Mapping Table

| Pass Type | ESS Module | Data Source |
|-----------|------------|-------------|
| Employee Pass | `/api/employees` | Employee record |
| Employee Pass | `/api/leave/balance` | Leave balance |
| Employee Pass | `/api/attendance/today` | Current status |
| Candidate Pass | `/api/recruitment` | NEW - Recruitment module |
| Manager Pass | `/api/employees` + `/api/recruitment` | Combined |

### 4.2 New Recruitment Module Required

The candidate pass requires a new recruitment module:

```typescript
// New endpoints needed
GET    /api/recruitment/candidates              # List candidates
GET    /api/recruitment/candidates/:id          # Get candidate
POST   /api/recruitment/candidates              # Create candidate
PATCH  /api/recruitment/candidates/:id/stage    # Update stage
POST   /api/recruitment/candidates/:id/evaluate # Add evaluation
GET    /api/recruitment/candidates/:id/timeline # Full timeline
```

---

## 5. Frontend Components

### 5.1 Component Hierarchy

```
<UniversalPass>
├── <PassFrontFace>
│   ├── <BrandingHeader logo notifications />
│   ├── <PassTitle type={pass.type} />
│   ├── <IdentityBlock name position id photo />
│   ├── <QRCodeDisplay url={profileUrl} />
│   ├── <TimelineStrip stages={pass.stage} />
│   ├── <QuickStatus stage status />
│   └── <PassFooter onMenu onSupport />
│
├── <MenuPanel isOpen={menuOpen}>
│   └── <MenuOptions type={pass.type} options={pass.menu.options} />
│
├── <SupportPanel isOpen={supportOpen}>
│   └── <SupportOptions whatsapp email emergency />
│
└── <ProfilePage> (via QR or navigation)
    └── <FullProfile pass={pass} />
```

### 5.2 Pass Front Face Layout

```
┌─────────────────────────────────┐
│  [Logo]              [🔔 2]    │  ← Branding Header
├─────────────────────────────────┤
│                                 │
│       CANDIDATE PASS            │  ← Title
│                                 │
├─────────────────────────────────┤
│   ┌─────┐                       │
│   │ 📷  │  Sarah Jenkins        │  ← Identity Block
│   │     │  HR Specialist        │
│   └─────┘  CAND-BWT-120-001     │
│                                 │
├─────────────────────────────────┤
│         ┌─────────┐             │
│         │ ▓▓▓▓▓▓▓ │             │  ← QR Code
│         │ ▓▓▓▓▓▓▓ │             │
│         │ ▓▓▓▓▓▓▓ │             │
│         └─────────┘             │
│         Tap to view profile     │
│                                 │
├─────────────────────────────────┤
│  ○──●──○──○──○──○               │  ← Timeline
│  1  2  3  4  5  6               │
│     Assessment Phase            │
├─────────────────────────────────┤
│  ⚠️ Action Required             │  ← Quick Status
│  Confirm availability           │
├─────────────────────────────────┤
│  [☰ Menu]        [? Support]   │  ← Footer
└─────────────────────────────────┘
```

---

## 6. Wallet Integration

### 6.1 Apple Wallet (.pkpass)

Structure for Apple Wallet pass:

```json
{
  "formatVersion": 1,
  "passTypeIdentifier": "pass.ae.baynunah.hrpass",
  "serialNumber": "CAND-BWT-120-001",
  "teamIdentifier": "XXXXXXXXXX",
  "organizationName": "Baynunah",
  "description": "Candidate Pass",
  "logoText": "Baynunah HR",
  "foregroundColor": "rgb(255, 255, 255)",
  "backgroundColor": "rgb(0, 82, 147)",
  "generic": {
    "primaryFields": [
      {
        "key": "name",
        "label": "NAME",
        "value": "Sarah Jenkins"
      }
    ],
    "secondaryFields": [
      {
        "key": "position",
        "label": "POSITION",
        "value": "HR Specialist"
      },
      {
        "key": "stage",
        "label": "STAGE",
        "value": "Assessment"
      }
    ],
    "backFields": [
      {
        "key": "status",
        "label": "STATUS",
        "value": "Confirm availability"
      }
    ]
  },
  "barcode": {
    "format": "PKBarcodeFormatQR",
    "message": "https://ess.baynunah.ae/pass/CAND-BWT-120-001",
    "messageEncoding": "iso-8859-1"
  }
}
```

### 6.2 Google Wallet

Uses Google Wallet API with similar structure, JWT-based pass creation.

---

## 7. PWA Configuration

### 7.1 Manifest

```json
{
  "name": "Baynunah HR Pass",
  "short_name": "HR Pass",
  "description": "Your universal HR pass",
  "start_url": "/pass/my",
  "display": "standalone",
  "background_color": "#005293",
  "theme_color": "#005293",
  "icons": [
    {
      "src": "/icons/pass-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/pass-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 7.2 Service Worker for Offline

```javascript
// Cache pass data for offline viewing
const CACHE_NAME = 'hr-pass-v1';
const OFFLINE_URLS = [
  '/pass/my',
  '/api/pass/my',
  '/offline.html'
];

self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/pass/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return fetch(event.request)
          .then((response) => {
            // Update cache
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, response.clone());
            });
            return response;
          })
          .catch(() => cached); // Return cached if offline
      })
    );
  }
});
```

---

## 8. Implementation Phases

### Phase 1: Core Pass API (Week 1-2)
- [ ] Create pass data model in database
- [ ] Implement `/api/pass` endpoints
- [ ] QR code generation
- [ ] Employee pass integration

### Phase 2: Candidate Module (Week 3-4)
- [ ] Create recruitment module
- [ ] Candidate CRUD operations
- [ ] Stage management
- [ ] Evaluation system

### Phase 3: Frontend Pass UI (Week 5-6)
- [ ] Pass front face component
- [ ] Menu panel
- [ ] Profile page
- [ ] Support panel

### Phase 4: Wallet & PWA (Week 7-8)
- [ ] Apple Wallet generation
- [ ] Google Wallet integration
- [ ] PWA manifest
- [ ] Offline support

### Phase 5: Manager Features (Week 9-10)
- [ ] Manager pass view
- [ ] Approval workflows
- [ ] Interview scheduling
- [ ] Evaluation panel

---

## 9. Security Considerations

### 9.1 QR Code Security
- Signed URLs with expiry (24h default)
- Rate limiting on profile access
- Audit logging for all pass views

### 9.2 Pass Access Control
- Employee can only see their own pass
- Manager can see candidate passes in their pipeline
- HR can see all passes in their entity

### 9.3 Wallet Pass Updates
- Push notifications for stage changes
- Pass revocation capability
- Version control for pass updates

---

## 10. Technical Requirements

### 10.1 New Dependencies

```json
{
  "qrcode": "^1.5.3",
  "passkit-generator": "^3.0.0",
  "sharp": "^0.33.0"
}
```

### 10.2 Environment Variables

```env
# Wallet Configuration
APPLE_PASS_TYPE_ID=pass.ae.baynunah.hrpass
APPLE_TEAM_ID=XXXXXXXXXX
APPLE_PASS_CERT_PATH=/certs/pass.p12
APPLE_PASS_CERT_PASSWORD=

# Google Wallet
GOOGLE_WALLET_ISSUER_ID=
GOOGLE_WALLET_CLASS_ID=

# QR Code
QR_SIGNING_SECRET=
QR_EXPIRY_HOURS=24
```

---

## 11. Success Metrics

| Metric | Target |
|--------|--------|
| Pass load time | < 500ms |
| Offline availability | 100% |
| Wallet save rate | > 60% |
| QR scan success | > 95% |
| Mobile satisfaction | > 4.5/5 |

---

## 12. Next Steps

1. **Review this proposal** with stakeholders
2. **Research Agent** completes technical research on wallet integration
3. **Blueprint Agent** finalizes architecture diagrams
4. **POC Agent** builds initial pass component
5. **Decision** on build vs. buy for wallet generation

---

*This proposal was generated by the Cursor Agent based on the Universal Pass Structure concept.*

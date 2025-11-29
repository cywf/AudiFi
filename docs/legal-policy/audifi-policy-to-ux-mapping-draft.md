# AudiFi Policy-to-UX Mapping

**DRAFT – FOR REVIEW BY QUALIFIED LEGAL COUNSEL**

*Document Version: 1.0*  
*Last Updated: [DATE]*  
*Prepared by: Legal-and-Policy-Agent*

---

## 1. Purpose

This document maps legal and policy documents to specific UI flows and surfaces in the AudiFi platform. It identifies:
- Where policy links should appear
- What consent checkpoints are needed
- Suggested consent language (as drafts)
- Which policies apply to each flow

---

## 2. Key UI Flows and Policy Requirements

### 2.1 Account Creation and Signup

**Location:** `src/pages/SignupPage.tsx`

**Current State:**
- Checkbox for terms acceptance exists (lines 158-177)
- Links to `/terms` and `/privacy` routes (not yet implemented)

**Required Policy Links:**
| Policy | Link Location |
|--------|---------------|
| Terms of Service | Checkbox consent text |
| Privacy Overview | Checkbox consent text |
| Risk Disclosures | Optional additional link |

**Suggested Consent Text:**

```
DRAFT CONSENT TEXT – NOT FINAL LEGAL LANGUAGE

☐ I am at least 18 years old (or the age of majority in my jurisdiction), 
and I agree to the Terms of Service and Privacy Policy. I acknowledge 
that I have read and understood the Risk Disclosures regarding digital 
assets.
```

**Implementation Notes:**
- Update routes to serve actual policy pages
- Consider age verification checkbox
- Log consent timestamp and policy version

---

### 2.2 Track Creation / Content Upload

**Location:** `src/pages/CreateTrackPage.tsx`

**Current State:**
- Multi-step wizard for track creation
- No rights acknowledgment checkpoint
- No Master IPO specific terms acceptance

**Required Policy Links:**
| Policy | Where to Display |
|--------|------------------|
| Artist Minting & Master IPO Terms | Before final submission |
| Rights & Ownership Responsibility Policy | Before upload or in wizard |
| Risk Disclosures | Before minting step |
| Content & IP Policy | Before upload |

**Suggested Consent Points:**

**Step 1 or 2 (Upload):**
```
DRAFT CONSENT TEXT – NOT FINAL LEGAL LANGUAGE

By uploading this content, I confirm that:
• I own or have licensed all rights to this content
• I have obtained all necessary permissions from contributors
• This content does not infringe any third-party rights
• I have read the Content & IP Policy

☐ I understand and agree to these terms
```

**Final Step (Before Mint/Submit):**
```
DRAFT CONSENT TEXT – NOT FINAL LEGAL LANGUAGE

By initiating this Master IPO and minting NFTs, I confirm that:
• I have the full authority to designate this Master for a Master IPO
• I accept the Artist Minting & Master IPO Terms
• I understand the risks described in the Risk Disclosures
• I have consulted my own legal and tax advisors as appropriate
• I am solely responsible for any conflicts with existing agreements

☐ I have read, understood, and agree to the above terms
```

**Implementation Notes:**
- Add acknowledgment checkpoint before final mint action
- Link to Rights & Ownership Responsibility Policy prominently
- Consider modal or expandable disclosure section
- Log consent timestamp, policy versions, and content metadata

---

### 2.3 Marketplace Browse and Discovery

**Location:** `src/pages/MarketplacePage.tsx`

**Current State:**
- Marketplace grid with track cards
- No policy links or disclaimers in main browse area

**Required Policy Elements:**
| Element | Location |
|---------|----------|
| General disclaimer | Page footer or info section |
| Risk disclosure notice | Near "purchase" or "buy" actions |

**Suggested Disclaimer Text:**
```
DRAFT DISCLAIMER TEXT – NOT FINAL LEGAL LANGUAGE

NFTs and digital assets involve significant risks including potential 
total loss of value. Past performance does not guarantee future results. 
Review our Risk Disclosures before purchasing.
```

**Implementation Notes:**
- Add subtle disclaimer in marketplace header or footer
- No blocking consent needed for browsing
- Consent required at actual purchase step

---

### 2.4 NFT Purchase Flow

**Location:** `src/pages/TrackDetailPage.tsx` (Purchase modal)

**Current State:**
- Purchase modal with "Confirm Purchase" button
- No pre-purchase disclosures or consent

**Required Policy Links:**
| Policy | Where to Display |
|--------|------------------|
| Viewer & Collector Terms | Pre-purchase consent |
| Risk Disclosures | Pre-purchase warning |
| Terms of Service | Reference link |

**Suggested Consent Text (Pre-Purchase):**
```
DRAFT CONSENT TEXT – NOT FINAL LEGAL LANGUAGE

Before purchasing, please review and acknowledge:

☐ I have read and agree to the Viewer & Collector Terms

☐ I acknowledge the Risk Disclosures and understand that:
  • NFT values may decrease significantly or to zero
  • There is no guarantee of returns or liquidity
  • I may lose all funds invested
  • I am responsible for my own wallet security

☐ I am purchasing of my own volition, without reliance on any 
  representations or advice from AudiFi
```

**Implementation Notes:**
- Add consent checkboxes in purchase modal before "Confirm" button
- Require all checkboxes to enable purchase
- Log consent timestamp, policy versions, NFT identifier, and wallet address

---

### 2.5 V Studio Session Participation

**Location:** V Studio components (not yet implemented in codebase)

**Required Policy Links:**
| Policy | Where to Display |
|--------|------------------|
| Viewer & Collector Terms | Session entry gate |
| Community Guidelines | Session rules display |
| Privacy Overview | Recording/data notice |

**Suggested Consent Text (Session Entry):**
```
DRAFT CONSENT TEXT – NOT FINAL LEGAL LANGUAGE

By joining this V Studio session, you agree to:
• Follow session rules and community guidelines
• The Viewer & Collector Terms governing participation
• Allow session hosts to moderate participation

Note: Sessions may be recorded. See our Privacy Overview for data practices.

☐ I agree to the session terms
```

**Implementation Notes:**
- Gate session entry with consent acceptance
- Display session-specific rules if any
- Log consent per session

---

### 2.6 Wallet Connection

**Location:** `src/pages/SettingsPage.tsx` and wallet connection flows

**Current State:**
- Stub wallet connection in settings
- No specific disclosures

**Required Policy Elements:**
| Element | Location |
|---------|----------|
| Wallet security notice | Near connect button |
| Transaction responsibility | Pre-connection |

**Suggested Notice Text:**
```
DRAFT NOTICE TEXT – NOT FINAL LEGAL LANGUAGE

By connecting your wallet, you acknowledge that:
• You are solely responsible for your wallet security
• AudiFi does not have access to your private keys
• Blockchain transactions are generally irreversible
• You are responsible for all gas fees and transaction costs
```

**Implementation Notes:**
- Display notice before or during wallet connection
- No blocking consent required (included in ToS)
- Wallet address displayed after connection

---

### 2.7 Staking and Liquidity Features

**Location:** Not yet implemented

**Required Policy Links:**
| Policy | Where to Display |
|--------|------------------|
| Risk Disclosures | Pre-staking consent |
| Terms of Service | Reference |
| Staking-specific terms | If separate terms exist |

**Suggested Consent Text (Pre-Staking):**
```
DRAFT CONSENT TEXT – NOT FINAL LEGAL LANGUAGE

Staking involves locking your tokens for a specified period. By staking:

☐ I understand that staked tokens are locked and may not be 
  immediately withdrawable

☐ I understand staking rewards are not guaranteed

☐ I accept the risks described in the Risk Disclosures

☐ I understand there may be penalties or losses in certain conditions
```

---

### 2.8 Payment/Subscription Flows

**Location:** `src/pages/PricingPage.tsx`

**Current State:**
- Pricing tier comparison
- Simulated Stripe checkout
- No specific disclosures

**Required Policy Elements:**
| Element | Location |
|---------|----------|
| Subscription terms | Pre-checkout |
| Billing disclosures | Checkout flow |
| Third-party payment notice | Checkout flow |

**Suggested Notice Text (Pre-Checkout):**
```
DRAFT NOTICE TEXT – NOT FINAL LEGAL LANGUAGE

By subscribing, you agree to:
• Recurring billing as described in the pricing terms
• The Terms of Service governing your subscription
• Our cancellation and refund policy

Payment is processed by our third-party payment provider (Stripe). 
Your payment information is handled according to their privacy policy.
```

---

### 2.9 Footer Links (All Pages)

**Locations:**
- `src/pages/LandingPage.tsx` (lines 187-189)
- `src/pages/HowItWorksPage.tsx` (lines 261-264)
- `src/pages/WhyNFTTracksPage.tsx` (lines 288-291)
- `src/components/layout/MainLayout.tsx` (lines 93-96)

**Current State:**
- Footer contains "Terms" and "Privacy" links
- Links use `href="#"` (non-functional)

**Required Updates:**
| Current Link | Should Link To |
|--------------|----------------|
| Terms | `/legal/terms-of-service` or `/terms` |
| Privacy | `/legal/privacy` or `/privacy` |
| Docs | `/docs` or documentation site |

**Additional Links to Consider:**
- Risk Disclosures
- Content Policy
- Contact/Support

---

## 3. Policy Document to Flow Mapping

### 3.1 Terms of Service

**Applies To:**
- Account signup (primary consent)
- All platform usage

**Where Linked:**
- Signup checkbox
- Footer links
- Settings page
- Other policy documents (cross-reference)

---

### 3.2 Artist Minting & Master IPO Terms

**Applies To:**
- Track creation wizard
- Master IPO initiation
- NFT minting

**Where Linked:**
- Pre-mint consent in wizard
- Artist dashboard
- Rights & Ownership Policy

---

### 3.3 Viewer & Collector Terms

**Applies To:**
- NFT purchases
- V Studio participation
- Token holding

**Where Linked:**
- Purchase flow consent
- V Studio entry
- Marketplace pages

---

### 3.4 Rights & Ownership Responsibility Policy

**Applies To:**
- Artists uploading content
- Master IPO initiation

**Where Linked:**
- Upload flows
- Track creation wizard
- Artist Terms document

---

### 3.5 Content & IP Policy

**Applies To:**
- All content uploads
- User-generated content

**Where Linked:**
- Upload flows
- Terms of Service
- Report/DMCA flows

---

### 3.6 Risk Disclosures & Digital Asset Notice

**Applies To:**
- All NFT/token transactions
- Purchases, minting, staking

**Where Linked:**
- Signup flow (optional)
- Purchase consent
- Minting consent
- Staking consent
- Marketplace disclaimers

---

### 3.7 Privacy Overview

**Applies To:**
- All users
- Account creation
- Data processing

**Where Linked:**
- Signup checkbox
- Footer links
- Settings page

---

### 3.8 Label & Management Conflict Guidance

**Applies To:**
- Artists with existing agreements

**Where Linked:**
- Rights & Ownership Policy
- Artist onboarding
- Help/FAQ sections

---

## 4. Consent Logging Requirements

### 4.1 Data to Log

For each consent action, log:

| Field | Description |
|-------|-------------|
| `user_id` | User account identifier |
| `consent_type` | Type of consent (signup, purchase, mint, etc.) |
| `policy_document` | Policy document accepted |
| `policy_version` | Version of policy at time of consent |
| `timestamp` | UTC timestamp of consent |
| `ip_address` | User IP address (where applicable) |
| `user_agent` | Browser/client information |
| `context` | Additional context (e.g., NFT ID for purchase consent) |

### 4.2 Storage Recommendations

- Store consent logs in persistent, tamper-evident storage
- Retain for duration required by applicable laws
- Make accessible for compliance inquiries
- Implement backup and recovery procedures

---

## 5. UI Implementation Checklist

### 5.1 Immediate Updates Needed

- [ ] Create policy page routes (`/terms`, `/privacy`, etc.)
- [ ] Update footer links from `href="#"` to actual routes
- [ ] Add policy documents to served pages or documentation site
- [ ] Update signup checkbox to reference correct routes

### 5.2 Consent Flow Updates

- [ ] Add pre-mint acknowledgment in track creation wizard
- [ ] Add pre-purchase consent in purchase modal
- [ ] Add wallet connection notice
- [ ] Implement consent logging infrastructure

### 5.3 Future Implementation

- [ ] V Studio session entry gate
- [ ] Staking consent flow
- [ ] Subscription terms display
- [ ] Policy version tracking and update notifications

---

## 6. Branding Update Notes

As noted in the Legal Audit, the codebase currently uses "NFT Tracks" branding. When updating to "AudiFi" branding:

- Update all policy link text
- Update footer copyright notices
- Update any consent language referencing the platform name
- Ensure consistency across all policy documents and UI

---

*This document is provided for informational purposes only and does not constitute legal advice. All consent text examples are drafts requiring legal review before implementation.*

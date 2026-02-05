# Visual Mockups - HR ESS UAE Employee Portal
**Color-coded ASCII mockups demonstrating the proposed design**

---

## Color Reference Guide

```
NAVY = #003366 (Headers, Primary Buttons)
WHITE = #FFFFFF (Backgrounds, Cards)
GREY = #F7F9FB (Sections), #CBD5DF (Borders), #64748B (Text)
GREEN = #22C55E (Success, Positive icons)
YELLOW = #FB923C (Warnings, Pending)
RED = #F87171 (Errors, Urgent)
```

---

## Mockup 1: Login Page (No Header Design)

```
┌──────────────────────────────────────────────────────────────┐
│                        (WHITE CANVAS)                         │
│                                                               │
│                                                               │
│                     [COMPANY LOGO]                            │
│                   HR Employee Portal                          │
│                                                               │
│              ┌─────────────────────────────────┐             │
│              │                                 │             │
│              │    Sign In to Your Account     │             │
│              │                                 │             │
│              │  Email Address                  │             │
│              │  ┌───────────────────────────┐ │             │
│              │  │ ahmed@company.ae          │ │ (grey border)
│              │  └───────────────────────────┘ │             │
│              │                                 │             │
│              │  Password                       │             │
│              │  ┌───────────────────────────┐ │             │
│              │  │ ●●●●●●●●●●                │ │ (grey border)
│              │  └───────────────────────────┘ │             │
│              │                                 │             │
│              │  ┌───────────────────────────┐ │             │
│              │  │    SIGN IN                 │ │ (NAVY #003366)
│              │  └───────────────────────────┘ │ (white text)
│              │                                 │             │
│              │      Forgot password?           │ (grey link)
│              │                                 │             │
│              └─────────────────────────────────┘             │
│                     (WHITE CARD WITH                          │
│                      SUBTLE SHADOW)                           │
│                                                               │
│                                                               │
│         support@company.ae  |  IT Help: ext 5555             │
│                        (GREY TEXT)                            │
└──────────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Centered card, maximum 400px wide
- Ample whitespace around card
- Navy button stands out against white
- Footer information doesn't compete

---

## Mockup 2: Dashboard Home (With Header)

```
╔══════════════════════════════════════════════════════════════╗
║  [LOGO]  Home   Attendance   Leave   Requests   Profile   [AA] ║ (NAVY #003366)
║                                                              ║ (White text)
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Good morning, Ahmed Al-Mansoori                            ║ (28px)
║  Monday, February 5, 2026                                   ║ (grey)
║                                                              ║
║  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
║  │              │  │              │  │              │  │              │
║  │  ⏰ Quick    │  │  📊 Leave    │  │  📋 Pending  │  │  📅 Events   │
║  │  Actions     │  │  Balance     │  │  Items       │  │             │
║  │              │  │              │  │              │  │              │
║  │ ┌──────────┐ │  │              │  │              │  │  Training    │
║  │ │CLOCK IN  │ │  │   ●●●●●●○○○○ │  │     ⚠ 2     │  │  Feb 10      │
║  │ └──────────┘ │  │              │  │              │  │              │
║  │              │  │  18 / 30     │  │  Awaiting    │  │  Team Lunch  │
║  │ Status: Out  │  │  days left   │  │  your review │  │  Feb 12      │
║  │              │  │              │  │              │  │              │
║  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
║  (NAVY button)     (GREEN circles)   (YELLOW alert)     (Info)
║                                                              ║
║  Recent Activity                                            ║ (20px bold)
║  ┌────────────────────────────────────────────────────────┐ ║
║  │ Date    Status         Description                     │ ║ (GREY bg)
║  ├────────────────────────────────────────────────────────┤ ║
║  │ Feb 5   ✓ Approved    Leave Request: Feb 20-22        │ ║ (GREEN ✓)
║  │ Feb 4   ⚠ Pending     Expense Claim: AED 450          │ ║ (YELLOW ⚠)
║  │ Feb 3   ✓ Completed   Attendance: Remote Work         │ ║ (GREEN ✓)
║  │ Feb 2   ⚠ Review      Document Upload: Visa Renewal   │ ║ (YELLOW ⚠)
║  └────────────────────────────────────────────────────────┘ ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Design Notes:**
- Navy header creates strong visual anchor
- Four widget cards use white with subtle shadows
- Color-coded status indicators (green/yellow) instantly communicate state
- Table has alternating row backgrounds (white/light grey)

---

## Mockup 3: Leave Request Form

```
╔══════════════════════════════════════════════════════════════╗
║  [LOGO]  Home   Attendance   Leave   Requests   Profile   [AA] ║ (NAVY)
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Home > Leave Management > New Request                      ║ (breadcrumb)
║                                                              ║
║  ┌─────────────────────────────────────────────────────────┐║
║  │                                                          │║
║  │  Request Annual Leave                                   │║ (24px)
║  │                                                          │║
║  │  Leave Type                                             │║
║  │  ┌────────────────────────────────────────────────────┐│║
║  │  │ Annual Leave                                      ▼ ││║
║  │  └────────────────────────────────────────────────────┘│║
║  │                                                          │║
║  │  Start Date                    End Date                 │║
║  │  ┌──────────────────────┐    ┌──────────────────────┐ │║
║  │  │ 📅 Feb 20, 2026      │    │ 📅 Feb 22, 2026      │ │║
║  │  └──────────────────────┘    └──────────────────────┘ │║
║  │                                                          │║
║  │  Total: 3 workdays                                      │║ (grey text)
║  │                                                          │║
║  │  Reason for Leave                                       │║
║  │  ┌────────────────────────────────────────────────────┐│║
║  │  │ Family vacation in Abu Dhabi                        ││║
║  │  │                                                      ││║
║  │  │                                                      ││║
║  │  └────────────────────────────────────────────────────┘│║
║  │                                                          │║
║  │  ╔══════════════════════════════════════════════════╗  │║
║  │  ║ ℹ  You have 18 days of annual leave available   ║  │║ (BLUE tint)
║  │  ║    This request will use 3 days                  ║  │║
║  │  ╚══════════════════════════════════════════════════╝  │║
║  │                                                          │║
║  │  ┌──────────────────┐  ┌────────────────────┐         │║
║  │  │  SUBMIT REQUEST  │  │     CANCEL         │         │║
║  │  └──────────────────┘  └────────────────────┘         │║
║  │  (NAVY button)         (WHITE w/ grey border)          │║
║  │                                                          │║
║  └─────────────────────────────────────────────────────────┘║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Design Notes:**
- Breadcrumb navigation helps orientation
- Date pickers show calendar icons
- Info box (blue tint) provides helpful context
- Primary action (navy) vs secondary action (white) clearly differentiated

---

## Mockup 4: Attendance Clock In Screen

```
╔══════════════════════════════════════════════════════════════╗
║  [LOGO]  Home   Attendance   Leave   Requests   Profile   [AA] ║ (NAVY)
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║                                                              ║
║                     Current Time                            ║
║                     08:15:32 AM                             ║ (64px)
║                                                              ║
║                                                              ║
║              Status: You are clocked out                    ║ (grey)
║                                                              ║
║                                                              ║
║              Work Location                                  ║
║              ┌───────────────────────────────┐             ║
║              │ Office - Dubai              ▼ │             ║
║              └───────────────────────────────┘             ║
║                                                              ║
║                                                              ║
║                  ┌───────────────────┐                      ║
║                  │                   │                      ║
║                  │   CLOCK IN NOW    │                      ║ (NAVY, large)
║                  │                   │                      ║
║                  └───────────────────┘                      ║
║                                                              ║
║                                                              ║
║  ┌─────────────────────────────────────────────────────────┐║
║  │  Today's Hours          This Week              Month    │║
║  │     0h 0m                32h 15m               128h 30m  │║ (green text)
║  └─────────────────────────────────────────────────────────┘║
║                                                              ║
║  This Week's Activity                                       ║
║  ┌────────────────────────────────────────────────────────┐ ║
║  │ Date      Clock In    Clock Out    Location    Hours   │ ║
║  ├────────────────────────────────────────────────────────┤ ║
║  │ Feb 5     --:--       --:--         --          0:00   │ ║
║  │ Feb 4     08:00 AM    05:15 PM      Office      9:15   │ ║ (GREEN)
║  │ Feb 3     08:30 AM    05:00 PM      Remote      8:30   │ ║
║  │ Feb 2     08:15 AM    05:45 PM      Office      9:30   │ ║ (GREEN)
║  │ Feb 1     08:00 AM    05:00 PM      Office      9:00   │ ║ (GREEN)
║  └────────────────────────────────────────────────────────┘ ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Design Notes:**
- Large clock display is focal point
- Status clearly stated
- Big navy button for primary action
- Summary cards show key metrics
- History table for context

---

## Mockup 5: Alert/Notification Examples

### Success Alert (After Submitting Request)
```
┌──────────────────────────────────────────────────────────────┐
│ ┃  ✓  Leave request submitted successfully                  │
│ ┃     Reference number: LV-2026-0045                        │
│ ┃     You will be notified when reviewed                    │
└──────────────────────────────────────────────────────────────┘
(Light GREEN bg #F0FDF4, GREEN left border #22C55E, GREEN ✓)
```

### Warning Alert (Pending Approval)
```
┌──────────────────────────────────────────────────────────────┐
│ ┃  ⚠  Your leave request is pending manager approval        │
│ ┃     Submitted 2 days ago - Average response: 48 hours     │
└──────────────────────────────────────────────────────────────┘
(Light YELLOW bg #FFF7ED, YELLOW left border #FB923C, YELLOW ⚠)
```

### Error Alert (Validation Failed)
```
┌──────────────────────────────────────────────────────────────┐
│ ┃  ✗  Clock in failed - You are outside the office area     │
│ ┃     Please ensure location services are enabled           │
│ ┃     Contact HR if you need assistance: ext 5555           │
└──────────────────────────────────────────────────────────────┘
(Light RED bg #FEF2F2, RED left border #F87171, RED ✗)
```

**Design Notes:**
- 4px colored left border is primary visual cue
- Icon matches border color (outline style)
- Light tinted background (barely perceptible)
- Dark grey text remains readable
- Multi-line messages supported

---

## Mockup 6: Status Badge Components

```
Request Status Examples:

[ ● Pending ]     (YELLOW #FB923C - dot + text)
[ ✓ Approved ]    (GREEN #22C55E - checkmark + text)
[ ✗ Rejected ]    (RED #F87171 - X + text)
[ ◐ Reviewing ]   (BLUE #06B6D4 - half-circle + text)
[ ⏸ On Hold ]     (GREY #64748B - pause + text)

Leave Balance Progress:

Available: ●●●●●●●●●●●●○○○○○○    (18/30 days)
           (GREEN filled, GREY empty)

Used:      ●●●●●●●●●●●●          (12/30 days)
           (NAVY filled)

Offset:    ●●                     (2 days earned)
           (BLUE filled)
```

**Design Notes:**
- Color-coded for instant recognition
- Outline icons maintain consistency
- Progress indicators use filled circles
- Text always accompanies icons (accessibility)

---

## Mockup 7: Employee Profile Card

```
╔══════════════════════════════════════════════════════════════╗
║  [LOGO]  Home   Attendance   Leave   Requests   Profile   [AA] ║ (NAVY)
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ┌─────────────────────────────────────────────────────────┐║
║  │  ┌────┐                                                  │║
║  │  │ AA │  Ahmed Al-Mansoori                        [Edit] │║
║  │  └────┘  Software Engineer                              │║ (grey)
║  │          IT Department | Dubai Office                   │║ (grey)
║  │          Company A (Entity)                             │║ (grey)
║  ├─────────────────────────────────────────────────────────┤║
║  │                                                          │║
║  │  Personal  |  Employment  |  Documents  |  Settings     │║ (tabs)
║  │  ▔▔▔▔▔▔▔▔                                                │║ (active)
║  │                                                          │║
║  │  ┌──────────────────────┐    ┌──────────────────────┐  │║
║  │  │ Personal Information │    │ Contact Details      │  │║
║  │  ├──────────────────────┤    ├──────────────────────┤  │║
║  │  │ Employee ID          │    │ Email                │  │║
║  │  │ EMP001               │    │ ahmed@company.ae     │  │║
║  │  │                      │    │                      │  │║
║  │  │ Join Date            │    │ Mobile               │  │║
║  │  │ January 15, 2023     │    │ +971 50 123 4567    │  │║
║  │  │                      │    │                      │  │║
║  │  │ Nationality          │    │ Emergency Contact    │  │║
║  │  │ United Arab Emirates │    │ Sarah Al-Mansoori    │  │║
║  │  │                      │    │ +971 50 987 6543    │  │║
║  │  └──────────────────────┘    └──────────────────────┘  │║
║  │                                                          │║
║  │  ┌──────────────────────┐    ┌──────────────────────┐  │║
║  │  │ Leave Balance        │    │ Attendance Summary   │  │║
║  │  ├──────────────────────┤    ├──────────────────────┤  │║
║  │  │ Annual: 18/30 days   │    │ This Month           │  │║ (GREEN)
║  │  │ ●●●●●●●●●●●●○○○○○○   │    │ Present: 18 days    │  │║
║  │  │                      │    │ Late: 1 time        │  │║ (YELLOW)
║  │  │ Sick: 5/5 days       │    │ Absent: 0 days      │  │║
║  │  │ Offset: 2 days       │    │ On Leave: 0 days    │  │║ (BLUE)
║  │  └──────────────────────┘    └──────────────────────┘  │║
║  │                                                          │║
║  └─────────────────────────────────────────────────────────┘║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**Design Notes:**
- Avatar circle with initials
- Tabbed interface for different sections
- Information organized in cards (2-column grid)
- Color-coded metrics (green/yellow)
- Edit button (outline, grey) top-right

---

## Responsive Mobile View Example (Login)

```
┌─────────────────────────┐
│                         │
│    [COMPANY LOGO]       │
│   HR Employee Portal    │
│                         │
│ ┌─────────────────────┐ │
│ │  Sign In            │ │
│ │                     │ │
│ │  Email              │ │
│ │  ┌────────────────┐ │ │
│ │  │                │ │ │
│ │  └────────────────┘ │ │
│ │                     │ │
│ │  Password           │ │
│ │  ┌────────────────┐ │ │
│ │  │                │ │ │
│ │  └────────────────┘ │ │
│ │                     │ │
│ │  ┌────────────────┐ │ │
│ │  │   SIGN IN      │ │ │ (full width)
│ │  └────────────────┘ │ │
│ │                     │ │
│ │  Forgot password?   │ │
│ │                     │ │
│ └─────────────────────┘ │
│                         │
│  support@company.ae     │
│                         │
└─────────────────────────┘
(16px margins, full-width button, card expands)
```

---

## Icon Library Examples (Outline Only)

```
Positive/Success (GREEN #22C55E):
✓  Checkmark (approval)
➕ Plus (add new)
↑  Arrow up (submit)
👤 User add (onboard)

Neutral/Info (GREY #64748B):
ℹ  Information
📄 Document
🔍 Search
⚙  Settings
👤 User profile

Warning/Attention (YELLOW #FB923C):
⚠  Alert triangle
⏰ Clock (pending)
🔔 Bell (notification)
⏸  Pause (on hold)

Error/Danger (RED #F87171):
✗  X mark (rejection)
🚫 Stop circle
⚡ Urgent
🗑  Delete
```

**Design Notes:**
- All icons outline style (2px stroke)
- Consistent 24px size
- Colors match semantic meaning
- Always include text labels

---

## Summary: Key Visual Principles

1. **White Space is Premium Space**
   - Generous margins (32px desktop, 16px mobile)
   - Cards never touch edges
   - Breathing room around all elements

2. **Navy Anchors the Design**
   - Header bar creates strong top edge
   - Primary buttons draw attention
   - Consistent brand presence

3. **Color Communicates Status**
   - Green = positive, approved, success
   - Yellow = attention, pending, warning
   - Red = error, rejection, urgent
   - Users don't need to read text to understand state

4. **Hierarchy Through Size, Not Color**
   - Page titles: 28px
   - Section headers: 20px
   - Body text: 15px
   - Small labels: 13px

5. **Accessibility First**
   - All contrasts meet WCAG AA
   - Keyboard navigation works everywhere
   - Screen reader friendly
   - Color not sole indicator (icons + text)

---

**These mockups demonstrate the complete visual language for the UAE HR ESS portal, ready for implementation.**

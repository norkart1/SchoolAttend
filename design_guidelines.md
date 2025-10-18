# School Attendance Management System - Design Guidelines

## Design Approach

**Selected Framework:** Design System Approach - Material Design 3 inspired with modern admin panel aesthetics
**Rationale:** This is a utility-focused, data-intensive application requiring clarity, efficiency, and enterprise-grade usability. The design draws from successful admin platforms like Linear, Notion, and Google Workspace while maintaining institutional professionalism suitable for school environments.

**Key Design Principles:**
- Information clarity over visual flair
- Efficient workflows with minimal clicks
- Data visualization that communicates at a glance
- Professional aesthetic appropriate for educational institutions

---

## Core Design Elements

### A. Color Palette

**Dark Mode (Primary):**
- Background: 220 15% 10% (deep slate)
- Surface: 220 15% 15% (elevated cards)
- Surface Elevated: 220 15% 18% (modals, dropdowns)
- Primary: 210 90% 55% (vibrant blue for actions)
- Success: 142 70% 45% (attendance present)
- Warning: 38 95% 55% (low attendance alerts)
- Danger: 0 80% 55% (absent status)
- Text Primary: 0 0% 95%
- Text Secondary: 0 0% 70%
- Border: 220 15% 25%

**Light Mode:**
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Surface Elevated: 0 0% 100% with subtle shadow
- Primary: 210 90% 50%
- Success: 142 70% 40%
- Warning: 38 95% 50%
- Danger: 0 80% 50%
- Text Primary: 220 15% 15%
- Text Secondary: 220 10% 40%
- Border: 0 0% 90%

### B. Typography

**Font Families:**
- Primary: Inter (via Google Fonts) - for UI, forms, data tables
- Monospace: JetBrains Mono - for IDs, timestamps

**Scale:**
- Hero numbers (dashboard stats): text-5xl font-bold
- Page titles: text-3xl font-semibold
- Section headers: text-xl font-semibold
- Card titles: text-lg font-medium
- Body text: text-base font-normal
- Labels: text-sm font-medium
- Captions/metadata: text-xs font-normal

### C. Layout System

**Spacing Primitives:** Consistently use Tailwind units of 2, 4, 6, 8, 12, 16, 20
- Tight spacing (within components): p-2, gap-2
- Standard spacing (between elements): p-4, gap-4, m-4
- Section spacing: p-6, py-8
- Large spacing (page sections): p-12, py-16, gap-16
- Card padding: p-6
- Form field spacing: space-y-4

**Grid System:**
- Dashboard stats: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- Student cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Content + sidebar: lg:grid-cols-[280px_1fr]

### D. Component Library

**Navigation:**
- Top navbar: Fixed header with logo, search, theme toggle, admin profile (h-16)
- Sidebar: Collapsible navigation (w-64 when expanded, w-16 when collapsed) with icons and labels
- Navigation items: Rounded corners (rounded-lg), hover state with subtle background change

**Dashboard Cards:**
- Stat cards: White/dark surface with colored left border accent (border-l-4), large number display, small label, percentage change indicator with up/down arrows
- Quick action cards: Icon + title + description layout with hover elevation
- Chart containers: Minimal borders, clear axis labels, smooth gradients for area charts

**Tables:**
- Striped rows for better readability (every odd row slightly darker)
- Sticky headers on scroll
- Row hover states with background change
- Action buttons (view/edit) appear on row hover
- Sortable column headers with arrow indicators
- Pagination at bottom with page numbers and jump controls

**Forms:**
- Floating labels or top-aligned labels
- Input fields with subtle borders, focus state with primary color ring
- Profile image upload: Large circular preview (w-32 h-32) with camera icon overlay on hover
- Required field indicators (red asterisk)
- Validation feedback inline below fields
- Submit buttons prominent, full-width on mobile

**Attendance Components:**
- Monthly calendar grid: 7-column layout with day headers, each date cell shows attendance status (color-coded dot or background tint)
- Status badges: Pill-shaped with appropriate colors (green=present, red=absent, yellow=leave)
- Leave request cards: Compact with date range, reason snippet, approval status

**Modals:**
- Centered overlay with backdrop blur
- Max-width constraints (max-w-lg for forms, max-w-4xl for detailed views)
- Header with title and close button
- Footer with action buttons (cancel + primary action)

**Data Visualization:**
- Attendance trend line charts with smooth curves
- Comparison bar charts for class-wise attendance
- Radial progress indicators for individual attendance percentages
- Color-coded heat map for monthly attendance patterns

### E. Interactions

**Animations (Minimal, Purposeful):**
- Page transitions: None - instant for dashboard efficiency
- Modal entry: Fade in with slight scale (duration-200)
- Dropdown menus: Slide down with fade (duration-150)
- Hover states: Subtle color/background transitions (transition-colors duration-200)
- Loading states: Simple spinner or skeleton screens, no elaborate animations

**Micro-interactions:**
- Button click: Subtle scale down (active:scale-95)
- Checkbox/toggle: Smooth sliding/color change
- Success actions: Brief checkmark animation in success color
- Toast notifications: Slide in from top-right, auto-dismiss after 3s

---

## Page-Specific Guidelines

**Login Page:**
- Centered card (max-w-md) on neutral background
- School logo/name at top
- Username and password fields with visible password toggle
- Remember me checkbox
- Full-width primary button
- No distracting visuals - focus on functionality

**Dashboard:**
- 4-column stat overview at top (Total Students, Present Today, On Leave, Attendance Rate)
- Grid layout below with: attendance trend chart, top performers list, low attendance alerts, recent leave requests
- Quick actions sidebar: Mark Attendance, Add Student, View Reports
- All data should be scannable at a glance

**Student Registration:**
- Two-column form on desktop (stacks on mobile)
- Profile image upload prominent on left
- Form fields on right: Name, Address (textarea), Phone, Class/Grade
- Clear labels, validation messages
- Success message with option to add another student

**Attendance Tracking:**
- Student list view with search/filter by class
- Quick mark buttons (P/A/L) next to each student
- Batch actions: Mark all present, save changes
- Calendar view toggle for viewing historical data

**Leave Management:**
- Two sections: Pending Requests | Approved/Historical
- Leave cards show student photo, name, dates, reason
- Approve/reject actions for pending
- Date pickers for leave start/end with time inputs

**Student Profile:**
- Header with large profile photo, name, contact details
- Tabs: Attendance History | Leave Records | Profile Details
- Attendance percentage prominently displayed with progress circle
- Monthly calendar showing attendance pattern

---

## Images

**Profile Images:**
- Student profile photos: Circular avatars throughout (w-10 h-10 in lists, w-32 h-32 in profiles)
- Default avatar for students without photos: Colored circle with initials
- Upload preview: Large square with rounded corners, camera icon overlay on hover

**No Hero Images:** This is a utility application - no marketing-style hero sections needed. Focus remains on data and functionality.
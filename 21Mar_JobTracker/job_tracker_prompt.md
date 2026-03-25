## **Prompt: Create a Beautiful, Local-First Job Tracker AI (localhost)**

Create a premium, local-first Job Tracker as a single-page React application scaffolded with Vite. All data must persist in the browser using IndexedDB (use the `idb` library for a cleaner async API). No backend or authentication is needed, taking full advantage of the local-first architecture.

**Design Aesthetics & UI/UX Notes:**
- **Visual Excellence**: The UI must be stunning, modern, and highly polished—think Linear, Notion, or Trello-minimalist but with a premium feel. Use a carefully curated color palette, smooth gradients, and glassmorphism where appropriate. Avoid generic default colors.
- **Dynamic & Responsive**: Include subtle micro-animations for interactions (hover states, drag-and-drop, modal openings) to make the app feel alive and responsive. Ensure it looks perfect on both laptops and tablets.
- **Layout**: Clean, professional board layout. Each column should be independently scrollable without scrolling the entire page. Column headers should show the status name, an icon, and the count of cards.
- **Card Design**: Cards should be elegant and have subtle color coding or a left-border accent corresponding to their status. The form should validate required fields smoothly before saving, providing instant visually appealing feedback.

**Data Model — Each job card stores:**
- **Company Name**: (Text, required)
- **Job Title / Role**: (Text, required)
- **Location & Work Model**: (Optional, e.g., "Remote", "Hybrid", "San Francisco (On-site)")
- **LinkedIn/Job URL**: (URL, clickable icon/button on the card)
- **Priority**: (Dropdown/Tag: "High", "Medium", "Low" - visually indicated on the card)
- **Resume Used**: (Text / Dropdown of previously used resume names, e.g., "SDE_Resume_v3", "QA_Lead_Resume_Tech")
- **Date Applied**: (Auto-set on creation, editable date picker)
- **Salary Range/Expectation**: (Optional text, e.g., "₹25-30 LPA" or "$150-180K")
- **Next Action / Deadline**: (Optional text or date, e.g., "Follow up on Tuesday" or "Code Challenge due Friday")
- **Notes & Contacts**: (Optional rich-textarea for recruiter name/email, referral info, interview feedback, etc.)
- **Status**: (Maps directly to the Kanban column)

**Expanded Kanban Columns (drag-and-drop between them):**
1. **Wishlist**: Saved jobs I am interested in but haven't started preparing for yet.
2. **Preparing**: Actively matching my resume, writing cover letters, or hunting for referrals.
3. **Applied**: Application officially submitted.
4. **Follow-up**: Reached out to the recruiter or referral for an update.
5. **Screening**: Scheduled or completed initial HR/Recruiter phone screen.
6. **Interviewing**: Currently actively in the technical or behavioral interview rounds.
7. **Offer Negotiation**: Received an offer and currently discussing compensation.
8. **Declined**: I withdrew my application or declined the offer.
9. **Rejected**: Received a rejection notice.
10. **Ghosted/Closed**: No response after a significant time, or the position was closed without an interview.

**Core Features:**
- **Drag-and-Drop**: Fluid dragging of cards between columns (use `@dnd-kit/core` or `react-beautiful-dnd` with smooth drop animations).
- **CRUD Operations**: Add a new job via an elegant modal or sliding side-panel form. Edit any card inline or via the modal. Delete a card with a styled confirmation dialog to prevent accidental data loss.
- **Card Display**: The card must clearly show the company name, role, resume tag, days since applied (e.g., "Applied 3 days ago"), and a prominent, clickable URL icon for quick access.
- **Search & Filter**: A sleek top search bar to instantly filter jobs across all columns by company name, role, or resume used.
- **Instant Persistence**: All CRUD operations must persist instantly to IndexedDB without any lag.

**Nice-to-Have Features (Implement if straightforward):**
- **Theme Toggle**: A premium Light/Dark mode toggle with smooth color transitions.
- **Data Portability**: Export all data as a beautifully formatted JSON file for backup, and an Import JSON feature to seamlessly restore data.
- **Sorting**: Capability to sort cards within a column by date applied (newest/oldest) or company name.

**Tech Stack & Constraints:**
- **Frontend Framework**: React 18+ utilizing functional components and hooks.
- **Tooling**: Vite for incredibly fast build tooling.
- **Styling**: Tailwind CSS for all styling (focus heavily on clean, premium, and sophisticated UI design).
- **Database**: `idb` npm package for a lightweight IndexedDB wrapper.
- **Zero Backend**: No external database, no API calls, absolutely 100% local operation.

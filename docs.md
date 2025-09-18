You are an expert frontend engineer. Your task is to build Vybe’s **landing page** using:

- Next.js (latest)
- Tailwind CSS v4
- shadcn/ui components
- GSAP for animations

---

### Design Requirements
- **Style**: Professional, minimalist, modern.  
- **Themes**: Both light and dark.  
- **Colors (tokens):**
  - Light:
    - Background: #FFFFFF
    - Surface: #F6F7F9
    - Text: #0F172A
    - Muted text: #6B7280
    - Accent: #4F46E5
    - Line: #E5E7EB
  - Dark:
    - Background: #0B0F14
    - Surface: #11161C
    - Text: #E5E7EB
    - Muted text: #9CA3AF
    - Accent: #8B8DF7
    - Line: #1F2937

---

### Layout Structure
1. **Navbar**
   - Enlarged on load, subtle hover glow (like the portfolio screenshot).  
   - Shrinks into compact version when scrolling down.  
   - Links: Home, About, Looprooms, Feed, Creators, Contact.  
   - CTA button on right: “Join Waitlist”.  

2. **Hero Section**
   - Headline: *“Feel better, together.”*  
   - Subtext: *“Mood-guided rooms and creator content that help you grow.”*  
   - Primary CTA: “Join Waitlist”  
   - Secondary CTA: “See how it works” (scrolls down).  
   - Background GSAP animation (soft fade or floating elements).  

3. **How it Works**
   - Three steps with icons:
     - Pick a mood → Join a Looproom → Flow into a Loopchain.  

4. **Why Vybe**
   - Grid of cards:
     - Positive-only interactions
     - Verified creators
     - Feed fallback
     - Guided growth  

5. **Waitlist Block**
   - Email input, CTA button, success message.  

6. **Footer**
   - Minimal, clean links + brand.

---

### Responsive Rules
- Mobile: stacked layout, hamburger menu.  
- Tablet: balanced columns.  
- Desktop: grid layout with hero + visuals.  

---

### Animations
- Navbar hover + shrink with GSAP.  
- Section fade-ins on scroll.  
- CTA hover pulse.  

---

### Deliverables
- Fully working Next.js project with Tailwind v4 + shadcn + GSAP.  
- Reusable components (Navbar, Hero, Section, Footer).  
- Responsive design, light/dark mode toggle.  

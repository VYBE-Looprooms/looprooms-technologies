# Vybe Landing Page

A modern, responsive landing page for Vybe - a mood-driven, creator-led platform for connection, growth, and community.

## 🚀 Features

- **Modern Design**: Professional, minimalist design with light and dark themes
- **Responsive**: Fully responsive design that works on all devices
- **Animations**: Smooth GSAP animations for enhanced user experience
- **Accessibility**: Built with accessibility in mind using shadcn/ui components
- **Performance**: Optimized with Next.js 15 and Tailwind CSS v4

## 🛠 Tech Stack

- **Framework**: Next.js 15 (latest)
- **Styling**: Tailwind CSS v4 with custom Vybe color tokens
- **Components**: shadcn/ui for accessible, customizable UI components
- **Animations**: GSAP for high-performance animations
- **Theme**: next-themes for light/dark mode support
- **TypeScript**: Full TypeScript support for type safety

## 🎨 Design System

### Color Tokens

**Light Theme:**
- Background: `#FFFFFF`
- Surface: `#F6F7F9`
- Text: `#0F172A`
- Muted text: `#6B7280`
- Accent: `#4F46E5`
- Line: `#E5E7EB`

**Dark Theme:**
- Background: `#0B0F14`
- Surface: `#11161C`
- Text: `#E5E7EB`
- Muted text: `#9CA3AF`
- Accent: `#8B8DF7`
- Line: `#1F2937`

## 📱 Layout Structure

1. **Navbar** - Responsive navigation with theme toggle and mobile menu
2. **Hero Section** - Main headline with animated background elements
3. **How it Works** - Three-step process explanation
4. **Why Vybe** - Feature highlights in a grid layout
5. **Waitlist** - Email capture form with success state
6. **Footer** - Clean footer with links and branding

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Key Components

### Navbar
- Animated shrinking on scroll
- Mobile hamburger menu
- Theme toggle integration
- Smooth hover effects

### Hero
- GSAP-powered entrance animations
- Floating background elements
- Responsive typography
- Call-to-action buttons

### How it Works
- Scroll-triggered animations
- Icon-based step visualization
- Responsive card layout

### Why Vybe
- Feature grid with hover effects
- Gradient backgrounds
- Staggered animations

### Waitlist
- Form validation
- Loading states
- Success feedback
- Email capture

## 🔧 Customization

### Adding New Components

1. Create component in `src/components/`
2. Use shadcn/ui base components when possible
3. Follow the established color token system
4. Add GSAP animations for enhanced UX

### Modifying Colors

Update the CSS custom properties in `src/app/globals.css`:

```css
:root {
  --background: #FFFFFF;
  --foreground: #0F172A;
  /* ... other tokens */
}
```

### Adding Animations

Import and use GSAP in your components:

```tsx
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)
```

## 📦 Dependencies

### Core Dependencies
- `next`: ^15.5.3
- `react`: ^19.1.1
- `tailwindcss`: ^4.1.13
- `gsap`: ^3.13.0
- `next-themes`: ^0.4.6

### UI Components
- `lucide-react`: ^0.544.0 (icons)
- `class-variance-authority`: ^0.7.1
- `clsx`: ^2.1.1
- `tailwind-merge`: ^3.3.1

## 🌟 Performance Optimizations

- **Turbopack**: Enabled for faster development builds
- **Code Splitting**: Automatic with Next.js App Router
- **Image Optimization**: Next.js built-in image optimization
- **CSS Optimization**: Tailwind CSS purging and optimization
- **Animation Performance**: GSAP for 60fps animations

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

## 🎭 Animations

### Navbar
- Shrink animation on scroll
- Hover glow effects
- Mobile menu slide transitions

### Hero
- Staggered text entrance
- Floating background elements
- Button hover effects

### Sections
- Scroll-triggered fade-ins
- Card hover animations
- Staggered element reveals

## 🚀 Deployment

The app is ready for deployment on Vercel, Netlify, or any other Next.js-compatible platform.

### Vercel Deployment

1. Push to GitHub
2. Connect to Vercel
3. Deploy automatically

### Build for Production

```bash
npm run build
npm run start
```

## 📄 License

This project is part of the Vybe platform development.

---

Built with ❤️ for the Vybe community
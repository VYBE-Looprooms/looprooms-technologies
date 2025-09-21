'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname()
  
  // Pages that should not have the landing page navbar and footer
  const isAdminPage = pathname?.startsWith('/admin')
  const isAuthenticatedPage = pathname?.startsWith('/feed') || 
                             pathname?.startsWith('/profile') ||
                             pathname?.startsWith('/looproom') ||
                             pathname?.startsWith('/creator') ||
                             pathname?.startsWith('/dashboard')
  
  const shouldHideNavAndFooter = isAdminPage || isAuthenticatedPage

  return (
    <>
      {!shouldHideNavAndFooter && <Navbar />}
      {children}
      {!shouldHideNavAndFooter && <Footer />}
    </>
  );
}
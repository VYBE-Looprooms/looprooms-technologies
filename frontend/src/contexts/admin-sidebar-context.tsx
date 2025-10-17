"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
  isCollapsed: boolean
  isMobile: boolean
  toggleSidebar: () => void
  getContentOffset: () => string
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // Reset collapsed state on mobile
      if (mobile) {
        setIsCollapsed(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const toggleSidebar = () => {
    if (!isMobile) {
      setIsCollapsed(!isCollapsed)
    }
  }

  const getContentOffset = () => {
    if (isMobile) {
      return 'ml-0'
    }
    return isCollapsed ? 'ml-16' : 'ml-64'
  }

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      isMobile,
      toggleSidebar,
      getContentOffset
    }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
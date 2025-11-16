"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from 'next/navigation'
import Image from "next/image"

const Menu = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
)

const X = () => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

interface NavLink {
  label: string
  href: string
  requiresAuth?: boolean
}

interface NavigationBarProps {
  links?: NavLink[]
  hideHome?: boolean
}

export function NavigationBar({ links = [], hideHome = false }: NavigationBarProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/")

  const defaultLinks: NavLink[] = [
    { label: "Home", href: "/", requiresAuth: false },
    { label: "Browse", href: "/guest/info", requiresAuth: false },
    { label: "Services", href: "/#services", requiresAuth: false },
    { label: "Login", href: "/login", requiresAuth: false },
    { label: "Admin", href: "/admin/login", requiresAuth: false },
    { label: "Super Admin", href: "/super-admin/login", requiresAuth: false },
  ]

  const navLinks = links.length > 0 ? links : defaultLinks
  const filteredLinks = hideHome ? navLinks.filter((link) => link.label !== "Home") : navLinks

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-lg" : "bg-white/90 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 transition-opacity"
            title="Go to home"
          >
            <Image
              src="/images/smpi-logo.png"
              alt="SMPI Logo"
              width={40}
              height={40}
              className="sm:w-[50px] sm:h-[50px]"
            />
            <div>
              <h1 className="text-base sm:text-lg font-bold text-teal-700">SMPI</h1>
              <p className="text-xs hidden sm:block text-teal-600">Memorial Park</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                  isActive(link.href) ? "bg-teal-600 text-white shadow-md" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title={isOpen ? "Close menu" : "Open menu"}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Links */}
        {isOpen && (
          <div className="md:hidden pb-4 space-y-2 border-t border-gray-200">
            {filteredLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg transition-all duration-300 text-sm font-medium ${
                  isActive(link.href) ? "bg-teal-600 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  )
}

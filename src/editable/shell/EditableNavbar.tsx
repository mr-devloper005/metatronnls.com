'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, Menu, PlusCircle, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const navItems = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'profile').map((task) => ({ label: task.label, href: task.route })),
    []
  )

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[var(--editable-nav-bg)] text-[var(--editable-nav-text)] backdrop-blur-md">
      <nav className="mx-auto flex min-h-[78px] w-full max-w-[var(--editable-container)] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3" aria-label={`${SITE_CONFIG.name} home`}>
          <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-black/10 bg-[#f4f1ea] sm:h-11 sm:w-11">
            <Image src="/favicon.png" alt="" fill sizes="44px" className="object-cover" priority />
          </span>
          <span className="editable-display text-[2rem] font-semibold tracking-[-0.08em] text-black sm:text-[2.35rem]">
            {SITE_CONFIG.name.replace(/\.com$/i, '')}
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-4 lg:flex">
          {navItems.slice(0, 5).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 text-[11px] font-bold uppercase tracking-[0.22em] transition ${
                  active ? 'text-black' : 'text-black/68 hover:text-black'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>

        <form action="/search" className="hidden min-w-0 flex-1 justify-end xl:flex">
          <label className="flex w-full max-w-[280px] items-center gap-2 border-b border-black/18 pb-2">
            <Search className="h-4 w-4 shrink-0 text-black/60" />
            <input
              name="q"
              type="search"
              placeholder="Search the archive"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-black/42"
            />
          </label>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {session ? (
            <>
              <Link
                href="/create"
                className="hidden items-center gap-2 bg-[var(--editable-cta-bg)] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--editable-cta-text)] transition hover:brightness-95 sm:inline-flex"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Create
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden px-3 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-black/58 transition hover:text-black sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-2 border border-black/12 px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-black/72 transition hover:border-black/30 hover:text-black sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" /> Login
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-2 bg-[var(--editable-cta-bg)] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--editable-cta-text)] transition hover:brightness-95 sm:inline-flex"
              >
                <UserPlus className="h-3.5 w-3.5" /> Join
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="border border-black/12 bg-white p-3 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-black/10 bg-[var(--editable-nav-bg)] px-4 py-5 lg:hidden">
          <form action="/search" className="mb-5 flex items-center gap-2 border-b border-black/16 pb-2">
            <Search className="h-4 w-4 text-black/60" />
            <input name="q" type="search" placeholder="Search the archive" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-black/42" />
          </form>
          <div className="grid gap-1">
            {[{ label: 'Home', href: '/' }, ...navItems, { label: 'Contact', href: '/contact' }, ...(session ? [{ label: 'Create', href: '/create' }] : [{ label: 'Login', href: '/login' }, { label: 'Join', href: '/signup' }])].map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`px-4 py-3 text-sm font-bold uppercase tracking-[0.18em] ${
                    active ? 'bg-[var(--slot4-accent)] text-white' : 'text-black/74'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}
    </header>
  )
}

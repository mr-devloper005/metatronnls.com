'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'profile')
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  return (
    <footer className="border-t border-white/10 bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="mx-auto max-w-[var(--editable-container)] px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.9fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-4" aria-label={`${SITE_CONFIG.name} home`}>
              <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border border-white/15 bg-[#f4f1ea] sm:h-[4.5rem] sm:w-[4.5rem]">
                <Image src="/favicon.png" alt="" fill sizes="72px" className="object-cover" />
              </span>
              <span className="editable-display text-4xl font-semibold tracking-[-0.09em] text-white sm:text-5xl">
                {SITE_CONFIG.name.replace(/\.com$/i, '')}
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--slot4-muted-text)]">
              A bold image-and-profile discovery surface with cinematic pacing, sharper hierarchy, and calmer browsing.
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">Discover</p>
            <div className="mt-5 grid gap-3">
              {taskLinks.slice(0, 6).map((task) => (
                <Link key={task.key} href={task.route} className="inline-flex items-center gap-2 text-sm text-[var(--slot4-muted-text)] transition hover:text-white">
                  {task.label} <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">About</p>
            <div className="mt-5 grid gap-3">
              <Link href="/about" className="text-sm text-[var(--slot4-muted-text)] transition hover:text-white">Our story</Link>
              <Link href="/contact" className="text-sm text-[var(--slot4-muted-text)] transition hover:text-white">Contact</Link>
              {session ? (
                <>
                  <Link href="/create" className="text-sm text-[var(--slot4-muted-text)] transition hover:text-white">Create</Link>
                  <button type="button" onClick={logout} className="text-left text-sm text-[var(--slot4-muted-text)] transition hover:text-white">Logout</button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-[var(--slot4-muted-text)] transition hover:text-white">Login</Link>
                  <Link href="/signup" className="text-sm text-[var(--slot4-muted-text)] transition hover:text-white">Join</Link>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">Signal</p>
            <div className="mt-5 border border-white/10 bg-[#0d0d0d] p-5">
              <p className="text-sm leading-7 text-[var(--slot4-muted-text)]">
                Stay close to new stories, galleries, and profiles as they land across the site.
              </p>
              <Link href="/search" className="mt-5 inline-flex items-center gap-2 bg-[var(--slot4-accent)] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white">
                Search the archive <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-5 text-xs uppercase tracking-[0.14em] text-[var(--slot4-soft-muted-text)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span>{year} {SITE_CONFIG.name}. All rights reserved.</span>
            <div className="flex flex-wrap gap-4">
              <Link href="/about" className="transition hover:text-white">About</Link>
              <Link href="/contact" className="transition hover:text-white">Contact</Link>
              <Link href="/search" className="transition hover:text-white">Search</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

import Link from 'next/link'
import { ArrowRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title = 'Nothing published here yet',
  description = 'Fresh posts will appear here automatically once this section has published content.',
  actionLabel = 'Back to home',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section className={cn('border border-current/15 bg-current/[0.04] p-8 text-center', className)}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center bg-current/10">
        <SearchX className="h-6 w-6" />
      </div>
      <h2 className="mt-5 text-2xl font-semibold uppercase tracking-[-0.05em]">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-current/65">{description}</p>
      <Link href={actionHref} className="mt-6 inline-flex items-center gap-2 border border-current/15 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.18em] transition hover:bg-current hover:text-background">
        {actionLabel}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskLabel = 'posts', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description={`Published ${taskLabel} will appear here automatically. The page stays styled and navigable even when the feed is still empty.`}
      actionLabel="Explore the site"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Thanks for reaching out. Your request has been saved and routed through the contact workflow."
      actionLabel="Return home"
      actionHref="/"
    />
  )
}

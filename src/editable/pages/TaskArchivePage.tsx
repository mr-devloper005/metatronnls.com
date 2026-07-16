import Link from 'next/link'
import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronDown,
  Download,
  FileText,
  Globe,
  MapPin,
  Phone,
  Search,
  UserRound,
} from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const stripHtml = (value: string) => value
  .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/&lt;/gi, '<')
  .replace(/&gt;/gi, '>')
  .replace(/&quot;/gi, '"')
  .replace(/&#0?39;|&apos;/gi, "'")
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const hero = posts[0]
  const supporting = posts.slice(1)

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen bg-[var(--tk-bg)] text-[var(--tk-text)]">
        <header className="border-b border-[var(--tk-line)] bg-[linear-gradient(180deg,#080808_0%,#050505_100%)]">
          <div className="mx-auto max-w-[var(--editable-container)] px-6 py-14 sm:py-18 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_360px] lg:items-end">
              <div>
                <div className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.34em] text-[var(--tk-accent)]">
                  <span>{theme.kicker}</span>
                  <span className="h-1 w-1 rounded-full bg-[var(--tk-accent)] opacity-60" />
                  <span className="text-[var(--tk-muted)]">{label}</span>
                </div>
                <h1 className="editable-display mt-6 max-w-5xl text-balance text-[2.8rem] font-semibold leading-[0.9] tracking-[-0.08em] text-white sm:text-6xl lg:text-[5rem]">
                  {voice?.headline || `Browse ${label}`}
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--tk-muted)]">{voice?.description || theme.note}</p>
                {voice?.chips?.length ? (
                  <div className="mt-8 flex flex-wrap gap-2.5">
                    {voice.chips.map((chip) => (
                      <span key={chip} className="border border-[var(--tk-line)] bg-[var(--tk-surface)] px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">
                        {chip}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="editable-noise border border-white/10 bg-[var(--tk-accent)] p-6 text-white">
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/72">Current view</p>
                <p className="editable-display mt-4 text-3xl font-semibold tracking-[-0.07em]">{categoryLabel}</p>
                <p className="mt-4 text-sm leading-7 text-white/84">
                  <span className="font-semibold text-white">{posts.length}</span> {posts.length === 1 ? 'result' : 'results'} on page {page}.
                </p>
              </div>
            </div>

            <div className="mt-10 grid gap-4 border-t border-[var(--tk-line)] pt-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <form action={basePath} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative w-full sm:max-w-[280px]">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-12 w-full appearance-none border border-[var(--tk-line)] bg-[var(--tk-surface)] px-4 pr-10 text-sm font-medium text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <button className="inline-flex h-12 items-center justify-center bg-[var(--tk-accent)] px-6 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-on-accent)] transition hover:brightness-95">
                  Apply filter
                </button>
              </form>
              <Link href="/search" className="inline-flex items-center gap-2 text-sm font-medium text-[var(--tk-muted)] transition hover:text-white">
                Search everything <Search className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-[var(--editable-container)] px-6 py-12 sm:py-16 lg:px-8">
          {posts.length ? (
            <div className="grid gap-8">
              {hero ? <ArchiveLeadCard post={hero} task={task} basePath={basePath} /> : null}
              <ArchiveGrid task={task} posts={supporting} basePath={basePath} />
            </div>
          ) : (
            <div className="mx-auto max-w-xl border border-dashed border-[var(--tk-line)] bg-[var(--tk-surface)] px-8 py-16 text-center">
              <Search className="mx-auto h-7 w-7 text-[var(--tk-muted)]" />
              <h2 className="editable-display mt-5 text-2xl font-semibold tracking-[-0.06em] text-white">Nothing here yet</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">Try another category, or return after new {label.toLowerCase()} are published.</p>
            </div>
          )}

          {posts.length ? (
            <nav className="mt-14 flex flex-wrap items-center justify-center gap-3 text-sm">
              {pagination.hasPrevPage ? <Link href={pageHref(basePath, category, page - 1)} className="border border-[var(--tk-line)] px-5 py-3 font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)] transition hover:border-[var(--tk-accent)] hover:text-white">Previous</Link> : null}
              <span className="border border-[var(--tk-line)] bg-[var(--tk-surface)] px-5 py-3 font-bold uppercase tracking-[0.18em] text-[var(--tk-muted)]">Page {page} of {pagination.totalPages || 1}</span>
              {pagination.hasNextPage ? <Link href={pageHref(basePath, category, page + 1)} className="bg-[var(--tk-accent)] px-5 py-3 font-bold uppercase tracking-[0.18em] text-[var(--tk-on-accent)] transition hover:brightness-95">Next</Link> : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

function hrefFor(task: TaskKey, basePath: string, post: SitePost) {
  return `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
}

function ArchiveLeadCard({ post, task, basePath }: { post: SitePost; task: TaskKey; basePath: string }) {
  const href = hrefFor(task, basePath, post)
  const image = getImage(post)
  return (
    <Link href={href} className="group grid overflow-hidden border border-white/10 bg-[#090909] transition duration-500 hover:-translate-y-1 lg:grid-cols-[minmax(0,1.2fr)_420px]">
      <div className="relative min-h-[320px] overflow-hidden">
        <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.82)_0%,rgba(0,0,0,0.18)_100%)]" />
        <div className="absolute inset-0 flex items-end p-6 sm:p-8">
          <div className="max-w-2xl">
            <p className="text-[11px] font-bold uppercase tracking-[0.32em] text-[var(--tk-accent)]">{getCategory(post, 'Featured')}</p>
            <h2 className="mt-4 text-3xl font-semibold leading-[0.92] tracking-[-0.08em] text-white sm:text-5xl">{post.title}</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/78">{getSummary(post)}</p>
          </div>
        </div>
      </div>
      <div className="editable-noise flex flex-col justify-between bg-[var(--tk-accent)] p-6 text-white sm:p-8">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/76">Lead selection</p>
          <p className="editable-display mt-4 text-4xl font-semibold tracking-[-0.08em]">{getCategory(post, 'Featured')}</p>
          <p className="mt-4 text-sm leading-7 text-white/84">
            Open the full page to explore the complete post, images, and related entries.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 bg-black px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
          Open story <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  )
}

function ArchiveGrid({ task, posts, basePath }: { task: TaskKey; posts: SitePost[]; basePath: string }) {
  if (!posts.length) return null
  if (task === 'image') {
    return <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3">{posts.map((post, index) => <ImageArchiveCard key={post.id || post.slug} post={post} href={hrefFor(task, basePath, post)} index={index} />)}</div>
  }
  if (task === 'listing') {
    return <div className="grid gap-5 xl:grid-cols-2">{posts.map((post) => <ListingArchiveCard key={post.id || post.slug} post={post} href={hrefFor(task, basePath, post)} />)}</div>
  }
  if (task === 'profile') {
    return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{posts.map((post, index) => <ProfileArchiveCard key={post.id || post.slug} post={post} href={hrefFor(task, basePath, post)} index={index} />)}</div>
  }
  return <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{posts.map((post, index) => <ArchivePostCard key={post.id || post.slug} post={post} task={task} href={hrefFor(task, basePath, post)} index={index} />)}</div>
}

function ArchivePostCard({ post, task, href, index }: { post: SitePost; task: TaskKey; href: string; index: number }) {
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Article')
  return (
    <Link href={href} className="group block overflow-hidden border border-white/10 bg-[#0a0a0a] transition duration-500 hover:-translate-y-1.5">
      <div className="relative aspect-[16/11] overflow-hidden bg-[#151515]">
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(0,0,0,0.84)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--tk-accent)]">{category}</p>
          <h2 className="mt-2 line-clamp-2 text-2xl font-semibold leading-[0.94] tracking-[-0.07em] text-white">{post.title}</h2>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/34">Read {String(index + 2).padStart(2, '0')}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
    </Link>
  )
}

function ListingArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} className="group grid overflow-hidden border border-white/10 bg-[#0b0b0b] transition duration-500 hover:-translate-y-1 sm:grid-cols-[140px_minmax(0,1fr)]">
      <div className="flex min-h-[180px] items-center justify-center overflow-hidden bg-[#141414]">
        {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <BriefcaseBusiness className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <div className="p-6">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--tk-accent)]">{getCategory(post, 'Listing')}</p>
        <h2 className="mt-3 text-2xl font-semibold leading-[0.96] tracking-[-0.06em] text-white">{post.title}</h2>
        <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-xs font-medium text-[var(--tk-muted)]">
          {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {cleanDomain(website)}</span> : null}
        </div>
      </div>
    </Link>
  )
}

function ClassifiedArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} className="group flex flex-col justify-between border border-white/10 bg-[#0b0b0b] p-6 transition duration-500 hover:-translate-y-1.5">
      <div>
        <div className="flex items-start justify-between gap-4">
          <span className="editable-display text-3xl font-semibold tracking-[-0.06em] text-[var(--tk-accent)]">{price || 'Open offer'}</span>
          {condition ? <span className="border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/72">{condition}</span> : null}
        </div>
        <h2 className="mt-6 text-2xl font-semibold leading-[0.95] tracking-[-0.06em] text-white">{post.title}</h2>
        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--tk-muted)]">
        <span>{location || 'See details'}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)]" />
      </div>
    </Link>
  )
}

function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} className="group mb-5 block break-inside-avoid overflow-hidden border border-white/10 bg-[#0b0b0b] transition duration-500 hover:-translate-y-1">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.86)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--tk-accent)]">{getCategory(post, 'Gallery')}</p>
          <h2 className="mt-2 line-clamp-2 text-xl font-semibold leading-[0.95] tracking-[-0.05em] text-white">{post.title}</h2>
        </div>
      </div>
    </Link>
  )
}

function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} className="group flex gap-4 border border-white/10 bg-[#0c0c0c] p-6 transition duration-500 hover:-translate-y-1">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center bg-[var(--tk-accent)] text-white">
        <Globe className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[11px] font-bold uppercase tracking-[0.26em] text-white/34">Saved {String(index + 2).padStart(2, '0')}</span>
        <h2 className="mt-2 text-xl font-semibold leading-[0.96] tracking-[-0.05em] text-white">{post.title}</h2>
        <p className="mt-2 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        {website ? <p className="mt-4 truncate text-xs font-bold uppercase tracking-[0.18em] text-[var(--tk-accent)]">{cleanDomain(website)}</p> : null}
      </div>
    </Link>
  )
}

function PdfArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const category = getCategory(post, 'Document')
  return (
    <Link href={href} className="group flex flex-col border border-white/10 bg-[#0c0c0c] p-6 transition duration-500 hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center bg-[var(--tk-accent)] text-white"><FileText className="h-6 w-6" /></div>
        <span className="border border-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/72">{category}</span>
      </div>
      <h2 className="mt-6 text-2xl font-semibold leading-[0.95] tracking-[-0.06em] text-white">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">Open document <Download className="h-4 w-4" /></span>
    </Link>
  )
}

function ProfileArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} className="group flex flex-col items-center border border-white/10 bg-[#0b0b0b] p-7 text-center transition duration-500 hover:-translate-y-1">
      <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-[#161616]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.26em] text-white/34">Profile {String(index + 2).padStart(2, '0')}</p>
      <h2 className="mt-3 text-xl font-semibold leading-[0.96] tracking-[-0.05em] text-white">{post.title}</h2>
      {role ? <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--tk-accent)]">{role}</p> : null}
      <p className="mt-3 line-clamp-2 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}

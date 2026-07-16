import Link from 'next/link'
import {
  ArrowRight,
  Bookmark,
  Building2,
  FileText,
  Globe2,
  Image as ImageIcon,
  Play,
  UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { getEditablePostImage, postHref, toPlainText } from '@/editable/cards/PostCards'
import { EditableHeroCollage } from '@/editable/sections/EditableHeroCollage'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Globe2,
  image: ImageIcon,
  sbm: Bookmark,
  pdf: FileText,
  profile: UserRound,
}

function taskLabel(task: TaskKey) {
  return SITE_CONFIG.tasks.find((item) => item.key === task)?.label || task
}

function getExcerpt(post?: SitePost | null, limit = 130) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof content.body === 'string' && content.body) ||
    (typeof content.excerpt === 'string' && content.excerpt) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

function categoryOf(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? (post.content as Record<string, unknown>) : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

function latestPostImages(posts: SitePost[], max = 8) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const post of posts) {
    const img = getEditablePostImage(post)
    if (!img || img.includes('placeholder') || seen.has(img)) continue
    seen.add(img)
    out.push(img)
    if (out.length >= max) break
  }
  return out
}

function allHomePosts(posts: SitePost[], timeSections: HomeTimeSection[]) {
  return dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
}

function sectionPosts(posts: SitePost[], timeSections: HomeTimeSection[], fallbackStart: number, fallbackEnd: number) {
  const pooled = timeSections.flatMap((section) => section.posts)
  const merged = allHomePosts(posts, timeSections)
  return dedupePosts([...pooled, ...merged]).slice(fallbackStart, fallbackEnd)
}

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p className={`text-[11px] font-bold uppercase tracking-[0.34em] ${light ? 'text-white/70' : 'text-[var(--slot4-accent)]'}`}>
      {children}
    </p>
  )
}

function FeaturedStoryCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group relative block min-h-[420px] overflow-hidden border border-white/10 bg-black sm:min-h-[520px]">
      <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-[1.04]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.62)_48%,rgba(0,0,0,0.28)_100%)]" />
      <div className="absolute inset-y-0 left-0 w-[52%] min-w-[280px] bg-[linear-gradient(180deg,#ff1e1e_0%,#ff1e1e_75%,rgba(255,30,30,0.85)_100%)] editable-noise" />
      <div className="relative z-10 flex h-full items-end p-6 sm:p-10">
        <div className="max-w-3xl">
          <Eyebrow light>Adapt, respond, and elevate</Eyebrow>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-[0.92] tracking-[-0.08em] text-white sm:text-6xl lg:text-[5.4rem]">
            {post.title}
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/82 sm:text-base">{getExcerpt(post, 180)}</p>
          <span className="mt-8 inline-flex items-center gap-3 bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.24em] text-white transition group-hover:translate-x-1">
            Explore feature <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function PromoPanel({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <div className="editable-noise flex h-full flex-col justify-between border border-white/10 bg-[var(--slot4-accent)] p-6 text-white sm:p-8">
      <div>
        <Eyebrow light>Now showing</Eyebrow>
        <h3 className="mt-4 text-3xl font-semibold leading-[0.95] tracking-[-0.07em] sm:text-4xl">{title}</h3>
        <p className="mt-4 max-w-md text-sm leading-7 text-white/85">{description}</p>
      </div>
      <Link href={href} className="mt-8 inline-flex w-fit items-center gap-2 border border-white/30 bg-black/60 px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white transition hover:border-white hover:bg-black">
        Learn more <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

function ModelCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <div className="border border-white/10 bg-[#0a0a0a] p-4 sm:p-5">
      <Link href={href} className="group block">
        <div className="relative aspect-[16/10] overflow-hidden bg-[#121212]">
          <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.75)_100%)]" />
        </div>
        <div className="px-1 py-5 text-center">
          <h3 className="editable-display text-3xl font-semibold tracking-[-0.06em] text-white sm:text-4xl">{categoryOf(post).slice(0, 22)}</h3>
          <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{post.title}</p>
          <div className="mt-5 flex items-center justify-center gap-4">
            <span className="inline-flex items-center bg-[var(--slot4-accent)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white">Learn more</span>
            <span className="inline-flex items-center border border-white/15 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/72">Compare</span>
          </div>
        </div>
      </Link>
    </div>
  )
}

function DetailTile({ post, href, badge, tall = false }: { post: SitePost; href: string; badge: string; tall?: boolean }) {
  return (
    <Link href={href} className={`group relative block overflow-hidden border border-white/10 ${tall ? 'min-h-[520px]' : 'min-h-[420px]'}`}>
      <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.06]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18)_0%,rgba(0,0,0,0.8)_100%)]" />
      <div className="relative z-10 flex h-full flex-col justify-between p-6">
        <Eyebrow light>{badge}</Eyebrow>
        <div>
          <h3 className="max-w-sm text-3xl font-semibold leading-[0.94] tracking-[-0.07em] text-white sm:text-4xl">{post.title}</h3>
          <p className="mt-3 line-clamp-3 max-w-sm text-sm leading-6 text-white/72">{getExcerpt(post, 120)}</p>
          <span className="mt-5 inline-flex items-center gap-2 bg-[var(--slot4-accent)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
            View more <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function HorizontalStoryCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group grid overflow-hidden border border-white/10 bg-[#0d0d0d] transition duration-500 hover:-translate-y-1 sm:grid-cols-[minmax(0,1.18fr)_340px]">
      <div className="p-6 sm:p-8">
        <Eyebrow>{index % 2 === 0 ? 'New for the season' : 'Fresh perspective'}</Eyebrow>
        <h3 className="mt-5 text-3xl font-semibold leading-[0.94] tracking-[-0.07em] text-white sm:text-4xl">{post.title}</h3>
        <p className="mt-4 max-w-xl text-sm leading-7 text-[var(--slot4-muted-text)]">{getExcerpt(post, 180)}</p>
        <span className="mt-8 inline-flex items-center gap-2 border border-white/15 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white transition group-hover:border-[var(--slot4-accent)] group-hover:text-[var(--slot4-accent)]">
          Open story <ArrowRight className="h-4 w-4" />
        </span>
      </div>
      <div className="relative min-h-[280px] overflow-hidden bg-[#141414]">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
      </div>
    </Link>
  )
}

function EditorialListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link href={href} className="group flex items-start gap-4 border-b border-white/10 py-5 transition hover:border-[var(--slot4-accent)]/45">
      <span className="editable-display text-2xl font-semibold tracking-[-0.06em] text-white/28">{String(index + 1).padStart(2, '0')}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--slot4-accent)]">{categoryOf(post)}</p>
        <h3 className="mt-2 line-clamp-2 text-lg font-bold uppercase tracking-[-0.03em] text-white group-hover:text-[var(--slot4-accent)]">{post.title}</h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--slot4-muted-text)]">{getExcerpt(post, 110)}</p>
      </div>
    </Link>
  )
}

function ImageFirstCard({ post, href }: { post: SitePost; href: string }) {
  return (
    <Link href={href} className="group block overflow-hidden border border-white/10 bg-[#0c0c0c]">
      <div className="relative aspect-[3/4] overflow-hidden bg-[#121212]">
        <img src={getEditablePostImage(post)} alt={post.title} className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(0,0,0,0.82)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-[var(--slot4-accent)]">{categoryOf(post)}</p>
          <h3 className="mt-2 line-clamp-2 text-2xl font-semibold leading-[0.96] tracking-[-0.06em] text-white">{post.title}</h3>
        </div>
      </div>
    </Link>
  )
}

function SectionHeader({
  eyebrow,
  title,
  href,
  actionLabel,
}: {
  eyebrow: string
  title: string
  href: string
  actionLabel: string
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-3 text-3xl font-semibold leading-[0.95] tracking-[-0.07em] text-white sm:text-5xl">{title}</h2>
      </div>
      <Link href={href} className="inline-flex w-fit items-center gap-2 bg-[var(--slot4-accent)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
        {actionLabel} <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = allHomePosts(posts, timeSections)
  const heroImages = latestPostImages(pool)
  const featured = pool[0]
  const promo = pool[1] || pool[0]
  const model = pool[2] || pool[1] || pool[0]
  const categories = SITE_CONFIG.tasks.filter((task) => task.enabled).slice(0, 5)

  return (
    <section className="bg-[#050505] pt-0">
      <div className="relative min-h-[620px] overflow-hidden border-b border-white/10 lg:min-h-[760px]">
        <EditableHeroCollage images={heroImages} />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.68)_60%,rgba(0,0,0,0.92)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.18)_60%,rgba(0,0,0,0.45)_100%)]" />
        <div className={`relative z-10 flex min-h-[620px] flex-col justify-center py-14 lg:min-h-[760px] ${container}`}>
          <div className="max-w-4xl">
            <Eyebrow light>{pagesContent.home.hero.badge || 'Latest stories and visuals'}</Eyebrow>
            <h1 className="mt-5 max-w-5xl text-balance text-5xl font-semibold leading-[0.88] tracking-[-0.09em] text-white sm:text-7xl lg:text-[7.2rem]">
              {pagesContent.home.hero.title?.join(' ') || `Discover the best of ${SITE_CONFIG.name}`}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">{pagesContent.home.hero.description}</p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href={primaryRoute} className="inline-flex items-center gap-3 bg-[var(--slot4-accent)] px-6 py-4 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                Explore {taskLabel(primaryTask)} <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="flex items-center gap-4 text-white/55">
                <span className="h-3 w-3 rounded-full bg-white/25" />
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/15 text-white">
                  <Play className="ml-0.5 h-6 w-6 fill-current" />
                </span>
                <span className="h-3 w-3 rounded-full bg-white/25" />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-2.5">
              {categories.map((task) => {
                const Icon = taskIcon[task.key] || FileText
                return (
                  <Link
                    key={task.key}
                    href={task.route}
                    className="inline-flex items-center gap-2 border border-white/15 bg-black/35 px-4 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/76 transition hover:border-[var(--slot4-accent)] hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                    {task.label}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className={`${container} -mt-16 relative z-20 pb-8 sm:-mt-24`}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_420px]">
          {featured ? <FeaturedStoryCard post={featured} href={postHref(primaryTask, featured, primaryRoute)} /> : null}
          <div className="grid gap-6">
            {promo ? (
              <PromoPanel
                title={promo.title}
                description={getExcerpt(promo, 150) || 'Discover the latest visual stories, profiles, and standout posts through a more dramatic homepage experience.'}
                href={postHref(primaryTask, promo, primaryRoute)}
              />
            ) : null}
            {model ? <ModelCard post={model} href={postHref(primaryTask, model, primaryRoute)} /> : null}
          </div>
        </div>
      </div>
    </section>
  )
}

export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const lineup = sectionPosts(posts, timeSections, 0, 3)
  if (!lineup.length) return null

  return (
    <section className="border-t border-white/10 bg-[#050505] py-16 sm:py-20">
      <div className={container}>
        <SectionHeader eyebrow="2026 lineup" title={`Built around ${taskLabel(primaryTask).toLowerCase()} discovery`} href={primaryRoute} actionLabel="See more" />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {lineup.map((post, index) => (
            <DetailTile
              key={post.id || post.slug || post.title}
              post={post}
              href={postHref(primaryTask, post, primaryRoute)}
              badge={index === 0 ? 'Featured direction' : index === 1 ? 'Editorial focus' : 'Fresh collection'}
              tall={index === 0}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const feed = sectionPosts(posts, timeSections, 0, 6)
  if (!feed.length) return null
  const lead = feed[0]
  const supporting = feed.slice(1, 4)
  const list = feed.slice(1, 6)

  return (
    <section className="border-t border-white/10 bg-black py-16 sm:py-24">
      <div className={container}>
        <SectionHeader eyebrow="Equipped with intention" title="A mixed editorial rhythm, not one repeated card" href={primaryRoute} actionLabel="Browse archive" />
        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,1.18fr)_0.82fr]">
          <div className="grid gap-6">
            {lead ? <HorizontalStoryCard post={lead} href={postHref(primaryTask, lead, primaryRoute)} index={0} /> : null}
            <div className="grid gap-6 sm:grid-cols-3">
              {supporting.map((post) => (
                <ImageFirstCard key={post.id || post.slug || post.title} post={post} href={postHref(primaryTask, post, primaryRoute)} />
              ))}
            </div>
          </div>
          <div className="border border-white/10 bg-[#0b0b0b] p-6 sm:p-8">
            <Eyebrow>Editorial index</Eyebrow>
            <div className="mt-4">
              {list.map((post, index) => (
                <EditorialListCard key={post.id || post.slug || post.title} post={post} href={postHref(primaryTask, post, primaryRoute)} index={index} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const sectionCopy: Record<string, { eyebrow: string; title: string }> = {
  spotlight: { eyebrow: 'New for now', title: 'Current highlights' },
  browse: { eyebrow: 'Watch closely', title: 'Stories with momentum' },
  index: { eyebrow: 'Always on', title: 'More worth exploring' },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 4), href: primaryRoute },
          { key: 'browse', posts: posts.slice(4, 8), href: primaryRoute },
          { key: 'index', posts: posts.slice(8, 12), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || { eyebrow: 'Discover', title: 'More to explore' }
        const first = section.posts[0]
        const grid = section.posts.slice(1, 5)
        return (
          <section key={section.key} className={`border-t border-white/10 py-16 sm:py-24 ${index % 2 === 0 ? 'bg-[#070707]' : 'bg-[#101010]'}`}>
            <div className={container}>
              <SectionHeader eyebrow={copy.eyebrow} title={copy.title} href={section.href || primaryRoute} actionLabel="View section" />
              <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_1fr]">
                {first ? <HorizontalStoryCard post={first} href={postHref(primaryTask, first, primaryRoute)} index={index} /> : null}
                <div className="grid gap-6 sm:grid-cols-2">
                  {grid.map((post, cardIndex) => (
                    <DetailTile
                      key={post.id || post.slug || post.title}
                      post={post}
                      href={postHref(primaryTask, post, primaryRoute)}
                      badge={cardIndex % 2 === 0 ? 'Featured angle' : 'Next up'}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </>
  )
}

export function EditableHomeCta() {
  return (
    <section id="get-app" className="border-t border-white/10 bg-black py-16 sm:py-24">
      <div className={`${container}`}>
        <div className="editable-noise grid gap-8 bg-[var(--slot4-accent)] px-6 py-10 text-white sm:px-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_1.05fr] lg:items-center">
          <div>
            <Eyebrow light>{pagesContent.home.cta.badge || 'Start exploring'}</Eyebrow>
            <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-[0.92] tracking-[-0.08em] sm:text-6xl">{pagesContent.home.cta.title}</h2>
            <p className="mt-5 max-w-lg text-base leading-8 text-white/84">{pagesContent.home.cta.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              placeholder="First name"
              className="h-14 border border-transparent bg-white px-5 text-sm font-medium uppercase tracking-[0.08em] text-black outline-none placeholder:text-black/70"
            />
            <input
              placeholder="Last name"
              className="h-14 border border-transparent bg-white px-5 text-sm font-medium uppercase tracking-[0.08em] text-black outline-none placeholder:text-black/70"
            />
            <input
              placeholder={pagesContent.home.hero.searchPlaceholder || 'Your email'}
              className="h-14 border border-transparent bg-white px-5 text-sm font-medium uppercase tracking-[0.08em] text-black outline-none placeholder:text-black/70 sm:col-span-2 lg:col-span-1"
            />
            <div className="flex flex-wrap gap-3">
              <Link href="/create" className="inline-flex min-h-[56px] flex-1 items-center justify-center bg-black px-6 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                Create a post
              </Link>
              <Link href="/contact" className="inline-flex min-h-[56px] flex-1 items-center justify-center border border-white/35 px-6 text-[11px] font-bold uppercase tracking-[0.22em] text-white">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

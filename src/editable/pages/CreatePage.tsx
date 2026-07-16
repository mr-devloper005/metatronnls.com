'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2, Lock, Send } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const fieldClass = 'w-full rounded-[1rem] border border-transparent bg-[#f8f7f3] px-5 py-4 text-sm font-bold text-black outline-none transition placeholder:text-black/30 hover:bg-white focus:border-[#ff2020] focus:bg-white focus:ring-4 focus:ring-[#ff2020]/15'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen bg-black px-4 py-16 text-[#f5f3ed] sm:px-6 lg:px-8">
          <section className="mx-auto grid max-w-5xl gap-8 rounded-[2.8rem] border border-white/10 bg-[#111111] p-7 shadow-[0_30px_90px_rgba(0,0,0,0.5)] md:grid-cols-[0.9fr_1.1fr] md:p-10">
            <div className="flex h-full min-h-72 items-center justify-center rounded-[2rem] border border-white/10 bg-[#050505] text-[#f5f3ed]">
              <Lock className="h-20 w-20 text-[#ff2020] opacity-90" />
            </div>
            <div className="self-center">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-white/45">{pagesContent.create.locked.badge}</p>
              <h1 className="mt-5 text-5xl font-black leading-[0.92] tracking-[-0.08em] sm:text-7xl">{pagesContent.create.locked.title}</h1>
              <p className="mt-6 max-w-xl text-base font-semibold leading-8 text-white/65">{pagesContent.create.locked.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-full bg-[#f5f3ed] px-6 py-3 text-sm font-black text-black transition hover:bg-[#ff2020] hover:text-white">Login <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/signup" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-black text-white transition hover:border-white/50">Sign up</Link>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen overflow-hidden bg-black px-3 py-6 text-[#f5f3ed] sm:px-6 lg:px-8 lg:py-10">
        <section className="mx-auto max-w-[1536px]">
          <div className="grid gap-8 overflow-hidden rounded-[2.25rem] border border-white/10 bg-[#111111] p-6 shadow-[0_34px_100px_rgba(0,0,0,0.5)] sm:rounded-[3rem] sm:p-10 lg:min-h-[740px] lg:grid-cols-[0.83fr_1.17fr] lg:gap-12 xl:p-12">
            <aside className="flex flex-col py-1 lg:py-0">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#f5f3ed]/90">{pagesContent.create.hero.badge}</p>
              <h1 className="mt-7 max-w-[650px] text-[clamp(3rem,5vw,4.75rem)] font-black uppercase leading-[0.88] tracking-[-0.075em] text-[#f5f3ed]">
                {pagesContent.create.hero.title}
              </h1>
              <p className="mt-7 max-w-[610px] text-sm font-bold leading-8 text-[#f5f3ed]/75 sm:text-base">{pagesContent.create.hero.description}</p>
            </aside>

            <form onSubmit={submit} className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-[#050505] p-5 text-[#f5f3ed] shadow-[0_24px_60px_rgba(0,0,0,0.26)] sm:p-7 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <label htmlFor="create-task" className="sr-only">Content type</label>
                  <select
                    id="create-task"
                    value={task}
                    onChange={(event) => setTask(event.target.value as TaskKey)}
                    className="mb-2 bg-transparent text-[10px] font-black uppercase tracking-[0.24em] text-white/55 outline-none"
                  >
                    {enabledTasks.map((item) => (
                      <option key={item.key} value={item.key} className="bg-black text-white">Create {item.label}</option>
                    ))}
                  </select>
                  <h2 className="mt-2 text-3xl font-black uppercase leading-none tracking-[-0.06em] sm:text-[2rem]">{pagesContent.create.formTitle}</h2>
                </div>
                <span className="max-w-[180px] truncate rounded-full bg-[#f8f7f3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-black">{session.name}</span>
              </div>

              <div className="mt-7 grid flex-1 content-start gap-4">
                <label className="sr-only" htmlFor="create-title">Post title</label>
                <input id="create-title" className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="sr-only" htmlFor="create-category">Category</label>
                  <input id="create-category" className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                  <label className="sr-only" htmlFor="create-url">Website or source URL</label>
                  <input id="create-url" type="url" className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                </div>
                <label className="sr-only" htmlFor="create-image">Featured image URL</label>
                <input id="create-image" type="url" className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                <label className="sr-only" htmlFor="create-summary">Short summary</label>
                <textarea id="create-summary" className={`${fieldClass} min-h-24 resize-y`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                <label className="sr-only" htmlFor="create-body">Main content</label>
                <textarea id="create-body" className={`${fieldClass} min-h-48 resize-y lg:min-h-[192px]`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details, notes, or description" required />
              </div>

              {created ? (
                <div className="mt-4 rounded-[1rem] border border-emerald-400/30 bg-emerald-400/10 p-4 text-emerald-200" role="status">
                  <p className="flex items-center gap-2 text-sm font-black"><CheckCircle2 className="h-5 w-5" /> {pagesContent.create.successTitle}</p>
                  <p className="mt-1 text-sm font-semibold opacity-80">{created.title}</p>
                </div>
              ) : null}

              <button type="submit" className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[1rem] bg-[#f1eee7] px-6 text-xs font-black uppercase tracking-[0.22em] text-black transition duration-300 hover:-translate-y-0.5 hover:bg-[#ff2020] hover:text-white focus:outline-none focus:ring-4 focus:ring-[#ff2020]/30 active:translate-y-0">
                <Send className="h-4 w-4" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}

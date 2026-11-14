import axios from 'axios'
declare global {
  interface ImportMetaEnv {
    readonly VITE_API_URL?: string
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv
  }
}

export const api = axios.create({baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000', timeout: 30000})
// Connect these helpers to your FastAPI routes as they become available.
export async function askLore(question:string, storyId?:string) {
  const {data}=await api.post('/api/v1/query/ask',{
    query: question,
    story_id: storyId || 'The Ember Archives',
    top_k: 4
  }); return data
}
export async function uploadChapter(data: {
  story_id: string
  chapter_index: number
  chapter_title: string
  raw_text: string
}) {
  const res = await api.post('/api/v1/indexing/chapter', data)
  return res.data
}

export async function checkContinuity(data: {
  story_id: string
  chapter_index: number
  manuscript_text: string
  mentioned_characters?: string[]
}) {
  const res = await api.post('/api/v1/continuity/check', {
    story_id: data.story_id,
    chapter_index: data.chapter_index,
    manuscript_text: data.manuscript_text,
    mentioned_characters: data.mentioned_characters || []
  })
  return res.data
}

export async function getCanonFacts(storyId: string) {
  const res = await api.get('/api/v1/canon/facts', {
    params: { story_id: storyId, only_approved: true }
  })
  return res.data
}

export async function getHealth() {
  try { await api.get('/health'); return true } catch { return false }
}
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
export async function getHealth() {
  try { await api.get('/health'); return true } catch { return false }
}
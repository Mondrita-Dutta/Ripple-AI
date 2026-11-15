import { useEffect, useState, useRef } from 'react'
import { BookOpen, Boxes, BrainCircuit, ChevronDown, CircleHelp, Command, FileText, GitBranch, LayoutDashboard, Menu, MessageSquare, Plus, Search, Settings, ShieldCheck, Sparkles, Upload, X, Send, ArrowUpRight, Activity, Clock3, PanelLeftClose, PanelLeftOpen, MoreHorizontal, CheckCircle2, AlertTriangle, Network, LoaderCircle } from 'lucide-react'
import { askLore, getHealth, uploadChapter, checkContinuity } from './api'

type Page='Overview'|'Stories'|'Lore Chat'|'CanonGraph'|'Continuity Auditor'
const nav:{label:Page;icon:any}[]=[{label:'Overview',icon:LayoutDashboard},{label:'Stories',icon:BookOpen},{label:'Lore Chat',icon:MessageSquare},{label:'CanonGraph',icon:GitBranch},{label:'Continuity Auditor',icon:ShieldCheck}]
const starterMessages=[{role:'assistant',text:'Hey! I’m your lore-aware writing companion. Ask me anything about your story, characters, timelines, or canon.'}]
function App(){
 const [page,setPage]=useState<Page>('Overview'),[collapsed,setCollapsed]=useState(false),[mobile,setMobile]=useState(false),[story,setStory]=useState('The Ember Archives'),[query,setQuery]=useState(''),[messages,setMessages]=useState(starterMessages),[loading,setLoading]=useState(false),[apiStatus,setApiStatus]=useState<'checking'|'online'|'offline'>('checking')
 const fileInputRef = useRef<HTMLInputElement>(null)
 const [uploading, setUploading] = useState(false)
 const [uploadMsg, setUploadMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
 const [chapters, setChapters] = useState([
   { num: 12, title: 'The Ashen Gate', update: 'Updated 24 minutes ago · 2,840 words', badge: 'In progress', done: false },
   { num: 11, title: 'Echoes Beneath', update: 'Updated yesterday · 3,120 words', badge: 'Complete', done: true }
 ])

 // Continuity Auditor state
 const [auditing, setAuditing] = useState(false)
 const [auditScore, setAuditScore] = useState(96)
 const [lastAudit, setLastAudit] = useState('2 hours ago')
 const [auditIssues, setAuditIssues] = useState([
   { id: '1', title: 'Character timeline mismatch', chapter: 'Chapter 8 · The Hollow Crown', detail: 'Mira is described as being in the Northern Reach, but the previous chapter places her in the capital.', severity: 'warning' },
   { id: '2', title: 'Unresolved character reference', chapter: 'Chapter 11 · Echoes Beneath', detail: 'A character called “the masked traveler” appears without a matching entry in your canon graph.', severity: 'warning' }
 ])

 // Stories management
 const [stories, setStories] = useState([
   { name: 'The Ember Archives', desc: 'A forgotten empire. A dangerous truth.', chapters: 12, dot: 'purple' },
   { name: 'Glass Kingdom', desc: 'Magic fractures the world it was meant to protect.', chapters: 4, dot: 'blue' },
   { name: 'Untitled story', desc: 'A fresh universe waiting to be penned.', chapters: 1, dot: 'amber' }
 ])
 const [showStoryModal, setShowStoryModal] = useState(false)
 const [newTitle, setNewTitle] = useState('')
 const [newDesc, setNewDesc] = useState('')

 const handleRunAudit = async () => {
   setAuditing(true)
   try {
     const res = await checkContinuity({
       story_id: story,
       chapter_index: chapters.length,
       manuscript_text: "Mira stood by the outer threshold of the Ember Gate. Kael checked the seals, confirming that the ancient Chrono-Spire remained safe.",
       mentioned_characters: ["Mira", "Kael"]
     })
     setLastAudit('Just now')
     if (res.has_contradictions && res.violations?.length > 0) {
       setAuditScore(Math.max(65, 100 - res.violations.length * 15))
       setAuditIssues(res.violations.map((v: any, idx: number) => ({
         id: String(idx + 1),
         title: v.violation_type || 'Plot Contradiction',
         chapter: `Chapter ${chapters.length}`,
         detail: v.description || 'Timeline contradiction detected in latest chapter.',
         severity: v.severity === 'critical' ? 'critical' : 'warning'
       })))
     } else {
       setAuditScore(100)
       setAuditIssues([])
     }
   } catch (err) {
     console.error(err)
   } finally {
     setAuditing(false)
   }
 }

 const handleCreateStory = (e: React.FormEvent) => {
   e.preventDefault()
   if (!newTitle.trim()) return
   const colorDots = ['purple', 'blue', 'amber', 'green']
   const newStory = {
     name: newTitle.trim(),
     desc: newDesc.trim() || 'A new story universe in development.',
     chapters: 1,
     dot: colorDots[stories.length % colorDots.length]
   }
   setStories(prev => [...prev, newStory])
   setStory(newStory.name)
   setNewTitle('')
   setNewDesc('')
   setShowStoryModal(false)
 }

 const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
   const file = e.target.files?.[0]
   if (!file) return
   setUploading(true)
   setUploadMsg(null)
   try {
     const text = await file.text()
     if (!text.trim() || text.length < 10) {
       setUploadMsg({ type: 'error', text: 'File must contain at least 10 characters of manuscript text.' })
       return
     }
     const title = file.name.replace(/\.[^/.]+$/, '')
     const nextIndex = chapters.length + 1
     const res = await uploadChapter({
       story_id: story,
       chapter_index: nextIndex,
       chapter_title: title,
       raw_text: text
     })
     setChapters(prev => [
       { num: nextIndex, title, update: `Just imported · ${text.split(/\s+/).length} words`, badge: 'Indexed', done: true },
       ...prev
     ])
     setStories(prev => prev.map(s => s.name === story ? { ...s, chapters: s.chapters + 1 } : s))
     setUploadMsg({
       type: 'success',
       text: `"${title}" indexed successfully! (${res.chunks_indexed} scenes saved to database)`
     })
   } catch (err: any) {
     const errMsg = err?.response?.data?.detail ? JSON.stringify(err.response.data.detail) : err.message || 'Indexing failed'
     setUploadMsg({ type: 'error', text: `Upload failed: ${errMsg}` })
   } finally {
     setUploading(false)
     if (e.target) e.target.value = ''
   }
 }
 useEffect(()=>{void getHealth().then(ok=>setApiStatus(ok?'online':'offline'))},[])
 const send=async()=>{if(!query.trim()||loading)return;const q=query.trim();setMessages(m=>[...m,{role:'user',text:q}]);setQuery('');setLoading(true);try{const d=await askLore(q,story);setMessages(m=>[...m,{role:'assistant',text:d.answer||d.response||JSON.stringify(d)}])}catch(err:any){const msg=err?.response?.data?.detail?JSON.stringify(err.response.data.detail):'I couldn’t reach the backend at localhost:8000. Please ensure the backend server is running.';setMessages(m=>[...m,{role:'assistant',text:msg}])}finally{setLoading(false)}}
 const title=page==='Overview'?'Your story universe':page==='Stories'?'Story library':page==='Lore Chat'?'Lore Chat':page==='CanonGraph'?'CanonGraph explorer':'Continuity audit'
 return <div className="app-shell">
  {mobile&&<div className="mobile-scrim" onClick={()=>setMobile(false)}/>}
  <aside className={`sidebar ${collapsed?'collapsed':''} ${mobile?'mobile-open':''}`}>
   <div className="brand"><div className="brand-mark"><Sparkles size={19}/></div>{!collapsed&&<div><b>Ripple</b><small>STORY INTELLIGENCE</small></div>}<button className="icon-btn collapse-btn" onClick={()=>setCollapsed(!collapsed)}>{collapsed?<PanelLeftOpen size={16}/>:<PanelLeftClose size={16}/>}</button></div>
   {!collapsed&&<div className="workspace-label">WORKSPACE <button className="tiny-btn"><MoreHorizontal size={15}/></button></div>}
   <div className="nav-list">{nav.map(({label,icon:Icon})=><button key={label} className={`nav-item ${page===label?'active':''}`} onClick={()=>{setPage(label);setMobile(false)}} title={collapsed?label:''}><Icon size={18}/>{!collapsed&&<span>{label}</span>}{!collapsed&&label==='Continuity Auditor'&&<span className="nav-count">2</span>}</button>)}</div>
   {!collapsed&&<><div className="sidebar-section"><span>YOUR STORIES</span><button className="tiny-btn" onClick={()=>setShowStoryModal(true)} title="Add universe"><Plus size={15}/></button></div>{stories.map(s=><button key={s.name} className={`story-link ${story===s.name?'selected':''}`} onClick={()=>setStory(s.name)}><span className={`story-dot ${s.dot}`}/>{s.name}</button>)}<div className="sidebar-bottom"><div className="upgrade-card"><Sparkles size={16}/><b>Unlock your universe</b><p>Build deeper worlds with RIPPLE 
    Pro.</p><button>Explore plans <ArrowUpRight size={13}/></button></div><button className="nav-item"><Settings size={17}/><span>Settings</span></button><button className="profile"><div className="avatar">MK</div><div><b>Mehuli Khanra</b><small>Free workspace</small></div><MoreHorizontal size={16}/></button></div></>}
  </aside>
  <main className="main-area">
   <header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setMobile(true)}><Menu size={19}/></button><div className="crumb">Workspace <span>/</span> <b>{page}</b></div><div className="top-actions"><button className="search-pill"><Search size={15}/> Search anything <kbd>⌘ K</kbd></button><button className="icon-btn help"><CircleHelp size={18}/></button><div className="avatar small">MK</div></div></header>
   <div className="content">
    <div className="welcome-row"><div><div className="eyebrow"><span className="pulse"/> STORY WORKSPACE</div><h1>{title}<span className="period">.</span></h1><p className="subhead">Keep every detail, character, and chapter connected.</p></div><button className="primary-btn" onClick={()=>setShowStoryModal(true)}><Plus size={16}/> New story</button></div>
    <div className="story-select"><div className="book-icon"><BookOpen size={18}/></div><div><small>ACTIVE STORY</small><b>{story}</b></div><ChevronDown size={16}/><div className="select-divider"/><span className="status-dot"/> <span className="status-text">Synced</span></div>
    {page==='Overview'&&<><div className="stats-grid"><Stat icon={BookOpen} label="Chapters" value={String(stories.find(s=>s.name===story)?.chapters || 12)} meta="+1 recently" color="purple"/><Stat icon={Boxes} label="Canon facts" value="248" meta="Across 12 chapters" color="blue"/><Stat icon={Network} label="Connections" value="86" meta="18 characters" color="green"/><Stat icon={ShieldCheck} label="Consistency" value="96.4%" meta="↑ 2.8% this month" color="amber"/></div>
    <div className="section-head"><div><h2>Workspace overview</h2><p>A snapshot of your story universe.</p></div><button className="ghost-btn">Last 30 days <ChevronDown size={14}/></button></div>
    <div className="dashboard-grid"><section className="panel activity-panel"><div className="panel-head"><div><h3>Recent activity</h3><p>Your universe, in motion.</p></div><button className="icon-btn"><MoreHorizontal size={17}/></button></div><div className="activity-list"><ActivityRow icon={FileText} color="purple" title="Chapter 12 added" detail="The Ashen Gate · 24 minutes ago" tag="Chapter"/><ActivityRow icon={GitBranch} color="blue" title="Canon graph updated" detail="6 new relationships extracted · 2 hours ago" tag="Graph"/><ActivityRow icon={ShieldCheck} color="green" title="Continuity audit completed" detail="3 potential issues found · Yesterday" tag="Audit"/><ActivityRow icon={Sparkles} color="amber" title="Lore index refreshed" detail="248 facts indexed · Yesterday" tag="RAG"/></div><button className="panel-footer" onClick={()=>setPage('Stories')}>View all activity <ArrowUpRight size={14}/></button></section>
    <section className="panel quick-panel"><div className="panel-head"><div><h3>Quick actions</h3><p>Jump back into your workflow.</p></div></div><QuickAction icon={MessageSquare} color="purple" title="Ask your lore" text="Chat with your story universe" onClick={()=>setPage('Lore Chat')}/><QuickAction icon={GitBranch} color="blue" title="Explore canon graph" text="See how everything connects" onClick={()=>setPage('CanonGraph')}/><QuickAction icon={ShieldCheck} color="green" title="Run continuity audit" text="Find contradictions & gaps" onClick={()=>setPage('Continuity Auditor')}/><QuickAction icon={Upload} color="amber" title="Import chapters" text="Add new material to your story" onClick={()=>{setPage('Stories'); setTimeout(()=>fileInputRef.current?.click(), 120)}}/></section></div>
    <section className="panel bottom-panel"><div className="panel-head"><div><h3>Continue writing</h3><p>Pick up where you left off.</p></div><button className="ghost-btn" onClick={()=>setPage('Stories')}>All chapters <ArrowUpRight size={14}/></button></div>{chapters.map(ch=><div className="chapter-row" key={ch.num}><div className="chapter-num">{ch.num}</div><div className="chapter-info"><b>{ch.title}</b><small>{ch.update}</small></div><span className={`chapter-badge ${ch.done?'done':''}`}>{ch.done&&<CheckCircle2 size={12}/>} {ch.badge}</span><button className="icon-btn" onClick={()=>{setStory('The Ember Archives');setPage('Lore Chat');setQuery(`Tell me about ${ch.title}`)}} title="Chat about this chapter"><ArrowUpRight size={16}/></button></div>)}</section></>}
    {page==='Stories'&&<section className="panel feature-panel"><div className="panel-head"><div><h3>Your stories</h3><p>Manage the worlds you're building.</p></div><button className="primary-btn" onClick={()=>setShowStoryModal(true)}><Plus size={15}/> Create story</button></div><div className="story-cards">{stories.map(s=><div key={s.name} onClick={()=>setStory(s.name)} style={{cursor:'pointer'}}><StoryCard name={s.name} desc={s.desc} chapters={`${s.chapters} chapters`} active={s.name===story}/></div>)}<button className="new-story-card" onClick={()=>setShowStoryModal(true)}><Plus size={22}/><b>Create a new story</b><small>Start a fresh universe</small></button></div><div className="upload-zone" onClick={()=>!uploading&&fileInputRef.current?.click()} style={{cursor:'pointer'}}><input type="file" ref={fileInputRef} style={{display:'none'}} accept=".txt,.md,.text" onChange={handleFileUpload}/>{uploading?<div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}><LoaderCircle size={24} className="spin"/><b>Ingesting & chunking chapter...</b><small style={{color:'#85849a'}}>Generating embeddings and saving to database</small></div>:uploadMsg?<div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'8px'}}>{uploadMsg.type==='success'?<CheckCircle2 size={24} color="#5bc99e"/>:<AlertTriangle size={24} color="#e56c7d"/>}<b>{uploadMsg.text}</b><p style={{margin:0,fontSize:'11px',color:'#85849a'}}>Click to import another chapter (.txt or .md)</p></div>:<><Upload size={22}/><b>Import chapters or documents</b><p>Drop files here, or <u>browse files</u></p><small>TXT or MD supported · Click to select</small></>}</div></section>}
    {page==='Lore Chat'&&<section className="panel chat-panel"><div className="chat-head"><div className="ai-avatar"><BrainCircuit size={19}/></div><div><b>Ripple Assistant</b><small><span className="status-dot"/> Grounded in {story}</small></div><span className="model-pill">Gemini Flash <ChevronDown size={12}/></span></div><div className="messages">{messages.map((m:any,i)=><div className={`message ${m.role}`} key={i}>{m.role==='assistant'&&<div className="ai-avatar mini"><Sparkles size={13}/></div>}<div className="bubble">{m.text}</div></div>)}{loading&&<div className="message assistant"><div className="ai-avatar mini"><Sparkles size={13}/></div><div className="bubble"><LoaderCircle size={15} className="spin"/> Thinking through your canon…</div></div>}</div><div className="chat-suggestions">{['Who is the main antagonist?','Summarize chapter 12','What do we know about the Ember Gate?'].map(s=><button onClick={()=>setQuery(s)}>{s}</button>)}</div><div className="chat-input"><textarea value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Ask anything about your story…" rows={1}/><button className="send-btn" onClick={send} disabled={!query.trim()||loading}><Send size={16}/></button></div><div className="chat-note"><Sparkles size={12}/> Answers are grounded in your indexed story content.</div></section>}
    {page==='CanonGraph'&&<section className="panel graph-panel"><div className="panel-head"><div><h3>CanonGraph</h3><p>Explore facts, characters, and their relationships.</p></div><button className="ghost-btn"><Network size={14}/> 86 connections</button></div><div className="graph-canvas"><div className="graph-grid"/><svg viewBox="0 0 800 430" preserveAspectRatio="xMidYMid meet"><g stroke="#4b426c" strokeWidth="1.4" opacity=".8"><path d="M400 210L220 100M400 210L610 95M400 210L190 310M400 210L610 330M400 210L400 60M220 100L400 60M610 95L400 60M190 310L400 360M610 330L400 360M220 100L190 310M610 95L610 330"/></g><g><circle cx="400" cy="210" r="62" fill="#8b5cf6" opacity=".12"/><circle cx="400" cy="210" r="43" fill="#201735" stroke="#9b72ff" strokeWidth="2"/><text x="400" y="206" textAnchor="middle" fill="#eee5ff" fontSize="12" fontWeight="600">Ember</text><text x="400" y="222" textAnchor="middle" fill="#c4a8ff" fontSize="11">Gate</text><circle cx="220" cy="100" r="29" fill="#17233b" stroke="#4f8df7"/><text x="220" y="104" textAnchor="middle" fill="#c9ddff" fontSize="11">Mira</text><circle cx="610" cy="95" r="31" fill="#2b1c3c" stroke="#a56cf5"/><text x="610" y="99" textAnchor="middle" fill="#e5caff" fontSize="11">Kael</text><circle cx="190" cy="310" r="27" fill="#18332d" stroke="#4bbf9b"/><text x="190" y="314" textAnchor="middle" fill="#c1f7e4" fontSize="11">Ashes</text><circle cx="610" cy="330" r="32" fill="#34251b" stroke="#d99a54"/><text x="610" y="334" textAnchor="middle" fill="#ffe0bb" fontSize="11">The Order</text><circle cx="400" cy="60" r="26" fill="#172d37" stroke="#4bbfbd"/><text x="400" y="64" textAnchor="middle" fill="#c6f7f3" fontSize="11">Prophecy</text><circle cx="400" cy="360" r="29" fill="#2b2036" stroke="#bb8de7"/><text x="400" y="364" textAnchor="middle" fill="#ead4ff" fontSize="11">Old King</text></g></svg><div className="graph-label"><span className="status-dot"/> Interactive graph preview</div></div><div className="graph-legend"><span><i className="legend-purple"/> Characters</span><span><i className="legend-green"/> Locations</span><span><i className="legend-amber"/> Organizations</span><span><i className="legend-blue"/> Events & lore</span></div></section>}
    {page==='Continuity Auditor'&&<section className="panel audit-panel"><div className="panel-head"><div><h3>Continuity report</h3><p>Review potential inconsistencies across your story.</p></div><button className="primary-btn" onClick={handleRunAudit} disabled={auditing}>{auditing?<><LoaderCircle size={15} className="spin"/> Running audit...</>:<><ShieldCheck size={15}/> Run new audit</>}</button></div><div className="audit-score"><div className="score-ring"><b>{auditScore}<span>%</span></b><small>CONSISTENCY</small></div><div><div className="eyebrow green-text">{auditing?'AUDIT IN PROGRESS':auditScore===100?'AUDIT PERFECT':'AUDIT COMPLETE'}</div><h2>{auditScore===100?'No contradictions found. All clear!':'Your story is in great shape.'}</h2><p>{chapters.length} chapters analyzed · Last run {lastAudit}</p><div className="audit-stats"><span><i className="red-dot"/> {auditIssues.filter(i=>i.severity==='critical').length} Critical</span><span><i className="amber-dot"/> {auditIssues.filter(i=>i.severity==='warning').length} Warnings</span><span><i className="green-dot"/> {chapters.length} Passed</span></div></div></div><div className="issue-list"><div className="issue-title">{auditIssues.length>0?<>Needs review <span>{auditIssues.length} issues</span></>:'All timeline issues resolved ✓'}</div>{auditIssues.map(issue=><Issue key={issue.id} title={issue.title} chapter={issue.chapter} detail={issue.detail} onResolve={()=>setAuditIssues(prev=>prev.filter(i=>i.id!==issue.id))}/>)}</div></section>}
    <footer className="footer"><span>Ripple <span className="muted">·</span> Built for worlds worth remembering..</span><span className="backend-status"><span className={`status-dot ${apiStatus==='offline'?'offline':''}`}/>{apiStatus==='checking'?'Checking API…':apiStatus==='online'?'API connected':'API offline'} <span className="muted">·</span> v0.1.0</span></footer>
   </div>
  </main>
  {showStoryModal&&(
    <div style={{position:'fixed',inset:0,background:'#000000bb',zIndex:100,display:'grid',placeItems:'center',padding:'20px'}}>
      <div style={{background:'#13131e',border:'1px solid #332a48',borderRadius:'12px',width:'100%',maxWidth:'440px',padding:'24px',boxShadow:'0 20px 40px #00000088'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
          <h3 style={{margin:0,fontSize:'16px',color:'#eee'}}>Create New Story Universe</h3>
          <button className="icon-btn" onClick={()=>setShowStoryModal(false)}><X size={18}/></button>
        </div>
        <form onSubmit={handleCreateStory} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          <div>
            <label style={{fontSize:'11px',color:'#85849b',display:'block',marginBottom:'6px'}}>Story Title</label>
            <input value={newTitle} onChange={e=>setNewTitle(e.target.value)} placeholder="e.g. Chrono Horizon" required autoFocus style={{width:'100%',background:'#1c1c2b',border:'1px solid #323249',color:'#eee',borderRadius:'7px',padding:'9px 12px',fontSize:'13px',boxSizing:'border-box'}}/>
          </div>
          <div>
            <label style={{fontSize:'11px',color:'#85849b',display:'block',marginBottom:'6px'}}>Premise / Description</label>
            <textarea value={newDesc} onChange={e=>setNewDesc(e.target.value)} placeholder="Brief summary of this world..." rows={3} style={{width:'100%',background:'#1c1c2b',border:'1px solid #323249',color:'#eee',borderRadius:'7px',padding:'9px 12px',fontSize:'13px',boxSizing:'border-box',resize:'none'}}/>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'8px'}}>
            <button type="button" className="ghost-btn" onClick={()=>setShowStoryModal(false)}>Cancel</button>
            <button type="submit" className="primary-btn" disabled={!newTitle.trim()}><Plus size={15}/> Create Universe</button>
          </div>
        </form>
      </div>
    </div>
  )}
 </div>
}
function Stat({icon:Icon,label,value,meta,color}:any){return <div className="stat-card"><div className={`stat-icon ${color}`}><Icon size={18}/></div><span className="stat-label">{label}</span><strong>{value}</strong><small>{meta}</small></div>}
function ActivityRow({icon:Icon,color,title,detail,tag}:any){return <div className="activity-row"><div className={`activity-icon ${color}`}><Icon size={16}/></div><div className="activity-copy"><b>{title}</b><small>{detail}</small></div><span className="activity-tag">{tag}</span></div>}
function QuickAction({icon:Icon,color,title,text,onClick}:any){return <button className="quick-action" onClick={onClick}><div className={`quick-icon ${color}`}><Icon size={17}/></div><div><b>{title}</b><small>{text}</small></div><ArrowUpRight size={15} className="quick-arrow"/></button>}
function StoryCard({name,desc,chapters,active}:any){return <div className="story-card"><div className="story-cover"><BookOpen size={28}/><span>R</span></div><div className="story-card-content"><div className="story-card-title"><b>{name}</b>{active&&<span>Active</span>}</div><p>{desc}</p><small>{chapters} · Updated recently</small></div><button className="icon-btn"><MoreHorizontal size={16}/></button></div>}
function Issue({title,chapter,detail,onResolve}:any){return <div className="issue"><div className="issue-icon"><AlertTriangle size={17}/></div><div className="issue-copy"><b>{title}</b><small>{chapter}</small><p>{detail}</p></div><button className="ghost-btn" onClick={onResolve}>Dismiss <CheckCircle2 size={13}/></button></div>}
export default App
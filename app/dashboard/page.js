'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ptmulkpvzbtyciartllf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB0bXVsa3B2emJ0eWNpYXJ0bGxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNTQ4NzAsImV4cCI6MjA5MzkzMDg3MH0.HQ9bi4GXGr3zua-eZLQy4CMCzJ5ABxU3o07yAdYpZ70'
)

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [leads, setLeads] = useState([])

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login'
      else setUser(data.user)
    })
    supabase.from('leads').select('*').then(({ data }) => {
      setLeads(data || [])
    })
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (!user) return <div style={{color:'white',padding:'40px'}}>Loading...</div>

  return (
    <div style={{minHeight:'100vh',background:'#030712',color:'white',fontFamily:'sans-serif'}}>
      <div style={{background:'#111827',padding:'16px 32px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <h1 style={{margin:0,color:'#F59E0B'}}>🚀 LeadFlow CRM</h1>
        <div>
          <span style={{color:'#9CA3AF',marginRight:'16px'}}>{user.email}</span>
          <button onClick={signOut} style={{background:'#374151',color:'white',border:'none',padding:'8px 16px',borderRadius:'8px',cursor:'pointer'}}>Sign Out</button>
        </div>
      </div>
      <div style={{padding:'32px'}}>
        <h2>Dashboard</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',marginBottom:'32px'}}>
          <div style={{background:'#111827',padding:'24px',borderRadius:'12px',border:'1px solid #1F2937'}}>
            <p style={{color:'#9CA3AF',margin:'0 0 8px'}}>Total Leads</p>
            <p style={{fontSize:'36px',fontWeight:'700',margin:0,color:'#F59E0B'}}>{leads.length}</p>
          </div>
          <div style={{background:'#111827',padding:'24px',borderRadius:'12px',border:'1px solid #1F2937'}}>
            <p style={{color:'#9CA3AF',margin:'0 0 8px'}}>Hot Leads</p>
            <p style={{fontSize:'36px',fontWeight:'700',margin:0,color:'#10B981'}}>{leads.filter(l=>l.score>=70).length}</p>
          </div>
          <div style={{background:'#111827',padding:'24px',borderRadius:'12px',border:'1px solid #1F2937'}}>
            <p style={{color:'#9CA3AF',margin:'0 0 8px'}}>Closed</p>
            <p style={{fontSize:'36px',fontWeight:'700',margin:0,color:'#3B82F6'}}>{leads.filter(l=>l.status==='Closed').length}</p>
          </div>
        </div>
        <a href="/leads" style={{background:'#F59E0B',color:'black',padding:'12px 24px',borderRadius:'8px',textDecoration:'none',fontWeight:'700'}}>Manage Leads →</a>
      </div>
    </div>
  )
}
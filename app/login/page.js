'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')

  const signIn = async () => {
    setMsg('Signing in...')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMsg(error.message)
    else window.location.href = '/dashboard'
  }

  const signUp = async () => {
    setMsg('Creating account...')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMsg(error.message)
    else { setMsg('Account created! Signing in...'); setTimeout(() => signIn(), 1000) }
  }

  return (
    <div style={{minHeight:'100vh',background:'#030712',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{background:'#111827',padding:'40px',borderRadius:'16px',width:'360px'}}>
        <h1 style={{color:'white',textAlign:'center',marginBottom:'24px',fontSize:'24px'}}>LeadFlow CRM</h1>
        <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)}
          style={{width:'100%',padding:'10px',marginBottom:'12px',borderRadius:'8px',border:'1px solid #374151',background:'#1F2937',color:'white',boxSizing:'border-box'}}/>
        <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e=>setPassword(e.target.value)}
          style={{width:'100%',padding:'10px',marginBottom:'16px',borderRadius:'8px',border:'1px solid #374151',background:'#1F2937',color:'white',boxSizing:'border-box'}}/>
        <button onClick={signIn} style={{width:'100%',padding:'12px',background:'#F59E0B',color:'black',fontWeight:'bold',borderRadius:'8px',border:'none',cursor:'pointer',marginBottom:'8px'}}>Sign In</button>
        <button onClick={signUp} style={{width:'100%',padding:'12px',background:'#1F2937',color:'white',borderRadius:'8px',border:'1px solid #374151',cursor:'pointer'}}>Sign Up</button>
        {msg && <p style={{color:'#F59E0B',textAlign:'center',marginTop:'12px'}}>{msg}</p>}
      </div>
    </div>
  )
}
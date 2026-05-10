'use client'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [supabase, setSupabase] = useState(null)

  useEffect(() => {
    const { createClient } = require('@supabase/supabase-js')
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    setSupabase(client)
  }, [])

  const signIn = async () => {
    if (!supabase) return setMsg('Loading...')
    setMsg('Signing in...')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg('Success! Redirecting...')
      window.location.replace('/dashboard')
    }
  }

  const signUp = async () => {
    if (!supabase) return setMsg('Loading...')
    setMsg('Creating account...')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMsg('Error: ' + error.message)
    } else {
      setMsg('Account created! Signing in...')
      setTimeout(() => signIn(), 1500)
    }
  }

  return (
    <div style={{minHeight:'100vh',background:'#030712',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}>
      <div style={{background:'#111827',padding:'40px',borderRadius:'16px',width:'380px',boxShadow:'0 25px 50px rgba(0,0,0,0.5)'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{width:'56px',height:'56px',background:'#F59E0B',borderRadius:'12px',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:'12px'}}>
            <span style={{fontSize:'28px',fontWeight:'900',color:'black'}}>L</span>
          </div>
          <h1 style={{color:'white',fontSize:'24px',fontWeight:'700',margin:'0'}}>LeadFlow CRM</h1>
          <p style={{color:'#6B7280',fontSize:'14px',marginTop:'4px'}}>Manage your leads</p>
        </div>
        <div style={{marginBottom:'16px'}}>
          <input type="email" placeholder="your@email.com" value={email}
            onChange={e=>setEmail(e.target.value)}
            style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #374151',background:'#1F2937',color:'white',fontSize:'14px',boxSizing:'border-box'}}/>
        </div>
        <div style={{marginBottom:'20px'}}>
          <input type="password" placeholder="Password (min 6 chars)" value={password}
            onChange={e=>setPassword(e.target.value)}
            style={{width:'100%',padding:'12px',borderRadius:'8px',border:'1px solid #374151',background:'#1F2937',color:'white',fontSize:'14px',boxSizing:'border-box'}}/>
        </div>
        <button onClick={signIn}
          style={{width:'100%',padding:'13px',background:'#F59E0B',color:'black',fontWeight:'700',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'15px',marginBottom:'10px'}}>
          Sign In
        </button>
        <button onClick={signUp}
          style={{width:'100%',padding:'13px',background:'transparent',color:'#9CA3AF',borderRadius:'8px',border:'1px solid #374151',cursor:'pointer',fontSize:'14px'}}>
          Create Account
        </button>
        {msg && (
          <div style={{marginTop:'16px',padding:'12px',background:'#1F2937',borderRadius:'8px',color:'#F59E0B',fontSize:'13px',textAlign:'center'}}>
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState('login')
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setError('Account created! Please sign in.')
        setMode('login')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#030712',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{width:'100%',maxWidth:'400px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{width:'56px',height:'56px',background:'#F59E0B',borderRadius:'12px',display:'inline-flex',alignItems:'center',justifyContent:'center',marginBottom:'16px'}}>
            <span style={{fontSize:'24px',fontWeight:'900',color:'#030712'}}>L</span>
          </div>
          <h1 style={{color:'white',fontSize:'28px',fontWeight:'700'}}>LeadFlow CRM</h1>
        </div>
        <div style={{background:'#111827',border:'1px solid #1F2937',borderRadius:'16px',padding:'32px'}}>
          {error && <div style={{background:'#1F0A0A',border:'1px solid #7F1D1D',color:'#FCA5A5',padding:'12px',borderRadius:'8px',marginBottom:'20px',fontSize:'14px'}}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{marginBottom:'16px'}}>
              <label style={{color:'#9CA3AF',fontSize:'14px',display:'block',marginBottom:'6px'}}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="you@example.com"
                style={{width:'100%',background:'#1F2937',border:'1px solid #374151',borderRadius:'8px',padding:'10px 14px',color:'white',fontSize:'14px',boxSizing:'border-box'}}/>
            </div>
            <div style={{marginBottom:'20px'}}>
              <label style={{color:'#9CA3AF',fontSize:'14px',display:'block',marginBottom:'6px'}}>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required placeholder="Min 6 characters"
                style={{width:'100%',background:'#1F2937',border:'1px solid #374151',borderRadius:'8px',padding:'10px 14px',color:'white',fontSize:'14px',boxSizing:'border-box'}}/>
            </div>
            <button type="submit" disabled={loading}
              style={{width:'100%',background:'#F59E0B',color:'#030712',fontWeight:'700',padding:'12px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'14px'}}>
              {loading ? 'Please wait...' : mode==='login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <p style={{textAlign:'center',color:'#6B7280',fontSize:'14px',marginTop:'20px'}}>
            {mode==='login' ? "No account? " : "Have account? "}
            <button onClick={()=>setMode(mode==='login'?'signup':'login')}
              style={{background:'none',border:'none',color:'#F59E0B',cursor:'pointer',fontSize:'14px'}}>
              {mode==='login' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

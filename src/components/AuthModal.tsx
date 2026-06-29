import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { toastSupabaseError } from '@/utils/supabase-errors'
import { Loader2 } from 'lucide-react'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export const AuthModal: React.FC<AuthModalProps> = ({ open, onOpenChange, onSuccess }) => {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleAuth = async (type: 'signup' | 'login') => {
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const { error } = type === 'signup' 
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        toastSupabaseError(error, `Could not ${type === 'signup' ? 'sign up' : 'log in'}. Please try again.`)
        return
      }

      toast.success(type === 'signup' ? 'Account created successfully!' : 'Welcome back!')
      onSuccess()
      onOpenChange(false)
    } catch (err) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-charcoal">Save Your Data</DialogTitle>
          <DialogDescription className="text-slate-gray font-medium">
            Create an account to keep your records safe across all your devices.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="login" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100 p-1 rounded-2xl">
            <TabsTrigger value="login" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-emerald data-[state=active]:shadow-sm">Log In</TabsTrigger>
            <TabsTrigger value="signup" className="rounded-xl font-bold data-[state=active]:bg-white data-[state=active]:text-emerald data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
          </TabsList>
          
          <div className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-gray">Email Address</Label>
              <Input 
                type="email" 
                placeholder="you@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-50 border-none rounded-2xl h-12 focus:ring-2 focus:ring-emerald/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-gray">Password</Label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-50 border-none rounded-2xl h-12 focus:ring-2 focus:ring-emerald/20"
              />
            </div>
          </div>

          <TabsContent value="login" className="mt-6">
            <Button 
              className="w-full h-14 rounded-2xl bg-emerald hover:bg-emerald/90 text-white font-black uppercase tracking-widest shadow-lg shadow-emerald/10 active:scale-[0.98] transition-all"
              onClick={() => handleAuth('login')}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log In'}
            </Button>
          </TabsContent>
          
          <TabsContent value="signup" className="mt-6">
            <Button 
              className="w-full h-14 rounded-2xl bg-emerald hover:bg-emerald/90 text-white font-black uppercase tracking-widest shadow-lg shadow-emerald/10 active:scale-[0.98] transition-all"
              onClick={() => handleAuth('signup')}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

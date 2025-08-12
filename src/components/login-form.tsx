'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const [pwError, setPwError] = useState<string | null>(null)
  const [pwLoading, setPwLoading] = useState(false)

  const [oaError, setOaError] = useState<string | null>(null)
  const [oaLoading, setOaLoading] = useState(false)

  const router = useRouter()

  const handleSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setOaLoading(true)
    setOaError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'openid profile email offline_access User.Read Calendars.ReadWrite',
          redirectTo: `${window.location.origin}/auth/oauth?next=/protected`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      setOaError(error instanceof Error ? error.message : 'An error occurred')
      setOaLoading(false)
    }
  }

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setPwLoading(true)
    setPwError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      router.push('/protected')
    } catch (error: unknown) {
      setPwError(error instanceof Error ? error.message : 'An error occurred')
      setPwLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="w-full flex flex-col text-2xl">Headlight Employee Portal</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-10">
            <form onSubmit={handlePasswordLogin}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/auth/forgot-password"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {pwError && <p className="text-sm text-red-500">{pwError}</p>}
                <Button type="submit" className="w-full" disabled={pwLoading}>
                  {pwLoading? 'Logging in...' : 'Login with Email'}
                </Button>
              </div>
            </form>
            <form onSubmit={handleSocialLogin}>
              <div className="flex flex-col gap-6">
                {oaError && <p className="text-sm text-destructive-500">{oaError}</p>}
                <Button type="submit" className="w-full bg-yellow-400 text-black" disabled={oaLoading}>
                  {oaLoading ? 'Logging in...' : 'Continue with Microsoft'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{' '}
                <Link href="/auth/sign-up" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

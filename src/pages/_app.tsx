import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { getAuth } from '@firebase/auth'
import { FirebaseAuthProvider } from '@/lib/firebase/utils/auth'
import { signIn } from '@/lib/firebase/hooks'

export default function App({ Component, pageProps }: AppProps) {
  const auth = getAuth()
  // @see: useEffect()の仕様上、一度描画されてしまう
  // @link: https://zenn.dev/uttk/articles/4649e49f1e6628

  useEffect(() => {
    signIn()
  }, [auth])

  return <FirebaseAuthProvider><Component {...pageProps} /></FirebaseAuthProvider>
}

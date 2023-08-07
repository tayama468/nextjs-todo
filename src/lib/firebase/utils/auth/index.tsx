import { getAuth, getRedirectResult } from '@firebase/auth'
import { createContext, useEffect, useState, useContext } from 'react'
import { AuthContextState, User, ReactNodeProps } from '@/features/common/types'
import { getFirebaseApp } from '@/lib/firebase/utils/init'

const FirebaseAuthContext = createContext<AuthContextState>({
  currentUser: undefined,
})

// 認証プロバイダ
const FirebaseAuthProvider = ({ children }: ReactNodeProps) => {
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(undefined)

  const firebaseApp = getFirebaseApp()
  const auth = getAuth(firebaseApp)

  // authはnullの可能性があるので、useEffectの第二引数にauthを指定しておく
  useEffect(() => {
    /**
     * authオブジェクトのログイン情報の初期化はonAuthStateChanged 発火時に行われる
     * onAuthStateChangedが発火する前(authオブジェクトの初期化が完了する前)にcurrentUserを参照してしまうと、ログインしていてもnullになってしまう
     * @see {@link https://firebase.google.com/docs/auth/web/manage-users}<br>
     * そのため、userデータの参照はonAuthStateChanged内で行う
     */
    const unsubscribed = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user)
      }
      getRedirectResult(getAuth(firebaseApp))
    })
    return () => {
      // onAuthStateChangedはfirebase.Unsubscribeを返すので、ComponentがUnmountされるタイミングでUnsubscribe(登録解除)しておく
      unsubscribed()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth])

  return (
    <FirebaseAuthContext.Provider value={{ currentUser: currentUser }}>
      {children}
    </FirebaseAuthContext.Provider>
  )
}

export { FirebaseAuthContext, FirebaseAuthProvider }

// @see: React Hook "useContext" is called in function "userFirebaseAuthContext" that is neither a React function component nor a custom React Hook function. React component names must start with an uppercase letter. React Hook names must start with the word "use".
// @link: https://stackoverflow.com/questions/60041349/react-hook-usecontext-is-called-in-function-age-which-is-neither-a-react-fun
export const UserFirebaseAuthContext = () => useContext(FirebaseAuthContext)
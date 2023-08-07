import Button from '@mui/material/Button';
import { UserFirebaseAuthContext } from '@/lib/firebase/utils/auth'
import { logOut } from '@/lib/firebase/hooks'

export default function Home() {
  const auth = UserFirebaseAuthContext()
  return (
    <main>
      { auth.currentUser && <Button
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          onClick={logOut}
        >
          Sign Out
        </Button>
      }
    </main>
  )
}

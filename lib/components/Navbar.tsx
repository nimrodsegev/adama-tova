'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { APP_NAME, COURSE_GITHUB, DEMOS_ENABLED } from "../config";
import { useUser } from "@/app/contexts/UserContext";

export default function Navbar() {
  const { user, loading, signOut } = useUser();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.replace('/login');  
    router.refresh();         
  };

  return (
    <header id="navbar">
      <h1>
        <Link href="/">{APP_NAME}</Link>
      </h1>
      <nav>
        <Link href="/">Home</Link>
        <Link href={COURSE_GITHUB} target="_blank">
          GitHub
        </Link>
        {DEMOS_ENABLED ? <Link href="/demos">Demos</Link> : null}
        
        {loading ? (
          <span>...</span>
        ) : user ? (
          <>
            <Link href="/profile">Profile</Link>
            <button 
              onClick={handleLogout}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'inherit', 
                cursor: 'pointer',
                fontSize: 'inherit',
                textDecoration: 'underline'
              }}
            >
              Log Out
            </button>
          </>
        ) : (
          <Link href="/login">Log In</Link>
        )}
      </nav>
    </header>
  );
}
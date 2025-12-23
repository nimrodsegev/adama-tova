"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface GoogleLoginButtonProps {
  className?: string;
}

const GoogleLoginButton = ({ className }: GoogleLoginButtonProps) => {
  const supabase = createClient();
  const router = useRouter();

  const handleGoogleClick = async () => {
    // Get the current path to use as redirect_to parameter
    const currentPath = window.location.pathname;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        // Optional: You can add query parameters if needed
      },
    });

    if (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      className={className}
    >
      <span>התחבר עם גוגל</span>
      <Image
        src="/icons/google.png"
        alt="Google"
        width={20}
        height={20}
      />
    </button>
  );
};

export default GoogleLoginButton;
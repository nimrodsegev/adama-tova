"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";

interface GoogleLoginButtonProps {
  className?: string;
}

const GoogleLoginButton = ({ className }: GoogleLoginButtonProps) => {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      console.error("Google login error:", error);
      setLoading(false);
    }
    // Note: Don't setLoading(false) on success - we're redirecting away
  };

  return (
    <button
      type="button"
      onClick={handleGoogleClick}
      className={className}
      disabled={loading}
    >
      <span>{loading ? "מתחבר..." : "התחבר עם גוגל"}</span>
      {!loading && (
        <Image
          src="/icons/google.png"
          alt="Google"
          width={20}
          height={20}
        />
      )}
    </button>
  );
};

export default GoogleLoginButton;
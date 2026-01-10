"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@lib/supabase/browser";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";
import { useToast } from "@hooks/use-toast";
import { Github } from "lucide-react";

type LoginClientProps = {
  nextPath: string;
};

export default function LoginClient({ nextPath }: LoginClientProps) {
  const router = useRouter();
  const { toast } = useToast();

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState<
    "google" | "github" | "email" | null
  >(null);

  const redirectTo =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
      : undefined;

  async function signInWithOAuth(provider: "google" | "github") {
    try {
      setIsLoading(provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
        },
      });
      if (error) throw error;
    } catch (err) {
      toast({
        title: "Login failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
      setIsLoading(null);
    }
  }

  async function signInWithEmail() {
    try {
      setIsLoading("email");
      const value = email.trim();
      if (!value) {
        toast({
          title: "Enter your email",
          description: "We’ll send you a magic link.",
          variant: "destructive",
        });
        setIsLoading(null);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: value,
        options: {
          emailRedirectTo: redirectTo,
        },
      });
      if (error) throw error;

      toast({
        title: "Check your email",
        description: "Magic link sent. Open it to sign in.",
      });
    } catch (err) {
      toast({
        title: "Could not send magic link",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-zinc-200 bg-white/80 backdrop-blur p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Admin Login</h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
          Sign in to manage your projects.
        </p>

        <div className="mt-6 space-y-3">
          <Button
            className="w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
            onClick={() => signInWithOAuth("google")}
            disabled={isLoading !== null}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
            >
              <path
                fill="currentColor"
                d="M21.35 11.1H12v2.9h5.35c-.25 1.5-1.6 4.4-5.35 4.4-3.2 0-5.8-2.65-5.8-5.9S8.8 6.6 12 6.6c1.85 0 3.1.8 3.8 1.5l2.6-2.5C16.75 4.1 14.6 3 12 3 6.95 3 2.8 7.15 2.8 12.5S6.95 22 12 22c5.85 0 9-4.1 9-9.85 0-.65-.08-1.15-.15-1.05z"
              />
            </svg>
            {isLoading === "google" ? "Signing in…" : "Continue with Google"}
          </Button>
          <Button
            className="w-full rounded-full bg-transparent border-zinc-300 text-zinc-900 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-700 dark:text-white dark:hover:bg-zinc-800 dark:hover:text-white"
            variant="outline"
            onClick={() => signInWithOAuth("github")}
            disabled={isLoading !== null}
          >
            <Github className="h-4 w-4" />
            {isLoading === "github" ? "Signing in…" : "Continue with GitHub"}
          </Button>
        </div>

        <div className="mt-6 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <Label htmlFor="email" className="text-zinc-900 dark:text-zinc-200">
            Email (magic link)
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="mt-2 bg-white border-zinc-200 text-zinc-900 placeholder:text-zinc-400 dark:bg-zinc-950/60 dark:border-zinc-800 dark:text-white dark:placeholder:text-zinc-500"
          />
          <Button
            className="mt-3 w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100"
            onClick={signInWithEmail}
            disabled={isLoading !== null}
          >
            {isLoading === "email" ? "Sending…" : "Send magic link"}
          </Button>
        </div>

        <div className="mt-4">
          <Button
            type="button"
            variant="ghost"
            className="w-full text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:text-white dark:hover:bg-zinc-800"
            onClick={() => router.push("/")}
          >
            Back to site
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default function SignupPage() {
  const router = useRouter();
  const { signup, loginWithGoogle, isLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!agreed) {
      setError("You must agree to the Terms of Service to continue.");
      return;
    }

    try {
      await signup(fullName, email, password);
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Unable to create account. Please try again.");
    }
  };

  const handleGoogleSignup = async () => {
    setError(null);
    try {
      await loginWithGoogle();
      router.push("/onboarding");
    } catch (err: any) {
      setError(err.message || "Google signup was cancelled or failed.");
    }
  };

  const handleGuestDemoSignup = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "segmentiq_user",
        JSON.stringify({
          id: "guest-demo-user",
          email: "alex.morgan@retailco.com",
          fullName: "Alex Morgan (Demo)",
          role: "owner",
          createdAt: new Date().toISOString(),
        })
      );
    }
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center text-primary-foreground font-black text-base shadow-sm">
              S
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground">
              SegmentIQ
            </span>
          </Link>
          <p className="text-xs text-muted-foreground">
            Create your account to unlock automated customer segmentation
          </p>
        </div>

        <Card className="border-border/80 shadow-xl bg-card/95 backdrop-blur-md">
          <CardHeader className="space-y-1 text-left pb-4">
            <CardTitle className="text-lg font-bold">Get Started Free</CardTitle>
            <CardDescription className="text-xs">
              Connect via Supabase database & auth
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Google Signup Button */}
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleSignup}
              isLoading={isLoading}
              className="w-full h-10 text-xs font-semibold border-border/80 hover:bg-secondary"
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Sign up with Google
            </Button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground font-semibold">
                  Or register with email
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-foreground">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  icon={<UserIcon className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-foreground">
                  Work Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@company.com"
                  icon={<Mail className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-foreground">
                  Password
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-foreground">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  icon={<Lock className="w-4 h-4" />}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1 text-left">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-3.5 h-3.5 accent-primary cursor-pointer"
                />
                <label htmlFor="terms" className="text-[11px] text-muted-foreground cursor-pointer">
                  I agree to the{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full h-10 text-sm font-semibold mt-2 shadow-sm"
                isLoading={isLoading}
              >
                Create Free Account <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </form>

            <div className="pt-2 border-t border-border/40">
              <Button
                type="button"
                variant="ghost"
                onClick={handleGuestDemoSignup}
                className="w-full h-9 text-xs text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
                Explore Instant Demo Access
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}

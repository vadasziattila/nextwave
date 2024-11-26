"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTPForm } from "./input-otp";
import { useEffect, useState } from "react";
import { getCsrfToken, login, verifyTwoFactor } from "@/hooks/auth";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null); // Store session ID for 2FA
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (retryAfter && retryAfter > 0) {
      timer = setInterval(() => {
        setRetryAfter((prev) => {
          if (prev && prev > 1) {
            return prev - 1; // Decrease countdown
          } else {
            clearInterval(timer!); // Clear timer when countdown reaches 0
            return null; // Set retryAfter to null to hide the countdown
          }
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [retryAfter]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await getCsrfToken();

      const response = await login(email, password);

      if (response.require_2fa && response.session_id) {
        setSessionId(response.session_id);
        setIsModalOpen(true);
      } else if (response.token) {
        console.log("Login successful:", response);
        const isSuccess = true;

        if (isSuccess) {
          // Retrieve the redirect URL from sessionStorage
          const redirectUrl = sessionStorage.getItem("redirectAfterLogin") || "/";
          sessionStorage.removeItem("redirectAfterLogin"); // Clean up
          router.replace(redirectUrl); // Redirect to the stored page
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);

      if (err.message?.includes("Too many login attempts")) {
        const retryTime = parseInt(err.message.match(/\d+/)?.[0] || "0", 10);
        setRetryAfter(retryTime);
      }

      setError(err.message || "Login failed.");
    }
  };

  const handleOtpSubmit = async (otp: string) => {
    try {
      if (!sessionId) throw new Error("Session ID not found.");

      const response = await verifyTwoFactor(sessionId, parseInt(otp, 10));
      console.log("2FA Verification successful:", response);
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("OTP verification error:", err);
      setError(err.message || "Invalid OTP.");
    }
  };

  return (
    <>
      {/* Login Card */}
      <Card className="mx-auto max-w-sm">
        <form onSubmit={handleLogin}>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
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
              {error && (
                <p className="text-red-500 text-sm">
                  
                  {retryAfter !== null && (
                    <span> Please try again in {retryAfter} seconds.</span>
                  )}
                </p>
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{" "}
              <Link href="#" className="underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>

      {/* OTP Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen} modal={true}>
        <DialogContent className="sm:max-w-[425px] items-center justify-center">
          <DialogHeader>
            <DialogTitle />
            <DialogDescription />
          </DialogHeader>
          <h2 className="text-xl font-semibold text-center mb-4">Enter OTP</h2>
          <InputOTPForm onSubmit={handleOtpSubmit} />
        </DialogContent>
      </Dialog>
    </>
  );
}

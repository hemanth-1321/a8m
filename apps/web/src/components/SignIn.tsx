"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/config";
import { useAuthStore } from "@/store/authStore";
const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { setToken } = useAuthStore.getState();

  const handleSignIn = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/signin`, {
        email,
        password,
      });
      setToken(res.data.token);
      router.push("/home/workflows");
    } catch (err) {
      console.error(err);
      toast.error("Sign in failed");
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e: any) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e: any) => setPassword(e.target.value)}
      />
      <Button onClick={handleSignIn}>Sign In</Button>
    </div>
  );
};

export default SignIn;

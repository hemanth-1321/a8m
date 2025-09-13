"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BACKEND_URL, TOKEN } from "@/lib/config";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const res = await axios.post(`${BACKEND_URL}/auth/signin`, {
        email,
        password,
      });
      const token = res.data.token;
      localStorage.setItem(TOKEN, token);
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

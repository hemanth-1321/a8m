"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BACKEND_URL } from "@/lib/config";

interface SignUpProps {
  onSuccess: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSignUp = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}/auth/signup`, {
        email,
        password,
      });

      if (response.data) {
        toast(response.data.message);
        onSuccess(); // Switch to Sign In tab
      }
    } catch (err) {
      console.error(err);
      toast.error("Signup failed");
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleSignUp}>Sign Up</Button>
    </div>
  );
};

export default SignUp;

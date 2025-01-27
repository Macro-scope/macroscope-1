"use client";

import { supabase } from "@/lib/supabaseClient";
import { Loader, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { useEffect } from "react";

export default function Home() {
  const router = useRouter();

  const getSesssion = async () => {
    const session = await supabase.auth.getSession();
    if (!session.data || session.error) {
      router.push("/login");
    } else {
      router.push("/dashboard");
    }
  };
  useEffect(() => {
    getSesssion();
  }, []);
  return (
    <div className="flex justify-center items-center h-screen">
      <Loader2 className="animate-spin" />
    </div>
  );
}

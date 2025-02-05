// pages/index.tsx (Next.js 13- z Page Router)
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Witaj na stronie głównej!</h1>
      <p className="text-gray-600">Zaloguj się, aby zobaczyć swój profil.</p>
    </div>
  );
}

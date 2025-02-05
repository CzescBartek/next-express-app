// app/page.tsx (Next.js 14+ z App Router)
"use client"; // Jeśli używasz hooków Reacta

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Sprawdź, czy użytkownik jest zalogowany (np. przez token w localStorage)
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login"); // Przekierowanie na stronę logowania, jeśli brak tokena
    }
  }, []);

  return (
    <main className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold">Witaj na stronie głównej!</h1>
      <p className="text-gray-600">Zaloguj się, aby uzyskać dostęp do swojego profilu.</p>
    </main>
  );
}

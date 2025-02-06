import { useState, useContext } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { AuthContext } from "@/context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const authContext = useContext(AuthContext);
  const router = useRouter();

  if (!authContext) {
    console.error("❌ Błąd: AuthContext jest null!");
    return null; // Zabezpieczenie przed błędem
  }
  
  const { login } = authContext;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!authContext) {
      setError("Błąd autoryzacji. Spróbuj ponownie później.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (authContext.login) {
          authContext.login(data.accessToken, data.refreshToken);
        }
        console.log("Token zapisany:", data.accessToken); // 🔍 Sprawdzenie, czy token jest zwracany
        if (login) {
          login(data.accessToken,data.refreshToken);
          console.log("✅ Przekierowanie na stronę główną...");
          router.push("/");
        }
      } else {
        setError(data.message || "Błąd logowania. Spróbuj ponownie.");
      }
    } catch (err) {
      console.error("Błąd serwera:", err);
      setError("Wystąpił błąd serwera. Spróbuj ponownie później.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Logowanie</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Zaloguj się
          </button>
        </form>
        <p className="mt-4 text-center">
          Nie masz konta?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

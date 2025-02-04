import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { AuthContext } from "@/context/AuthContext";

const Profile = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState("");
  const { token, logout } = useContext(AuthContext) || {};
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchUserProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          setUser(data);
        } else {
          setError(data.message || "Błąd ładowania profilu.");
        }
      } catch (err) {
        setError("Błąd serwera.");
        console.log(err)
      }
    };

    fetchUserProfile();
  }, [token, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Profil użytkownika</h2>
        {error && <p className="text-red-500">{error}</p>}
        {user ? (
          <div>
            <p><strong>Imię:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Rola:</strong> {user.role}</p>
            <button
              onClick={() => { if(logout) logout(); router.push("/login"); }}
              className="w-full bg-red-500 text-white p-2 rounded mt-4 hover:bg-red-600"
            >
              Wyloguj się
            </button>
          </div>
        ) : (
          <p className="text-gray-600">Ładowanie danych...</p>
        )}
      </div>
    </div>
  );
};

export default Profile;

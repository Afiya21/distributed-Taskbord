import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch("http://localhost:3000/api/auth/me", {
        credentials: "include"
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading...</p>;

  return user ? (
    <Dashboard user={user} />
  ) : (
    <Login onLogin={checkSession} />
  );
}

export default App;

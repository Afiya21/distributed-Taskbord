// import { useEffect, useState } from "react";
// import Login from "./pages/Login";
// import Dashboard from "./pages/Dashboard";


// function App() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // Check session when app loads
//   useEffect(() => {
//     checkSession();
//   }, []);

//   async function checkSession() {
//     try {
//       const res = await fetch("http://localhost:3000/api/protected", {
//         credentials: "include"
//       });

//       // If not logged in
//       if (!res.ok) {
//         setUser(null);
//         setLoading(false);
//         return;
//       }

//       const data = await res.json();
//       setUser(data.user);
//       setLoading(false);
//     } catch (error) {
//       console.error("Session check failed", error);
//       setUser(null);
//       setLoading(false);
//     }
//   }

//   // Called after successful login
//   function handleLogin(userData) {
//     setUser(userData);
//   }

//   // Show loading while checking session
//   if (loading) {
//     return <p>Loading...</p>;
//   }

//   // If not logged in → show Login
//   if (!user) {
//     return <Login onLogin={handleLogin} />;
//   }

//   // If logged in → show Dashboard
//   return <Dashboard user={user} />;
// }



// export default App;
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on page load
  useEffect(() => {
    checkSession();
  }, []);

  async function checkSession() {
    try {
      const res = await fetch("http://localhost:3000/api/protected", {
        credentials: "include"
      });

      // If not logged in
      if (!res.ok) {
        setUser(null);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setUser(data.user);
      setLoading(false);
    } catch (error) {
      console.error("Session check failed", error);
      setUser(null);
      setLoading(false);
    }
  }

  // Called after successful login
  function handleLogin(userData) {
    setUser(userData); // Directly update state on login
    checkSession(); // Immediately check session after login
  }

  // Show loading while checking session
  if (loading) {
    return <p>Loading...</p>;
  }

  // If not logged in → show Login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // If logged in → show Dashboard
  return <Dashboard user={user} />;
}

export default App;


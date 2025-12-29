import { useState } from "react";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    async function handleLogin(e) {
        e.preventDefault();
        setError(""); // Reset the error message

        try {
            const res = await fetch("http://localhost:3000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", // Send cookies (session)
                body: JSON.stringify({ email, password })
            });

            if (!res.ok) {
                const err = await res.json();
                setError(err.message || "Login failed");
                return;
            }

            const data = await res.json();
            onLogin(data.user); // Send user data to App.jsx
        } catch (err) {
            console.error(err);
            setError("Cannot connect to server");
        }
    }

    return (
        <div>
            <h2>Login</h2>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <br />

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default Login;

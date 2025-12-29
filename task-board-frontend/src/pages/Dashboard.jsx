import { useEffect, useState } from "react";
import { io } from "socket.io-client";
function Dashboard({ user }) {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");

    useEffect(() => {
        loadTasks();
    }, []);

    async function loadTasks() {
        const res = await fetch("http://localhost:3000/api/tasks", {
            credentials: "include"
        });
        const data = await res.json();
        setTasks(data);
    }

    async function createTask() {
        if (!title) return;

        const res = await fetch("http://localhost:3000/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title })
        });

        if (res.ok) {
            setTitle("");
            loadTasks();
        }
    }

    async function updateStatus(id, status) {
        await fetch(`http://localhost:3000/api/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status })
        });

        loadTasks();
    }

    return (
        <div>
            <h2>Task Board</h2>
            <p>Logged in as: <b>{user.name}</b> ({user.role})</p>

            {/* ADMIN PANEL */}
            {user.role === "admin" && (
                <div style={{ border: "2px solid black", padding: 10, marginBottom: 20 }}>
                    <h3>Admin Panel</h3>

                    <input
                        placeholder="Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <button onClick={createTask}>Create Task</button>
                </div>
            )}

            {/* TASK LIST */}
            {tasks.map(task => (
                <div key={task._id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
                    <h4>{task.title}</h4>
                    <p>Status: {task.status}</p>

                    <select
                        value={task.status}
                        onChange={(e) => updateStatus(task._id, e.target.value)}
                    >
                        <option value="todo">Todo</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                    </select>
                </div>
            ))}
        </div>
    );
}

export default Dashboard;

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function Dashboard({ user }) {
    const [tasks, setTasks] = useState([]);

    // Load tasks ONCE
    useEffect(() => {
        fetchTasks();
    }, []);

    async function fetchTasks() {
        const res = await fetch("http://localhost:3000/api/tasks", {
            credentials: "include"
        });
        const data = await res.json();
        setTasks(data);
    }

    // SOCKET CONNECTION
    useEffect(() => {
        const socket = io("http://localhost:3000", {
            withCredentials: true
        });

        socket.on("taskUpdated", (data) => {
            console.log("Task updated event received:", data);

            // ✅ REAL-TIME STATE UPDATE (NO RELOAD)
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === data.taskId
                        ? { ...task, status: data.status }
                        : task
                )
            );

            // ✅ ADMIN POPUP
            if (user.role === "admin") {
                alert(
                    `User ${data.updatedBy} changed "${data.title}" to ${data.status}`
                );
            }
        });

        return () => socket.disconnect();
    }, [user.role]);

    async function updateStatus(id, status) {
        await fetch(`http://localhost:3000/api/tasks/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ status })
        });
    }

    return (
        <div>
            <h2>Task Board</h2>
            <p>
                Logged in as <b>{user.name}</b> ({user.role})
            </p>

            {tasks.map((task) => (
                <div
                    key={task._id}
                    style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}
                >
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

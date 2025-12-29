
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

function Dashboard({ user }) {
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState(""); // State for new task title

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

            // REAL-TIME STATE UPDATE (NO RELOAD)
            setTasks((prevTasks) =>
                prevTasks.map((task) =>
                    task._id === data.taskId
                        ? { ...task, status: data.status }
                        : task
                )
            );

            // ADMIN POPUP (show for admins only)
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

    // LOGOUT FUNCTION
    async function handleLogout() {
        try {
            await fetch("http://localhost:3000/api/auth/logout", {
                method: "POST",
                credentials: "include"
            });

            window.location.reload(); // go back to login
        } catch (error) {
            console.error("Logout failed", error);
        }
    }

    // CREATE NEW TASK (for admin only)
    async function createTask() {
        if (!newTaskTitle) return; // Don't create if there's no title

        const res = await fetch("http://localhost:3000/api/tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ title: newTaskTitle })
        });

        if (res.ok) {
            setNewTaskTitle(""); // Reset input after successful creation
            fetchTasks(); // Reload tasks
        } else {
            console.error("Failed to create task");
        }
    }

    return (
        <div>
            {/* LOGOUT BUTTON */}
            <button
                onClick={handleLogout}
                style={{ float: "right", marginBottom: "10px" }}
            >
                Logout
            </button>

            <h2>Task Board</h2>
            <p>
                Logged in as <b>{user.name}</b> ({user.role})
            </p>

            {/* SHOW TASK CREATION FORM ONLY FOR ADMIN */}
            {user.role === "admin" && (
                <div style={{ marginBottom: "20px", padding: "10px", border: "1px solid #ccc" }}>
                    <h3>Create New Task</h3>
                    <input
                        type="text"
                        placeholder="Task title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        style={{ marginRight: "10px" }}
                    />
                    <button onClick={createTask}>Create Task</button>
                </div>
            )}

            {/* DISPLAY TASKS */}
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

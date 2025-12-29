const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const authRoutes = require("./routes/auth");
const User = require("./models/User");
const { isAuthenticated, isAdmin } = require("./middleware/authMiddleware");
const taskRoutes = require("./routes/taskRoutes");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");





const app = express();
app.use(express.json());
mongoose
    .connect(
        "mongodb+srv://taskboardUser:Maryam21@taskboard-cluster.sx59xhi.mongodb.net/?appName=taskboard-cluster"
    )
    .then(() => console.log("MongoDB connected"))
    .catch((err) => {
        console.error("MongoDB error:", err);
        process.exit(1);
    });
app.use(
    cors({
        origin: "http://localhost:5173", // React app
        credentials: true               // allow cookies
    })
);

// Session setup


app.use(
    session({
        secret: "taskboard_secret_key",
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl:
                "mongodb+srv://taskboardUser:Maryam21@taskboard-cluster.sx59xhi.mongodb.net/taskboard",
            collectionName: "sessions"
        }),
        cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
    })
);



// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Protected route (any logged-in user)
app.get("/api/protected", isAuthenticated, (req, res) => {
    res.json({ message: "You are logged in", user: req.session.user });
});

// Admin-only route
app.get("/api/admin", isAuthenticated, isAdmin, (req, res) => {
    res.json({ message: "Welcome admin" });
});


// Test route
app.get("/", (req, res) => {
    res.send("Task Board server is running");
});



// Start server
const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });
const server = http.createServer(app);

// const io = new Server(server, {
//     cors: {
//         origin: "*"
//     }
// });

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});
io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
    });
});

// Make io accessible in routes
app.set("io", io);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

# 90 Days of Growth — MERN App

A personal October 1–December 31, 2026 habit/task tracker with registration, login, JWT authentication, MongoDB persistence, add/remove tasks, and a horizontally scrollable daily checkbox matrix.

## Requirements
- Node.js 18+
- MongoDB local or MongoDB Atlas

## 1. Server
```bash
cd server
npm install
copy .env.example .env
```
On macOS/Linux use `cp .env.example .env`.

Edit `.env` and set `MONGO_URI` and a strong `JWT_SECRET`.

Run:
```bash
npm run dev
```
Server: http://localhost:5000

## 2. Client
Open a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL shown in the terminal, normally http://localhost:5173.

## MongoDB Atlas
Use a connection string such as:
`mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/growth_tracker`

If you deploy the frontend/backend, set `VITE_API_URL` for the client and `CLIENT_URL` for the server.

## Features
- Register/login
- Password hashing with bcrypt
- JWT-protected APIs
- User-specific tasks
- Oct 1–Dec 31 date columns (92 calendar days)
- Daily checkboxes saved in MongoDB
- Add task
- Remove task
- Progress statistics
- Responsive dashboard
- Logout

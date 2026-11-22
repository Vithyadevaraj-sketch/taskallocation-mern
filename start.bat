@echo off
start "Backend" cmd /k "cd /d D:\xampp\htdocs\taskallocation-mern\backend && node server.js"
start "Frontend" cmd /k "cd /d D:\xampp\htdocs\taskallocation-mern\frontend && npm run dev"
timeout /t 8 >nul
start http://localhost:5173
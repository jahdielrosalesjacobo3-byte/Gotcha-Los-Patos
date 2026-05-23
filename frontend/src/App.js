import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import BookingReturn from "./pages/BookingReturn";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
    return (
        <LanguageProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/admin/login" element={<AdminLogin />} />
                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                        <Route path="/reserva/exito" element={<BookingReturn variant="exito" />} />
                        <Route path="/reserva/pendiente" element={<BookingReturn variant="pendiente" />} />
                        <Route path="/reserva/error" element={<BookingReturn variant="error" />} />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </LanguageProvider>
    );
}

export default App;

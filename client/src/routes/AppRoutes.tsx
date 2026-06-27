import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import Dashboard from "../pages/Dashboard/Dashboard";
import Vote from "../pages/Vote/Vote";
import Results from "../pages/Results/Results";
import Admin from "../pages/Admin/Admin";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/vote" element={<Vote />} />
                <Route path="/results" element={<Results />} />
                <Route path="/admin" element={<Admin />} />

            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
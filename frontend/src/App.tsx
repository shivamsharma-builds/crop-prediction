import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Portal } from "./pages/Portal";
import { Admin } from "./pages/Admin";
import { AdminLogin } from "./pages/AdminLogin";
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return <BrowserRouter><AuthProvider><Routes>
    <Route path="/" element={<Portal/>}/>
    <Route path="/admin/login" element={<AdminLogin/>}/>
    <Route element={<ProtectedRoute admin/>}><Route path="/admin" element={<Admin/>}/></Route>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></AuthProvider></BrowserRouter>;
}

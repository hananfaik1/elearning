import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login         from './pages/Login';
import Register      from './pages/Register';
import Dashboard     from './pages/Dashboard';
import Catalogue     from './pages/Catalogue';
import MesCours      from './pages/MesCours';
import CreateCourse  from './pages/CreateCourse';
import GenerateAI    from './pages/GenerateAI';
import CourseDetail   from './pages/CourseDetail';
import AIGenerations  from './pages/AIGenerations';
import Recommendations from "./pages/Recommendations";

export default function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login"    element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>

                    <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard/></ProtectedRoute>}/>

                    <Route path="/catalogue" element={
                        <ProtectedRoute><Catalogue/></ProtectedRoute>}/>

                    <Route path="/mes-cours" element={
                        <ProtectedRoute><MesCours/></ProtectedRoute>}/>

                    <Route path="/create-course" element={
                        <ProtectedRoute role="PROF"><CreateCourse/></ProtectedRoute>}/>

                    <Route path="/generate-ai" element={
                        <ProtectedRoute role="PROF"><GenerateAI/></ProtectedRoute>}/>

                    <Route path="*" element={<Navigate to="/login"/>}/>

                    <Route path="/courses/:id" element={
                        <ProtectedRoute><CourseDetail/></ProtectedRoute>}/>

                    <Route path="/ai-generations" element={
                        <ProtectedRoute role="PROF"><AIGenerations/></ProtectedRoute>}/>
                    <Route path="/recommendations" element={<Recommendations />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}
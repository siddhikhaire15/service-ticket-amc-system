import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import EngineerHelp from "./pages/EngineerHelp";
import AdminHelp from "./pages/AdminHelp";

import UserProfile from "./pages/UserProfile";
import UserHelp from "./pages/UserHelp";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import EngineerLayout from "./components/layout/EngineerLayout";

import UserTickets from "./pages/UserTickets";
import UserTicketDetails from "./pages/UserTicketDetails";

import UserLayout from "./components/layout/UserLayout";
import UserAMC from "./pages/UserAMC";

import EngineerTickets from "./pages/EngineerTickets";
import EngineerTicketDetails from "./pages/EngineerTicketDetails";

import AdminDashboard from "./pages/AdminDashboard";
import AdminTickets from "./pages/AdminTickets";
import AdminTicketDetails from "./pages/AdminTicketDetails";
import AdminAMC from "./pages/AdminAMC";
import AdminReports from "./pages/AdminReports";
import EngineerServiceLogs from "./pages/EngineerServiceLogs";

import EngineerDashboard from "./pages/EngineerDashboard";
import UserDashboard from "./pages/UserDashboard";

import EngineerProfile from "./pages/EngineerProfile"; // ✅ NEW

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

import DashboardLayout from "./components/layout/DashboardLayout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ---------------- ADMIN ---------------- */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/tickets"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AdminTickets />
                </DashboardLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />


        
        <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />



        <Route
          path="/admin/tickets/:ticketId"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AdminTicketDetails />
                </DashboardLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        <Route
  path="/admin/help"
  element={
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={["admin"]}>
        <DashboardLayout>
          <AdminHelp />
        </DashboardLayout>
      </RoleProtectedRoute>
    </ProtectedRoute>
  }
/>

        
        <Route
  path="/engineer/service-logs/:ticketId"
  element={
    <EngineerLayout>
      <EngineerServiceLogs />
    </EngineerLayout>
  }
/>



        <Route
          path="/admin/amc"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AdminAMC />
                </DashboardLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["admin"]}>
                <DashboardLayout>
                  <AdminReports />
                </DashboardLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* ---------------- ENGINEER ---------------- */}
        <Route
          path="/engineer/dashboard"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["engineer"]}>
                <EngineerLayout>
                  <EngineerDashboard />
                </EngineerLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/engineer/tickets"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["engineer"]}>
                <EngineerLayout>
                  <EngineerTickets />
                </EngineerLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/engineer/tickets/:ticketId"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["engineer"]}>
                <EngineerLayout>
                  <EngineerTicketDetails />
                </EngineerLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* ✅ NEW: Engineer Profile */}
        <Route
          path="/engineer/profile"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["engineer"]}>
                <EngineerLayout>
                  <EngineerProfile />
                </EngineerLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />
        
        <Route
  path="/engineer/help"
  element={
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={["engineer"]}>
        <EngineerLayout>
          <EngineerHelp />
        </EngineerLayout>
      </RoleProtectedRoute>
    </ProtectedRoute>
  }
/>


        {/* ---------------- CUSTOMER ---------------- */}
        <Route
          path="/user/dashboard"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <UserLayout>
                  <UserDashboard />
                </UserLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/tickets"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <UserLayout>
                  <UserTickets />
                </UserLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/tickets/:ticketId"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <UserLayout>
                  <UserTicketDetails />
                </UserLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/amc"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <UserLayout>
                  <UserAMC />
                </UserLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/profile"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <UserLayout>
                  <UserProfile />
                </UserLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/user/help"
          element={
            <ProtectedRoute>
              <RoleProtectedRoute allowedRoles={["customer"]}>
                <UserLayout>
                  <UserHelp />
                </UserLayout>
              </RoleProtectedRoute>
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

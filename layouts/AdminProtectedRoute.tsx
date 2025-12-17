import React, { ReactNode } from "react";
import { Navigate } from "react-router-dom";

const AdminProtectedRoute = ({
  children,
}: {
  children: ReactNode;
}) => {
  const raw = localStorage.getItem("session");
  if (!raw) return <Navigate to="/login" replace />;

  const session = JSON.parse(raw);
  if (session?.role !== "admin") return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default AdminProtectedRoute;

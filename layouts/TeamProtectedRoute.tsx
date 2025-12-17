// src/layouts/TeamProtectedRoute.tsx
import React from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: React.ReactNode;
};

const TeamProtectedRoute: React.FC<Props> = ({ children }) => {
  const user = localStorage.getItem("team_user");
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default TeamProtectedRoute;

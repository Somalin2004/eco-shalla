// src/components/ProtectedRoute.jsx

import React from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { Center, Spinner } from "@chakra-ui/react";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <Center minH="40vh">
        <Spinner size="xl" color="green.500" />
      </Center>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

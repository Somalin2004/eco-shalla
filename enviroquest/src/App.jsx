// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { ChakraProvider, Box, extendTheme } from "@chakra-ui/react";
import { AnimatePresence } from "framer-motion";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Quizzes from "./pages/Quizzes";
import QuizDetail from "./pages/QuizDetail";
import Dashboard from "./pages/Dashboard";

// Theme customization
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "gray.50",
        color: "gray.800",
      },
    },
  },
});

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <Navbar />
      <Box minH="calc(100vh - 70px)" px={4} py={6}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/quiz/:id" element={<QuizDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </AnimatePresence>
      </Box>
    </ChakraProvider>
  );
}

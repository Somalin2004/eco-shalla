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

// --- Import your games ---
import GameBioticAbiotic from "./pages/GameBioticAbiotic";
import GameWasteSegregation from "./pages/GameWasteSegregation";
import GamePlantCare from "./pages/GamePlantCare";
import CleanRiverGame from "./pages/CleanRiverGame";
import AirPurifierGames from "./pages/AirPurifierGames";

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
            {/* --- Game routes --- */}
            <Route path="/game-biotic-abiotic" element={<GameBioticAbiotic />} />
            <Route path="/game-waste-segregation" element={<GameWasteSegregation />} />
            <Route path="/game-plant-care" element={<GamePlantCare />} />
             <Route path="/rivercleaning" element={< CleanRiverGame/>} />
             <Route path="/airpurifier" element={<AirPurifierGames />} />
          </Routes>
        </AnimatePresence>
      </Box>
    </ChakraProvider>
  );
}
import React from "react";
import {
  Box, Flex, Heading, Spacer, Button, Link,
  IconButton, HStack, VStack, useDisclosure, Collapse, Image
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { motion } from "framer-motion";
import logo from "../assets/generated-image.png"; // Import the logo image properly

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onToggle } = useDisclosure();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const MotionHeading = motion(Heading);

  return (
    <Box bg="white" boxShadow="sm" px={6} py={3} position="sticky" top="0" zIndex="1000">
      <Flex alignItems="center">
        {/* Logo with image and text */}
        <MotionHeading
          size="md"
          color="teal.500"
          letterSpacing="wide"
          cursor="pointer"
          whileHover={{ scale: 1.1 }}
          onClick={() => navigate("/")}
          display="flex"
          alignItems="center"
          gap={2}
        >
          <Image src={logo} alt="Logo" boxSize="30px" />
          EnviroQuest
        </MotionHeading>

        <Spacer />

        {/* Desktop Menu */}
        <HStack spacing={6} alignItems="center" display={{ base: "none", md: "flex" }}>
          <Link as={RouterLink} to="/" fontWeight="semibold" _hover={{ color: "teal.400" }}>
            Home
          </Link>
          <Link as={RouterLink} to="/quizzes" fontWeight="semibold" _hover={{ color: "teal.400" }}>
            Quizzes
          </Link>
          {user && (
            <Link as={RouterLink} to="/dashboard" fontWeight="semibold" _hover={{ color: "teal.400" }}>
              Dashboard
            </Link>
          )}

          {!user ? (
            <>
              <Button as={RouterLink} to="/login" variant="outline" colorScheme="teal" size="sm">
                Login
              </Button>
              <Button as={RouterLink} to="/signup" colorScheme="teal" size="sm">
                Signup
              </Button>
            </>
          ) : (
            <Button colorScheme="red" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          )}
        </HStack>

        {/* Mobile Menu Toggle */}
        <IconButton
          aria-label="Toggle Navigation"
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          display={{ base: "flex", md: "none" }}
          onClick={onToggle}
          variant="ghost"
          size="md"
        />
      </Flex>

      {/* Mobile Menu */}
      <Collapse in={isOpen} animateOpacity>
        <VStack spacing={4} mt={4} align="stretch" display={{ md: "none" }}>
          <Link as={RouterLink} to="/" fontWeight="semibold" _hover={{ color: "teal.400" }} onClick={onToggle}>
            Home
          </Link>
          <Link as={RouterLink} to="/quizzes" fontWeight="semibold" _hover={{ color: "teal.400" }} onClick={onToggle}>
            Quizzes
          </Link>
          {user && (
            <Link as={RouterLink} to="/dashboard" fontWeight="semibold" _hover={{ color: "teal.400" }} onClick={onToggle}>
              Dashboard
            </Link>
          )}

          {!user ? (
            <>
              <Button as={RouterLink} to="/login" variant="outline" colorScheme="teal" size="sm" onClick={onToggle}>
                Login
              </Button>
              <Button as={RouterLink} to="/signup" colorScheme="teal" size="sm" onClick={onToggle}>
                Signup
              </Button>
            </>
          ) : (
            <Button colorScheme="red" size="sm" onClick={handleLogout}>
              Sign Out
            </Button>
          )}
        </VStack>
      </Collapse>
    </Box>
  );
}

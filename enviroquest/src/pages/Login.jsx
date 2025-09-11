// src/pages/Login.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useToast,
  Flex,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      toast({
        status: "success",
        title: "Login successful!",
        duration: 3000,
        isClosable: true,
      });
      navigate("/dashboard");
    } catch (err) {
      toast({
        status: "error",
        title: "Login failed",
        description: err.message,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      toast({
        status: "error",
        title: "Google sign-in failed",
        description: err.message,
        isClosable: true,
      });
    }
  };

  // Theme-aware colors
  const cardBg = useColorModeValue("white", "gray.800");
  const headingColor = useColorModeValue("teal.600", "teal.300");
  const textColor = useColorModeValue("gray.600", "gray.400");
  const pageBg = useColorModeValue("gray.50", "gray.900");

  return (
    <Flex minH="100vh" align="center" justify="center" bg={pageBg} px={4}>
      <Box
        maxW="md"
        w="100%"
        p={8}
        boxShadow="lg"
        borderRadius="xl"
        bg={cardBg}
      >
        <VStack spacing={6}>
          <Heading size="lg" color={headingColor} textAlign="center">
            EnviroQuest — Sign In
          </Heading>

          {/* Form */}
          <form style={{ width: "100%" }} onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  focusBorderColor="teal.400"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  focusBorderColor="teal.400"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                w="100%"
                size="lg"
                isLoading={isLoading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>
            </VStack>
          </form>

          {/* Divider */}
          <Flex w="100%" align="center">
            <Divider />
            <Text px={2} color={textColor} fontSize="sm">
              OR
            </Text>
            <Divider />
          </Flex>

          {/* Google Sign-in */}
          <Button
            variant="outline"
            w="100%"
            size="lg"
            onClick={handleGoogleSignIn}
          >
            Sign in with Google
          </Button>

          {/* Signup link */}
          <Text color={textColor}>
            Don’t have an account?{" "}
            <RouterLink
              to="/signup"
              style={{ color: "#319795", fontWeight: "bold" }}
            >
              Sign up here
            </RouterLink>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}

// src/pages/Signup.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Flex,
  Text,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signup, signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast({ status: "error", title: "Passwords don't match" });
      return false;
    }
    if (formData.password.length < 6) {
      toast({
        status: "error",
        title: "Password should be at least 6 characters",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await signup(formData.email, formData.password);
      toast({ status: "success", title: "Account created successfully!" });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast({
        status: "error",
        title: "Signup failed",
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const u = await signInWithGoogle();
      if (u) {
        toast({ status: "success", title: "Signed in with Google!" });
        navigate("/dashboard", { replace: true });
      }
      // If redirect fallback was used, AuthProvider will handle redirect.
    } catch (err) {
      toast({
        status: "error",
        title: "Google sign-in failed",
        description: err.message,
      });
    } finally {
      setIsGoogleLoading(false);
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
            Create Account
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

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  focusBorderColor="teal.400"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="teal"
                w="100%"
                size="lg"
                isLoading={isLoading}
                loadingText="Creating..."
              >
                Sign Up
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

          {/* Google Sign-up */}
          <Button
            colorScheme="red"
            w="100%"
            size="lg"
            onClick={handleGoogleSignUp}
            isLoading={isGoogleLoading}
            loadingText="Connecting..."
          >
            Sign up with Google
          </Button>

          {/* Already have account */}
          <Text color={textColor}>
            Already have an account?{" "}
            <RouterLink
              to="/login"
              style={{ color: "#319795", fontWeight: "bold" }}
            >
              Sign in here
            </RouterLink>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}

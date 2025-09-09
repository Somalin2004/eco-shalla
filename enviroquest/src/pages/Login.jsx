import React, { useState } from "react";
import {
  Box, Button, FormControl, FormLabel, Input, VStack,
  Heading, Text, useToast, Flex, Divider
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const MotionBox = motion(Box);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(formData.email, formData.password);
      toast({ status: "success", title: "Login successful!", duration: 3000 });
      navigate("/dashboard");
    } catch (err) {
      toast({ status: "error", title: "Login failed", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      toast({ status: "error", title: "Google sign in failed", description: err.message });
    }
  };

  return (
    <Flex minH="80vh" align="center" justify="center">
      <MotionBox
        maxW="md"
        w="100%"
        p={8}
        boxShadow="2xl"
        borderRadius="lg"
        bg="white"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <VStack spacing={6}>
          <Heading size="xl" color="teal.700" textAlign="center">
            EnviroQuest — Sign In
          </Heading>

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

          <Flex w="100%" align="center">
            <Divider />
            <Text px={2} color="gray.500" fontSize="sm">
              OR
            </Text>
            <Divider />
          </Flex>

          <Button variant="outline" w="100%" onClick={handleGoogleSignIn}>
            Sign in with Google
          </Button>

          <Text>
            Don’t have an account?{" "}
            <RouterLink to="/signup" style={{ color: "#319795", fontWeight: "bold" }}>
              Sign up here
            </RouterLink>
          </Text>
        </VStack>
      </MotionBox>
    </Flex>
  );
}

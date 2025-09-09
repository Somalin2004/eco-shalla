// src/pages/Login.jsx
import React, { useState } from "react";
import {
  Box, Button, FormControl, FormLabel, Input, VStack, 
  Heading, Text, useToast, Flex, Divider
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(formData.email, formData.password);
      toast({ 
        status: "success", 
        title: "Login successful!", 
        duration: 3000 
      });
      navigate("/dashboard");
    } catch (err) {
      toast({ 
        status: "error", 
        title: "Login failed", 
        description: err.message, 
        duration: 5000 
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
        title: "Google sign in failed", 
        description: err.message, 
        duration: 5000 
      });
    }
  };

  return (
    <Flex minH="80vh" align="center" justify="center">
      <Box maxW="md" width="100%" p={8} boxShadow="xl" borderRadius="lg" bg="white">
        <VStack spacing={6}>
          <Heading size="xl" color="teal.700" textAlign="center">
            EnviroQuest — Sign In
          </Heading>
          
          <form style={{ width: '100%' }} onSubmit={handleSubmit}>
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
                width="100%" 
                size="lg"
                isLoading={isLoading}
                loadingText="Signing in..."
              >
                Sign In
              </Button>
            </VStack>
          </form>
          
          <Flex width="100%" align="center">
            <Divider />
            <Text padding={2} color="gray.500" fontSize="sm">OR</Text>
            <Divider />
          </Flex>
          
          <Button 
            variant="outline" 
            width="100%" 
            onClick={handleGoogleSignIn}
          >
            Sign in with Google
          </Button>
          
          <Text textAlign="center">
            Don't have an account?{" "}
            <RouterLink to="/signup" style={{ color: "#319795", fontWeight: "bold" }}>
              Sign up here
            </RouterLink>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}
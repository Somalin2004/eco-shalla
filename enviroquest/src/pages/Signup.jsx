// src/pages/Signup.jsx
import React, { useState } from "react";
import {
  Box, Button, FormControl, FormLabel, Input, VStack, 
  Heading, useToast, Flex, Text
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast({
        status: "error",
        title: "Passwords don't match",
        duration: 3000
      });
      return false;
    }
    
    if (formData.password.length < 6) {
      toast({
        status: "error",
        title: "Password should be at least 6 characters",
        duration: 3000
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
      toast({ 
        status: "success", 
        title: "Account created successfully!", 
        duration: 3000 
      });
      navigate("/dashboard");
    } catch (err) {
      toast({ 
        status: "error", 
        title: "Signup failed", 
        description: err.message, 
        duration: 5000 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex minH="80vh" align="center" justify="center">
      <Box maxW="md" width="100%" p={8} boxShadow="xl" borderRadius="lg" bg="white">
        <VStack spacing={6}>
          <Heading size="xl" color="teal.700" textAlign="center">
            Create Account
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
                  placeholder="At least 6 characters"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input 
                  name="confirmPassword"
                  type="password" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                />
              </FormControl>
              
              <Button 
                type="submit" 
                colorScheme="teal" 
                width="100%" 
                size="lg"
                isLoading={isLoading}
                loadingText="Creating account..."
              >
                Sign Up
              </Button>
            </VStack>
          </form>
          
          <Text textAlign="center">
            Already have an account?{" "}
            <RouterLink to="/login" style={{ color: "#319795", fontWeight: "bold" }}>
              Sign in here
            </RouterLink>
          </Text>
        </VStack>
      </Box>
    </Flex>
  );
}
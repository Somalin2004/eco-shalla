import React, { useEffect, useState } from "react";
import {
  Box, Button, FormControl, FormLabel, Input, VStack,
  Heading, useToast, Flex, Text, Divider
} from "@chakra-ui/react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

export default function Signup() {
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { signup, signInWithGoogle, user, loading } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const MotionBox = motion(Box);

  useEffect(() => {
    // If already authenticated (including after redirect), send to dashboard
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
      toast({ status: "error", title: "Password should be at least 6 characters" });
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
      toast({ status: "error", title: "Signup failed", description: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    try {
      const u = await signInWithGoogle();
      // If popup worked, we have a user now; if redirect fallback was used, this returns null and
      // the app will continue after the redirect via AuthProvider's onAuthStateChanged.
      if (u) {
        toast({ status: "success", title: "Signed in with Google!" });
        navigate("/dashboard", { replace: true });
      } else {
        // Redirect in progress – don't show an error
      }
    } catch (err) {
      toast({ status: "error", title: "Google sign-in failed", description: err.message });
    } finally {
      setIsGoogleLoading(false);
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
      >
        <VStack spacing={6}>
          <Heading size="xl" color="teal.700" textAlign="center">
            Create Account
          </Heading>

          <form style={{ width: "100%" }} onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input name="email" type="email" value={formData.email} onChange={handleChange} />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input name="password" type="password" value={formData.password} onChange={handleChange} />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Confirm Password</FormLabel>
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </FormControl>

              <Button type="submit" colorScheme="teal" w="100%" size="lg" isLoading={isLoading}>
                Sign Up
              </Button>
            </VStack>
          </form>

          <Divider />

          <Button
            colorScheme="red"
            w="100%"
            size="lg"
            onClick={handleGoogleSignUp}
            isLoading={isGoogleLoading}
            _hover={{ bg: "red.600" }}
          >
            Sign up with Google
          </Button>

          <Text>
            Already have an account?{" "}
            <RouterLink to="/login" style={{ color: "#319795", fontWeight: "bold" }}>
              Sign in here
            </RouterLink>
          </Text>
        </VStack>
      </MotionBox>
    </Flex>
  );
}

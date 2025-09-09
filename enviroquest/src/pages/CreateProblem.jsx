// src/pages/CreateProblem.jsx
import React, { useState } from "react";
import {
  Box, Button, FormControl, FormLabel, Input, Textarea, VStack, 
  Heading, useToast, HStack, Flex, Alert, AlertIcon, Spinner
} from "@chakra-ui/react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function CreateProblem() {
  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    department: "",
    category: "",
    theme: "",
    youtubeLink: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jsonError, setJsonError] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileJsonUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      
      // Map JSON fields to form fields with fallbacks
      setFormData({
        title: json["Problem Statement Title"] || json.title || "",
        organization: json.Organization || json.organization || "",
        department: json.Department || json.department || "",
        category: json.Category || json.category || "",
        theme: json.Theme || json.theme || "",
        youtubeLink: json["Youtube Link"] || json.youtubeLink || "",
        description: json.Description || json.description || ""
      });
      
      setJsonError("");
      toast({ status: "success", title: "JSON parsed and fields prefilled", duration: 3000 });
    } catch (err) {
      setJsonError("Invalid JSON file: " + err.message);
      toast({ status: "error", title: "Invalid JSON", description: err.message, duration: 5000 });
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast({ status: "error", title: "Title is required", duration: 3000 });
      return false;
    }
    if (!formData.description.trim()) {
      toast({ status: "error", title: "Description is required", duration: 3000 });
      return false;
    }
    return true;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    try {
      const data = {
        ...formData,
        createdAt: new Date().toISOString(),
      };

      const colRef = collection(db, "problems");
      const docRef = await addDoc(colRef, data);
      toast({ status: "success", title: "Problem saved successfully!", duration: 3000 });
      navigate(`/problem/${docRef.id}`);
    } catch (err) {
      console.error("Save error:", err);
      toast({ 
        status: "error", 
        title: "Save error", 
        description: err.message, 
        duration: 5000 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box maxW="3xl" mx="auto" p={6}>
      <Heading mb={6} color="teal.700">Create Problem Statement</Heading>
      
      <Box as="form" onSubmit={submit} bg="white" p={8} borderRadius="lg" boxShadow="md">
        <VStack spacing={5} align="stretch">
          <FormControl>
            <FormLabel fontWeight="bold">Upload JSON (optional)</FormLabel>
            <Input 
              type="file" 
              accept=".json,application/json" 
              onChange={handleFileJsonUpload} 
              p={1}
            />
            {jsonError && (
              <Alert status="error" mt={2} borderRadius="md">
                <AlertIcon />
                {jsonError}
              </Alert>
            )}
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="bold">Title</FormLabel>
            <Input 
              name="title"
              value={formData.title} 
              onChange={handleChange}
              placeholder="Enter problem statement title"
            />
          </FormControl>

          <HStack spacing={4} align="start">
            <FormControl>
              <FormLabel fontWeight="bold">Organization</FormLabel>
              <Input 
                name="organization"
                value={formData.organization} 
                onChange={handleChange}
                placeholder="Organization name"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="bold">Department</FormLabel>
              <Input 
                name="department"
                value={formData.department} 
                onChange={handleChange}
                placeholder="Department name"
              />
            </FormControl>
          </HStack>

          <HStack spacing={4} align="start">
            <FormControl>
              <FormLabel fontWeight="bold">Category</FormLabel>
              <Input 
                name="category"
                value={formData.category} 
                onChange={handleChange}
                placeholder="Problem category"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontWeight="bold">Theme</FormLabel>
              <Input 
                name="theme"
                value={formData.theme} 
                onChange={handleChange}
                placeholder="Problem theme"
              />
            </FormControl>
          </HStack>

          <FormControl>
            <FormLabel fontWeight="bold">YouTube Link</FormLabel>
            <Input 
              name="youtubeLink"
              value={formData.youtubeLink} 
              onChange={handleChange}
              placeholder="https://youtube.com/..."
              type="url"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel fontWeight="bold">Description</FormLabel>
            <Textarea 
              name="description"
              value={formData.description} 
              onChange={handleChange}
              placeholder="Detailed description of the problem..."
              rows={8}
            />
          </FormControl>

          <Flex justify="flex-end" pt={4}>
            <Button 
              type="submit" 
              colorScheme="teal" 
              size="lg" 
              isLoading={isSubmitting}
              loadingText="Saving..."
            >
              Save Problem
            </Button>
          </Flex>
        </VStack>
      </Box>
    </Box>
  );
}
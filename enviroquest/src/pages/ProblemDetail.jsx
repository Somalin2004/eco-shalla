// src/pages/ProblemDetail.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Heading, Text, Button, VStack, HStack, 
  Badge, Flex, Spinner, Alert, AlertIcon, Divider
} from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useParams, Link as RouterLink } from "react-router-dom";

export default function ProblemDetail() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProblem() {
      try {
        const docRef = doc(db, "problems", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setProblem({ id: docSnap.id, ...docSnap.data() });
        } else {
          setError("Problem not found");
        }
      } catch (err) {
        console.error("Error loading problem:", err);
        setError("Failed to load problem details");
      } finally {
        setLoading(false);
      }
    }
    
    loadProblem();
  }, [id]);

  if (loading) {
    return (
      <Flex justify="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  if (error || !problem) {
    return (
      <Box p={6} maxW="3xl" mx="auto">
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          {error || "Problem not found"}
        </Alert>
        <Button as={RouterLink} to="/" mt={4}>
          Back to Home
        </Button>
      </Box>
    );
  }

  const displayTitle = problem.title || problem["Problem Statement Title"] || "Untitled";
  const displayDescription = problem.description || problem["Description"] || "No description available";
  const displayOrg = problem.organization || problem.Organization || "Not specified";
  const displayDept = problem.department || problem.Department || "Not specified";
  const displayCategory = problem.category || problem.Category || "Not specified";
  const displayTheme = problem.theme || problem.Theme || "Not specified";

  return (
    <Box p={6} maxW="3xl" mx="auto">
      <Button as={RouterLink} to="/" mb={6} colorScheme="teal" variant="outline">
        ← Back to Problems
      </Button>
      
      <Box bg="white" p={8} borderRadius="lg" boxShadow="md">
        <Heading mb={4} color="teal.700">{displayTitle}</Heading>
        
        <HStack spacing={4} mb={6}>
          <Badge colorScheme="blue">{displayCategory}</Badge>
          <Badge colorScheme="green">{displayTheme}</Badge>
        </HStack>
        
        <Text whiteSpace="pre-wrap" mb={8} lineHeight="tall">
          {displayDescription}
        </Text>
        
        <Divider mb={6} />
        
        <VStack align="start" spacing={4}>
          <Flex width="100%">
            <Text fontWeight="bold" minW="120px">Organization:</Text>
            <Text>{displayOrg}</Text>
          </Flex>
          
          <Flex width="100%">
            <Text fontWeight="bold" minW="120px">Department:</Text>
            <Text>{displayDept}</Text>
          </Flex>
          
          <Flex width="100%">
            <Text fontWeight="bold" minW="120px">Category:</Text>
            <Text>{displayCategory}</Text>
          </Flex>
          
          <Flex width="100%">
            <Text fontWeight="bold" minW="120px">Theme:</Text>
            <Text>{displayTheme}</Text>
          </Flex>
          
          {problem.youtubeLink && (
            <Button 
              as="a" 
              href={problem.youtubeLink} 
              target="_blank" 
              rel="noopener noreferrer"
              colorScheme="red"
              mt={4}
            >
              Watch on YouTube
            </Button>
          )}
        </VStack>
      </Box>
    </Box>
  );
}
// src/pages/Home.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Heading, VStack, SimpleGrid, Text, Button, 
  Flex, Card, CardBody, useToast, Spinner
} from "@chakra-ui/react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";
import { Link as RouterLink } from "react-router-dom";

export default function Home() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    async function loadProblems() {
      try {
        const problemsQuery = query(
          collection(db, "problems"), 
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(problemsQuery);
        setProblems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error loading problems:", error);
        toast({
          status: "error",
          title: "Failed to load problems",
          description: error.message,
          duration: 5000
        });
      } finally {
        setLoading(false);
      }
    }
    loadProblems();
  }, [toast]);

  return (
    <Box p={6} maxW="7xl" mx="auto">
      <VStack spacing={4} align="stretch" mb={8}>
        <Heading color="teal.700" textAlign="center">EnviroQuest — Problem Statements</Heading>
        <Text textAlign="center" color="gray.600" fontSize="lg">
          Explore environmental challenges and contribute solutions. Sign in to create or edit problem statements.
        </Text>
      </VStack>

      {loading ? (
        <Flex justify="center" py={10}>
          <Spinner size="xl" color="teal.500" />
        </Flex>
      ) : problems.length === 0 ? (
        <Box textAlign="center" py={10} bg="white" borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4} color="gray.600">No problems yet</Heading>
          <Text mb={6}>Be the first to create a problem statement</Text>
          <Button as={RouterLink} to="/signup" colorScheme="teal" size="lg">
            Sign Up to Get Started
          </Button>
        </Box>
      ) : (
        <SimpleGrid columns={[1, 2, 3]} spacing={5}>
          {problems.map(problem => (
            <Card key={problem.id} variant="outlined" height="100%" 
              boxShadow="md" _hover={{ boxShadow: "lg", transform: "translateY(-2px)" }}
              transition="all 0.2s">
              <CardBody>
                <Heading size="sm" mb={3} color="teal.700" noOfLines={2}>
                  {problem.title || problem["Problem Statement Title"] || "Untitled"}
                </Heading>
                <Text fontSize="sm" color="gray.600" noOfLines={3} mb={4}>
                  {problem.description || problem["Description"] || "No description available"}
                </Text>
                <Button 
                  as={RouterLink} 
                  to={`/problem/${problem.id}`} 
                  colorScheme="teal" 
                  size="sm"
                  width="100%"
                >
                  View Details
                </Button>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
}
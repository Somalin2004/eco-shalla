// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Heading, Button, VStack, SimpleGrid, useToast, 
  HStack, Spacer, Text, useDisclosure, AlertDialog,
  AlertDialogBody, AlertDialogFooter, AlertDialogHeader,
  AlertDialogContent, AlertDialogOverlay, Flex, Card, CardBody
} from "@chakra-ui/react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [problemToDelete, setProblemToDelete] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = React.useRef();
  const toast = useToast();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const loadProblems = async () => {
    try {
      const snap = await getDocs(collection(db, "problems"));
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
  };

  useEffect(() => { 
    loadProblems(); 
  }, []);

  const handleDeleteClick = (problem) => {
    setProblemToDelete(problem);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!problemToDelete) return;
    
    try {
      await deleteDoc(doc(db, "problems", problemToDelete.id));
      toast({ 
        status: "success", 
        title: "Problem deleted successfully",
        duration: 3000
      });
      loadProblems(); // Reload the list
    } catch (error) {
      console.error("Delete error:", error);
      toast({ 
        status: "error", 
        title: "Failed to delete problem", 
        description: error.message,
        duration: 5000
      });
    } finally {
      onClose();
      setProblemToDelete(null);
    }
  };

  return (
    <Box p={6} maxW="7xl" mx="auto">
      <HStack mb={8} align="center">
        <Heading color="teal.700">Dashboard</Heading>
        <Spacer />
        <Text color="gray.600">Welcome, {user?.email}</Text>
        <Button colorScheme="teal" as={RouterLink} to="/create">
          Create New
        </Button>
        <Button colorScheme="gray" onClick={() => { logout(); navigate("/"); }}>
          Sign out
        </Button>
      </HStack>

      {loading ? (
        <Flex justify="center" py={10}>
          <Text>Loading problems...</Text>
        </Flex>
      ) : problems.length === 0 ? (
        <Box textAlign="center" py={10} bg="white" borderRadius="lg" boxShadow="sm">
          <Heading size="md" mb={4} color="gray.600">No problems yet</Heading>
          <Text mb={6}>Create your first problem statement to get started</Text>
          <Button as={RouterLink} to="/create" colorScheme="teal">
            Create Problem
          </Button>
        </Box>
      ) : (
        <>
          <Heading size="md" mb={4} color="gray.600">
            Your Problem Statements ({problems.length})
          </Heading>
          <SimpleGrid columns={[1, 2, 3]} spacing={5}>
            {problems.map(problem => (
              <Card key={problem.id} variant="outlined" boxShadow="md" _hover={{ boxShadow: "lg" }}>
                <CardBody>
                  <Heading size="sm" mb={2} noOfLines={1}>
                    {problem.title || problem["Problem Statement Title"] || "Untitled"}
                  </Heading>
                  <Text fontSize="sm" color="gray.600" noOfLines={2} mb={4}>
                    {problem.description || problem["Description"] || "No description available"}
                  </Text>
                  <VStack align="start" spacing={2}>
                    <Button 
                      size="sm" 
                      as={RouterLink} 
                      to={`/problem/${problem.id}`} 
                      colorScheme="teal"
                      width="100%"
                    >
                      View Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleDeleteClick(problem)}
                      width="100%"
                    >
                      Delete
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </>
      )}

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Problem
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete "{problemToDelete?.title || problemToDelete?.["Problem Statement Title"]}"? 
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
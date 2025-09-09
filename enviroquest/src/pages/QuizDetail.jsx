import React, { useEffect, useState } from "react";
import {
  Box, Heading, Text, Button, VStack, HStack,
  Flex, Spinner, Alert, AlertIcon, Radio, RadioGroup,
  Progress, Card, CardBody, useToast, Badge, Modal,
  ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton
} from "@chakra-ui/react";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const MotionVStack = motion(VStack);

export default function QuizDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    async function loadQuiz() {
      try {
        const docRef = doc(db, "quiz_sections", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const quizData = { id: docSnap.id, ...docSnap.data() };

          // check if user already solved this quiz
          if (user) {
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && userSnap.data().quizResults) {
              const existing = userSnap.data().quizResults.find(
                (r) => r.quizId === quizData.id
              );
              if (existing) {
                setScore(existing.score);
                setCompleted(true);
                setShowResults(true);
              }
            }
          }

          setQuiz(quizData);
        }
      } catch (err) {
        console.error("Error loading quiz:", err);
      } finally {
        setLoading(false);
      }
    }
    loadQuiz();
  }, [id, user]);

  const handleNext = async () => {
    if (!selectedAnswer) {
      toast({ status: "warning", title: "Please select an answer" });
      return;
    }

    const currentQ = quiz.questions[currentQuestion];
    if (selectedAnswer === currentQ.answer) setScore((prev) => prev + 1);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer("");
    } else {
      setCompleted(true);
      setShowResults(true);

      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const prevResults = userSnap.exists() ? userSnap.data().quizResults || [] : [];

        // check if already stored
        const already = prevResults.some((r) => r.quizId === quiz.id);
        if (!already) {
          await updateDoc(userRef, {
            quizResults: arrayUnion({
              quizId: quiz.id,
              quizName: quiz.level,
              score: score + (selectedAnswer === currentQ.answer ? 1 : 0),
              total: quiz.questions.length,
              date: new Date().toISOString()
            })
          });
        }
      }
    }
  };

  if (loading) {
    return (
      <Flex justify="center" py={10}>
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  if (!quiz) {
    return (
      <Box p={6} maxW="3xl" mx="auto">
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          Quiz not found
        </Alert>
        <Button as={RouterLink} to="/quizzes" mt={4}>
          Back to Quizzes
        </Button>
      </Box>
    );
  }

  const currentQ = quiz.questions[currentQuestion];
  const progressValue = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <Box p={6} maxW="3xl" mx="auto">
      <Button as={RouterLink} to="/quizzes" mb={6} colorScheme="teal" variant="outline">
        ← Back to Quizzes
      </Button>

      <Card boxShadow="xl" borderRadius="lg">
        <Box bg="teal.600" p={4} color="white">
          <Heading size="md">{quiz.level}</Heading>
          {!completed && (
            <Text>Question {currentQuestion + 1} of {quiz.questions.length}</Text>
          )}
        </Box>

        {!completed && (
          <Progress value={progressValue} size="sm" colorScheme="teal" />
        )}

        <CardBody p={6}>
          {!completed ? (
            <MotionVStack
              spacing={6}
              align="stretch"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Heading size="lg" color="teal.700">
                {currentQ.question}
              </Heading>

              <RadioGroup value={selectedAnswer} onChange={setSelectedAnswer}>
                <VStack spacing={3} align="stretch">
                  {currentQ.options.map((option, index) => (
                    <Card
                      key={index}
                      variant={selectedAnswer === option ? "filled" : "outline"}
                      bg={selectedAnswer === option ? "teal.50" : "white"}
                      borderColor={selectedAnswer === option ? "teal.300" : "gray.200"}
                      _hover={{ borderColor: "teal.400", cursor: "pointer" }}
                      onClick={() => setSelectedAnswer(option)}
                    >
                      <CardBody py={3}>
                        <Text>{option}</Text>
                      </CardBody>
                    </Card>
                  ))}
                </VStack>
              </RadioGroup>

              <Button colorScheme="teal" size="lg" onClick={handleNext}>
                {currentQuestion < quiz.questions.length - 1 ? "Next Question" : "Finish Quiz"}
              </Button>
            </MotionVStack>
          ) : (
            <VStack spacing={6} align="center" py={8}>
              <Heading color="teal.700">Quiz Completed!</Heading>
              <Text fontSize="xl">
                Your score: <Badge colorScheme="green">{score} / {quiz.questions.length}</Badge>
              </Text>
              <HStack spacing={4}>
                <Button colorScheme="teal" onClick={() => navigate(0)}>Try Again</Button>
                <Button as={RouterLink} to="/quizzes" variant="outline">More Quizzes</Button>
              </HStack>
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* Results Modal */}
      <Modal isOpen={showResults} onClose={() => setShowResults(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Quiz Results</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Heading>{score}/{quiz.questions.length}</Heading>
              <Text>
                {score === quiz.questions.length
                  ? "🏆 Perfect score!"
                  : score >= quiz.questions.length * 0.7
                  ? "🌟 Great job!"
                  : "👍 Keep practicing!"}
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" onClick={() => setShowResults(false)}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}

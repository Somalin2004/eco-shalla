import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Progress,
  Card,
  CardBody,
  useToast,
  Badge,
} from "@chakra-ui/react";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function QuizDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [userAnswers, setUserAnswers] = useState([]);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  // Load quiz and user results
  useEffect(() => {
    async function loadQuiz() {
      try {
        const quizRef = doc(db, "quiz_sections", id);
        const quizSnap = await getDoc(quizRef);
        if (!quizSnap.exists()) {
          setLoading(false);
          return;
        }
        const quizData = { id: quizSnap.id, ...quizSnap.data() };
        setQuiz(quizData);

        // Load user's previous quiz result (if any)
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const quizResults = userData.quizResults || [];
            const existingResult = quizResults.find(r => r.quizId === id);
            if (existingResult) {
              setScore(existingResult.score);
              setCompleted(true);
              setAlreadyCompleted(true);
            }
          }
        }
      } catch (error) {
        console.error("Error loading quiz:", error);
        toast({
          title: "Error loading quiz",
          description: "Please try again later",
          status: "error",
          duration: 3000,
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) loadQuiz();
  }, [id, user, toast]);

  // Select Answer
  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  // Go to Next or Finish
  const handleNext = async () => {
    if (!selectedAnswer) {
      toast({
        title: "Please select an answer",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    const currentQ = quiz.questions[currentQuestion];
    const isCorrect = selectedAnswer === currentQ.answer;

    const newUserAnswers = [
      ...userAnswers,
      {
        questionIndex: currentQuestion,
        selectedAnswer,
        correctAnswer: currentQ.answer,
        isCorrect,
      },
    ];
    setUserAnswers(newUserAnswers);

    if (isCorrect) setScore(prev => prev + 1);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer("");
    } else {
      // Finish quiz and save result
      const finalScore = score + (isCorrect ? 1 : 0);
      setScore(finalScore);
      setCompleted(true);
      if (user) {
        await saveQuizResult(finalScore, newUserAnswers);
      }
    }
  };

  // Save or Overwrite Quiz Result
  const saveQuizResult = async (finalScore, answers) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      // Prepare result payload
      const quizResult = {
        quizId: quiz.id,
        quizTitle: quiz.level || quiz.title || "Quiz",
        score: finalScore,
        total: quiz.questions.length,
        percentage: Math.round((finalScore / quiz.questions.length) * 100),
        answers: answers,
        completedAt: new Date().toISOString(),
        timeTaken: null,
      };

      if (userSnap.exists()) {
        const userData = userSnap.data();
        let quizResults = userData.quizResults || [];
        // Remove old result for same quiz if exists, then add the new one
        quizResults = quizResults.filter(r => r.quizId !== quiz.id);
        quizResults.push(quizResult);
        await updateDoc(userRef, { quizResults });
      } else {
        // New user document
        await setDoc(userRef, {
          email: user.email,
          quizResults: [quizResult],
          createdAt: new Date().toISOString(),
        });
      }
      toast({
        title: "Quiz completed!",
        description: `You scored ${finalScore}/${quiz.questions.length}`,
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error saving quiz result:", error);
      toast({
        title: "Error saving results",
        description: "Your quiz was completed but results couldn't be saved",
        status: "warning",
        duration: 3000,
      });
    }
  };

  // Retake Quiz
  const retakeQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer("");
    setUserAnswers([]);
    setScore(0);
    setCompleted(false);
    setAlreadyCompleted(false);
  };

  // Loading
  if (loading) {
    return (
      <Flex align="center" justify="center" minH="60vh">
        <Spinner size="xl" /> <Text ml={4}>Loading quiz...</Text>
      </Flex>
    );
  }
  if (!quiz) {
    return (
      <Alert status="error">
        <AlertIcon />
        Quiz not found
        <Button as={RouterLink} to="/quizzes" ml={4}>
          Back to Quizzes
        </Button>
      </Alert>
    );
  }

  // Main content
  const currentQ = quiz.questions?.[currentQuestion];
  const progressValue = ((currentQuestion + 1) / quiz.questions.length) * 100;

  return (
    <Box maxW="600px" mx="auto" p={4}>
      <Button as={RouterLink} to="/quizzes" mb={4} variant="ghost">
        ← Back to Quizzes
      </Button>
      <Card mb={6}>
        <CardBody>
          <Heading size="md" mb={2}>
            {quiz.level || quiz.title}
          </Heading>
          {quiz.description && (
            <Text fontSize="md" mb={2}>{quiz.description}</Text>
          )}
        </CardBody>
      </Card>
      {!completed && (
        <Box>
          <Progress value={progressValue} size="sm" mb={4} />
          <Text fontWeight="bold" mb={2}>
            Question {currentQuestion + 1} of {quiz.questions.length}
          </Text>
          <Box mb={4}>
            <Text fontSize="xl" mb={3}>{currentQ?.question}</Text>
            <VStack>
              {currentQ?.options?.map((option, idx) => (
                <Button
                  key={idx}
                  onClick={() => handleAnswerSelect(option)}
                  variant={selectedAnswer === option ? "solid" : "outline"}
                  size="md"
                  w="100%"
                  mb={2}
                  colorScheme={
                    selectedAnswer === option ? "teal" : "gray"
                  }
                  transition="all 0.2s"
                >
                  {option}
                </Button>
              ))}
            </VStack>
          </Box>
          <Button
            colorScheme="blue"
            onClick={handleNext}
            mt={4}
            w="100%"
          >
            {currentQuestion < quiz.questions.length - 1
              ? "Next Question"
              : "Finish Quiz"}
          </Button>
        </Box>
      )}
      {completed && (
        <VStack spacing={4} mt={6}>
          <Heading size="md">
            {alreadyCompleted ? "Quiz Already Completed!" : "🎉 Quiz Completed!"}
          </Heading>
          <Text fontSize="xl">
            Your score:{" "}
            <Badge
              colorScheme={
                score === quiz.questions.length
                  ? "green"
                  : score >= quiz.questions.length * 0.7
                  ? "yellow"
                  : "red"
              }
              fontSize="lg"
              p={2}
            >
              {score} / {quiz.questions.length}
            </Badge>
          </Text>
          <Text fontSize="lg">
            {Math.round((score / quiz.questions.length) * 100)}% correct
          </Text>
          <Text>
            {score === quiz.questions.length
              ? "🏆 Perfect score! Excellent work!"
              : score >= quiz.questions.length * 0.7
              ? "🌟 Great job! You did well!"
              : "📚 Keep practicing to improve your score!"}
          </Text>
          <Button
            colorScheme="teal"
            w="100%"
            onClick={retakeQuiz}
            mt={2}
          >
            Try Again
          </Button>
          <Button
            as={RouterLink}
            to="/quizzes"
            w="100%"
            variant="outline"
            mt={2}
          >
            More Quizzes
          </Button>
        </VStack>
      )}
    </Box>
  );
}

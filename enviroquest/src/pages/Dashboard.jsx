import React, { useEffect, useState } from "react";
import {
  Box, Heading, VStack, Text, Card, CardBody,
  Flex, Spinner, Badge, SimpleGrid, Progress, Avatar, HStack, Divider
} from "@chakra-ui/react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const MotionCard = motion(Card);

export default function Dashboard() {
  const { user } = useAuth();
  const [quizResults, setQuizResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setQuizResults(userSnap.data().quizResults || []);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUserData();
  }, [user]);

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="200px">
        <Spinner size="xl" color="teal.500" />
      </Flex>
    );
  }

  // --- Stats Calculations ---
  const totalCompleted = quizResults.length;
  const avgScore = totalCompleted > 0
    ? Math.round((quizResults.reduce((acc, r) => acc + (r.score / r.total), 0) / totalCompleted) * 100)
    : 0;
  const highestScore = totalCompleted > 0 ? Math.max(...quizResults.map(r => r.score / r.total)) * 100 : 0;
  const lowestScore = totalCompleted > 0 ? Math.min(...quizResults.map(r => r.score / r.total)) * 100 : 0;
  const totalQuestions = quizResults.reduce((acc, r) => acc + r.total, 0);
  const correctAnswers = quizResults.reduce((acc, r) => acc + r.score, 0);
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // --- Streak Calculation ---
  const dates = quizResults.map(r => new Date(r.date).toDateString());
  const uniqueDays = [...new Set(dates)];
  const streak = uniqueDays.length;

  return (
    <Box maxW="1000px" mx="auto" p={6}>
      {/* User Profile */}
      <Card mb={8}>
        <CardBody>
          <Flex align="center" gap={4}>
            <Avatar name={user?.displayName || "User"} src={user?.photoURL} size="xl" />
            <Box>
              <Heading size="md">{user?.displayName || "Anonymous User"}</Heading>
              <Text color="gray.600">{user?.email}</Text>
              <Text fontSize="sm" color="gray.500">
                Member since {user?.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString()
                  : "N/A"}
              </Text>
            </Box>
          </Flex>
        </CardBody>
      </Card>

      {/* Overall Stats */}
      <Card mb={8}>
        <CardBody>
          <Heading size="md" mb={4}>Your Progress Overview</Heading>
          <SimpleGrid columns={[1, 2, 3]} spacing={6}>
            <Box>
              <Text fontWeight="bold" mb={2}>Total Quizzes Completed</Text>
              <Text fontSize="2xl" color="teal.600">{totalCompleted}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2}>Average Score</Text>
              <Text fontSize="2xl" color="teal.600">{avgScore}%</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2}>Accuracy</Text>
              <Text fontSize="2xl" color="teal.600">{accuracy}%</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2}>Highest Score</Text>
              <Text fontSize="2xl" color="green.500">{highestScore.toFixed(0)}%</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2}>Lowest Score</Text>
              <Text fontSize="2xl" color="red.500">{lowestScore.toFixed(0)}%</Text>
            </Box>
            <Box>
              <Text fontWeight="bold" mb={2}>Active Days</Text>
              <Text fontSize="2xl" color="purple.500">{streak}</Text>
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Achievements */}
      <Card mb={8}>
        <CardBody>
          <Heading size="md" mb={4}>Achievements</Heading>
          <HStack spacing={4} wrap="wrap">
            {totalCompleted > 0 && <Badge colorScheme="teal">🎉 First Quiz Completed</Badge>}
            {avgScore >= 90 && <Badge colorScheme="yellow">🏆 High Scorer</Badge>}
            {totalCompleted >= 5 && <Badge colorScheme="purple">🔥 5 Quizzes Completed</Badge>}
            {streak >= 3 && <Badge colorScheme="red">📅 3-Day Streak</Badge>}
            {accuracy === 100 && <Badge colorScheme="green">Perfect Accuracy</Badge>}
            {totalCompleted === 0 && <Text color="gray.500">No achievements yet. Keep going!</Text>}
          </HStack>
        </CardBody>
      </Card>

      {/* Recent Results */}
      <Heading size="md" mb={4}>Recent Quiz Results</Heading>
      <VStack spacing={6} align="stretch">
        {quizResults.slice().reverse().map((result, i) => (
          <MotionCard
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <CardBody>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <Box>
                  <Heading size="sm">{result.quizName}</Heading>
                  <Text fontSize="sm" color="gray.600">
                    {new Date(result.date).toLocaleDateString()}
                  </Text>
                </Box>
                <Box flex="1">
                  <Text fontWeight="bold" mb={2}>
                    {result.score}/{result.total} ({Math.round((result.score / result.total) * 100)}%)
                  </Text>
                  <Progress
                    value={(result.score / result.total) * 100}
                    colorScheme={result.score / result.total >= 0.7 ? "green" : "orange"}
                    size="sm"
                  />
                </Box>
                <Badge colorScheme={result.score / result.total >= 0.7 ? "green" : "orange"}>
                  {result.score / result.total >= 0.9 ? "Excellent" :
                    result.score / result.total >= 0.7 ? "Good" : "Practice More"}
                </Badge>
              </Flex>
            </CardBody>
          </MotionCard>
        ))}
      </VStack>
    </Box>
  );
}

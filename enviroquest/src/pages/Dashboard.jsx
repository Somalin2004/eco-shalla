import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  Card,
  CardBody,
  Flex,
  Spinner,
  Badge,
  SimpleGrid,
  Progress,
  Avatar,
  HStack,
  Divider,
  Skeleton,
  SkeletonText,
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
    // Use a skeleton loader with cards for better loading UX
    return (
      <Box maxW="900px" mx="auto" p={6}>
        <Skeleton height="40px" mb={6} />
        <SimpleGrid columns={[1, 2, 3]} spacing={6}>
          {[...Array(6)].map((_, idx) => (
            <Card key={idx} p={4} borderRadius="md" boxShadow="md">
              <Skeleton height="20px" mb={4} />
              <SkeletonText noOfLines={3} spacing="4" />
            </Card>
          ))}
        </SimpleGrid>
      </Box>
    );
  }

  // Calculations
  const totalCompleted = quizResults.length;
  const avgScore =
    totalCompleted > 0
      ? Math.round(
          (quizResults.reduce((acc, r) => acc + (r.score / r.total), 0) /
            totalCompleted) *
            100
        )
      : 0;
  const highestScore =
    totalCompleted > 0
      ? Math.max(...quizResults.map((r) => r.score / r.total)) * 100
      : 0;
  const lowestScore =
    totalCompleted > 0
      ? Math.min(...quizResults.map((r) => r.score / r.total)) * 100
      : 0;
  const totalQuestions = quizResults.reduce((acc, r) => acc + r.total, 0);
  const correctAnswers = quizResults.reduce((acc, r) => acc + r.score, 0);
  const accuracy =
    totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  // Streak calculation - unique days counting
  // Assumes date field format is ISO string or timestamp convertible
  const dates = quizResults
    .map((r) => new Date(r.date || r.completedAt || r.completedAt).toDateString())
    .filter(Boolean);
  const uniqueDays = [...new Set(dates)];
  const streak = uniqueDays.length;

  return (
    <Box maxW="900px" mx="auto" p={6}>
      {/* User Profile */}
      <Card mb={8} boxShadow="md" borderRadius="lg">
        <CardBody>
          <Flex align="center" gap={6} flexWrap="wrap">
            <Avatar
              name={user?.displayName || "User"}
              src={user?.photoURL}
              size="xl"
              aria-label="User Avatar"
            />
            <Box minW={200}>
              <Heading size="md" mb={1}>
                {user?.displayName || "Anonymous User"}
              </Heading>
              <Text color="gray.600" mb={1} noOfLines={1}>
                {user?.email || "No email"}
              </Text>
              <Text fontSize="sm" color="gray.500" noOfLines={1}>
                Member since{" "}
                {user?.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString()
                  : "N/A"}
              </Text>
            </Box>
          </Flex>
        </CardBody>
      </Card>

      {/* Overall Stats */}
      <Card mb={8} boxShadow="md" borderRadius="lg">
        <CardBody>
          <Heading size="md" mb={6}>
            Your Progress Overview
          </Heading>
          <SimpleGrid columns={[1, 2, 3]} spacing={8} minChildWidth="140px">
            {[
              { label: "Total Quizzes Completed", value: totalCompleted, color: "teal.600" },
              { label: "Average Score", value: `${avgScore}%`, color: "teal.600" },
              { label: "Accuracy", value: `${accuracy}%`, color: "teal.600" },
              { label: "Highest Score", value: `${highestScore.toFixed(0)}%`, color: "green.500" },
              { label: "Lowest Score", value: `${lowestScore.toFixed(0)}%`, color: "red.500" },
              { label: "Active Days", value: streak, color: "purple.500" },
            ].map(({ label, value, color }) => (
              <Box key={label} textAlign="center">
                <Text fontWeight="bold" mb={2}>
                  {label}
                </Text>
                <Text fontSize="2xl" color={color}>
                  {value}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Achievements */}
      <Card mb={8} boxShadow="md" borderRadius="lg">
        <CardBody>
          <Heading size="md" mb={6}>
            Achievements
          </Heading>
          <HStack spacing={4} wrap="wrap" aria-label="User achievements badges">
            {totalCompleted > 0 && (
              <Badge colorScheme="teal" variant="subtle" px={3} py={1} borderRadius="md">
                🎉 First Quiz Completed
              </Badge>
            )}
            {avgScore >= 90 && (
              <Badge colorScheme="yellow" variant="subtle" px={3} py={1} borderRadius="md">
                🏆 High Scorer
              </Badge>
            )}
            {totalCompleted >= 5 && (
              <Badge colorScheme="purple" variant="subtle" px={3} py={1} borderRadius="md">
                🔥 5 Quizzes Completed
              </Badge>
            )}
            {streak >= 3 && (
              <Badge colorScheme="red" variant="subtle" px={3} py={1} borderRadius="md">
                📅 3-Day Streak
              </Badge>
            )}
            {accuracy === 100 && (
              <Badge colorScheme="green" variant="subtle" px={3} py={1} borderRadius="md">
                Perfect Accuracy
              </Badge>
            )}
            {totalCompleted === 0 && (
              <Text color="gray.500" fontStyle="italic">
                No achievements yet. Keep going!
              </Text>
            )}
          </HStack>
        </CardBody>
      </Card>

      {/* Recent Quiz Results */}
      <Heading size="md" mb={6}>
        Recent Quiz Results
      </Heading>
      <VStack spacing={6} align="stretch">
        {quizResults.slice().reverse().map((result, i) => {
          const pct = (result.score / result.total) * 100;
          return (
            <MotionCard
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              boxShadow="md"
              borderRadius="lg"
              p={4}
            >
              <CardBody>
                <Flex
                  justify="space-between"
                  align="center"
                  wrap="wrap"
                  gap={4}
                  aria-label={`Quiz result for ${result.quizName}`}
                >
                  <Box minW={160}>
                    <Heading size="sm">{result.quizName}</Heading>
                    <Text fontSize="sm" color="gray.600">
                      {new Date(result.date || result.completedAt).toLocaleDateString()}
                    </Text>
                  </Box>
                  <Box flex="1" minW={160}>
                    <Text fontWeight="bold" mb={2}>
                      {result.score}/{result.total} ({Math.round(pct)}%)
                    </Text>
                    <Progress
                      value={pct}
                      colorScheme={pct >= 70 ? "green" : pct >= 40 ? "yellow" : "orange"}
                      size="sm"
                      borderRadius="md"
                      aria-label={`Score progress: ${Math.round(pct)}%`}
                    />
                  </Box>
                  <Badge
                    colorScheme={pct >= 90 ? "green" : pct >= 70 ? "yellow" : "orange"}
                    px={3}
                    py={1}
                    borderRadius="md"
                    minW={120}
                    textAlign="center"
                    aria-label="Performance badge"
                  >
                    {pct >= 90 ? "Excellent" : pct >= 70 ? "Good" : "Practice More"}
                  </Badge>
                </Flex>
              </CardBody>
            </MotionCard>
          );
        })}
      </VStack>
    </Box>
  );
}

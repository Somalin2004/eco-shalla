import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  SimpleGrid,
  Text,
  Button,
  Flex,
  Card,
  CardBody,
  Spinner,
  Badge,
  Icon,
  HStack,
  Alert,
  AlertIcon,
  Input,
  Select,
  useColorModeValue,
  ScaleFade,
} from "@chakra-ui/react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaClock, FaTrophy, FaChartLine, FaStar } from "react-icons/fa";

export default function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    totalPoints: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { user } = useAuth();

  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "gray.200");
  const badgeColor = useColorModeValue("teal.400", "teal.300");
  const gridBg = useColorModeValue("blue.50", "teal.900");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const quizCollection = collection(db, "quiz_sections");
        const quizSnapshot = await getDocs(quizCollection);
        const quizData = quizSnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            level: data.level || data.title || `Quiz ${doc.id}`,
            difficulty: data.difficulty || "",
            estimatedTime: data.estimatedTime || 10,
            category: data.category || "",
            questions: data.questions || [],
            description: data.description || "",
          };
        });

        let results = [];
        let stats = {
          totalQuizzes: quizData.length,
          completedQuizzes: 0,
          averageScore: 0,
          totalPoints: 0,
        };
        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            results = userData.quizResults || [];
            stats.completedQuizzes = results.length;
            if (results.length > 0) {
              const totalPercentage = results.reduce(
                (sum, result) => sum + (result.percentage || 0),
                0
              );
              stats.averageScore = Math.round(totalPercentage / results.length);
              stats.totalPoints = results.reduce(
                (sum, result) => sum + (result.score || 0),
                0
              );
            }
          }
        }
        setQuizzes(quizData);
        setFilteredQuizzes(quizData);
        setUserResults(results);
        setUserStats(stats);
      } catch (error) {
        console.error("Error loading quizzes:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  useEffect(() => {
    let filtered = quizzes;
    if (searchTerm) {
      filtered = filtered.filter(
        (quiz) =>
          quiz.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
          quiz.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterStatus !== "all") {
      filtered = filtered.filter((quiz) => {
        const isCompleted = userResults.some((result) => result.quizId === quiz.id);
        return filterStatus === "completed" ? isCompleted : !isCompleted;
      });
    }

    // Sort by custom level order
    const levelOrder = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
      expert: 4,
      mastery: 5,
    };

    filtered = filtered.sort(
      (a, b) =>
        (levelOrder[a.level.toLowerCase()] || 99) - (levelOrder[b.level.toLowerCase()] || 99)
    );

    setFilteredQuizzes(filtered);
  }, [searchTerm, filterStatus, quizzes, userResults]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "green";
      case "medium":
        return "yellow";
      case "hard":
        return "red";
      default:
        return "blue";
    }
  };

  const getUserResult = (quizId) => {
    return userResults.find((result) => result.quizId === quizId);
  };

  const getProgressPercentage = () => {
    return userStats.totalQuizzes > 0
      ? Math.round((userStats.completedQuizzes / userStats.totalQuizzes) * 100)
      : 0;
  };

  if (loading) {
    return (
      <Flex align="center" justify="center" minH="60vh">
        <Spinner size="xl" /> <Text ml={4}>Loading quizzes...</Text>
      </Flex>
    );
  }

  return (
    <Box minH="100vh" bg={gridBg} p={[2, 6]}>
      {/* Header */}
      <Heading
        lineHeight={1.1}
        fontWeight={900}
        textAlign="center"
        bgGradient="linear(to-r, teal.400, blue.400)"
        bgClip="text"
        fontSize={["2xl", "4xl"]}
        mt={4}
      >
        🌱 Environmental Quizzes
      </Heading>
      <Text mb={4} textAlign="center" color={textColor} fontSize={{ base: "md", md: "lg" }}>
        Test your knowledge on environmental issues and solutions!
      </Text>
      {/* User Stats */}
      {user && (
        <HStack bg={cardBg} shadow="sm" p={3} borderRadius="lg" justify="center" mb={6}>
          <Badge fontSize="md" colorScheme="green">
            <FaTrophy /> {userStats.completedQuizzes} Completed
          </Badge>
          <Badge fontSize="md" colorScheme="teal">
            <FaChartLine /> {userStats.averageScore}% Avg Score
          </Badge>
          <Badge fontSize="md" colorScheme="yellow">
            <FaStar /> {userStats.totalPoints} Total Points
          </Badge>
          <Badge fontSize="md" colorScheme="blue">
            {getProgressPercentage()}% Progress
          </Badge>
        </HStack>
      )}

      {/* Filters */}
      <Flex mb={4} gap={2} align="center" flexWrap="wrap" justify="center">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search quizzes..."
          maxW="300px"
          bg={cardBg}
          borderColor={badgeColor}
          focusBorderColor="teal.400"
        />
        <Select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          maxW="200px"
          bg={cardBg}
        >
          <option value="all">All Quizzes</option>
          <option value="completed">Completed</option>
          <option value="notCompleted">Not Completed</option>
        </Select>
      </Flex>

      {/* Quiz Cards Grid */}
      {filteredQuizzes.length === 0 ? (
        <Box textAlign="center" my={10} p={6} rounded="md" bg={cardBg} shadow="md">
          <Heading size="md" mb={2}>
            No quizzes found
          </Heading>
          <Text>{quizzes.length === 0 ? "No quizzes available yet" : "Try adjusting your search or filters!"}</Text>
        </Box>
      ) : (
        <SimpleGrid columns={[1, 2, 3]} spacing={8} mt={4}>
          {filteredQuizzes.map((quiz, idx) => {
            const userResult = getUserResult(quiz.id);
            const isCompleted = !!userResult;
            return (
              <ScaleFade in={true} initialScale={0.8} key={quiz.id}>
                <Card
                  bg={cardBg}
                  shadow="xl"
                  borderRadius="2xl"
                  borderWidth={2}
                  borderColor={isCompleted ? "green.400" : "teal.200"}
                  transition="all 0.3s"
                  _hover={{
                    borderColor: "blue.400",
                    transform: "scale(1.04) rotate(-2deg)",
                    shadow: "2xl",
                  }}
                  minH="280px"
                >
                  <CardBody>
                    <Heading size="md" mb={2} color={textColor}>
                      {quiz.level}
                    </Heading>
                    <HStack mb={2}>
                      <Badge colorScheme={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                      <Badge colorScheme="purple">{quiz.questions.length} Questions</Badge>
                      <Badge colorScheme="cyan">
                        <FaClock /> {quiz.estimatedTime} min
                      </Badge>
                    </HStack>
                    <Text mb={3} color="gray.600" fontSize="sm" minH="48px">
                      {quiz.description}
                    </Text>
                    {isCompleted && userResult && (
                      <Box mb={3}>
                        <Badge colorScheme="green" fontWeight="bold" mr={2}>
                          ✓ Completed
                        </Badge>
                        <Badge colorScheme="yellow">
                          Score: {userResult.score}/{userResult.total} ({userResult.percentage}%)
                        </Badge>
                      </Box>
                    )}
                    <Button
                      as={RouterLink}
                      to={`/quiz/${quiz.id}`}
                      w="100%"
                      size="md"
                      colorScheme={isCompleted ? "green" : "teal"}
                      mt={2}
                      leftIcon={isCompleted ? <FaTrophy /> : <FaStar />}
                      fontWeight="bold"
                      variant={isCompleted ? "outline" : "solid"}
                      _hover={{
                        bg: "teal.500",
                        color: "white",
                        shadow: "xl",
                      }}
                      transition="all 0.2s"
                    >
                      {isCompleted ? "🏆 View Results" : "🚀 Start Quiz"}
                    </Button>
                  </CardBody>
                </Card>
              </ScaleFade>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}

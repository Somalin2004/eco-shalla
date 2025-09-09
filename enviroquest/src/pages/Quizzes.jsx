import React, { useEffect, useState } from "react";
import {
  Box, Heading, VStack, SimpleGrid, Text, Button,
  Flex, Card, CardBody, Spinner, Badge, Progress,
  Icon, useColorModeValue, HStack, Tooltip,
  Alert, AlertIcon, Input, InputGroup, InputLeftElement,
  Select, IconButton
} from "@chakra-ui/react";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Link as RouterLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import {
  FaSearch, FaTrophy, FaClock, FaChartLine,
  FaStar, FaBookOpen, FaFilter, FaRedo
} from "react-icons/fa";

const MotionCard = motion(Card);
const MotionBox = motion(Box);

export default function Quizzes() {
  const [quizSections, setQuizSections] = useState([]);
  const [filteredQuizzes, setFilteredQuizzes] = useState([]);
  const [userResults, setUserResults] = useState([]);
  const [userStats, setUserStats] = useState({
    totalQuizzes: 0,
    completedQuizzes: 0,
    averageScore: 0,
    totalPoints: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("level");
  const { user } = useAuth();

  // Color mode values
  const bgGradient = useColorModeValue(
    "linear(to-br, teal.50, blue.50, green.50)",
    "linear(to-br, gray.900, teal.900, blue.900)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.700", "gray.200");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        
        // Load all quiz sections with enhanced data
        const quizQuery = query(
          collection(db, "quiz_sections"), 
          orderBy(sortBy === "level" ? "level" : "createdAt", "asc")
        );
        const snap = await getDocs(quizQuery);
        const quizzes = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          difficulty: d.data().difficulty || "Medium",
          estimatedTime: d.data().estimatedTime || 10,
          category: d.data().category || "General"
        }));

        // Load user quiz results and calculate stats
        let results = [];
        let stats = {
          totalQuizzes: quizzes.length,
          completedQuizzes: 0,
          averageScore: 0,
          totalPoints: 0
        };

        if (user) {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists() && userSnap.data().quizResults) {
            results = userSnap.data().quizResults;
            
            // Calculate user statistics
            stats.completedQuizzes = results.length;
            if (results.length > 0) {
              const totalScore = results.reduce((sum, result) => sum + (result.score || 0), 0);
              stats.averageScore = Math.round(totalScore / results.length);
              stats.totalPoints = results.reduce((sum, result) => sum + (result.points || 0), 0);
            }
          }
        }

        setQuizSections(quizzes);
        setFilteredQuizzes(quizzes);
        setUserResults(results);
        setUserStats(stats);
      } catch (error) {
        console.error("Error loading quizzes:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user, sortBy]);

  // Filter and search functionality
  useEffect(() => {
    let filtered = quizSections.filter(quiz => {
      const matchesSearch = quiz.level.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (quiz.category && quiz.category.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (filterStatus === "all") return matchesSearch;
      
      const isSolved = userResults.some(r => r.quizId === quiz.id);
      if (filterStatus === "completed") return matchesSearch && isSolved;
      if (filterStatus === "pending") return matchesSearch && !isSolved;
      
      return matchesSearch;
    });

    // Sort filtered results
    if (sortBy === "difficulty") {
      const difficultyOrder = { "Easy": 1, "Medium": 2, "Hard": 3 };
      filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    }

    setFilteredQuizzes(filtered);
  }, [searchTerm, filterStatus, sortBy, quizSections, userResults]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Easy": return "green";
      case "Medium": return "yellow";
      case "Hard": return "red";
      default: return "blue";
    }
  };

  const getUserResult = (quizId) => {
    return userResults.find(r => r.quizId === quizId);
  };

  const getProgressPercentage = () => {
    return userStats.totalQuizzes > 0 
      ? Math.round((userStats.completedQuizzes / userStats.totalQuizzes) * 100) 
      : 0;
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <VStack spacing={4}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Spinner size="xl" color="teal.500" thickness="4px" />
          </motion.div>
          <Text color={textColor}>Loading your quizzes...</Text>
        </VStack>
      </Flex>
    );
  }

  return (
    <Box
      minH="100vh"
      bgGradient={bgGradient}
      py={8}
    >
      <Box maxW="7xl" mx="auto" px={6}>
        {/* Header Section */}
        <MotionBox
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          mb={8}
        >
          <VStack spacing={6} align="stretch">
            <Heading 
              size="2xl" 
              textAlign="center" 
              bgGradient="linear(to-r, teal.400, blue.500, green.400)"
              bgClip="text"
              fontWeight="extrabold"
            >
              🌱 Environmental Quizzes
            </Heading>
            <Text 
              textAlign="center" 
              color={textColor} 
              fontSize="lg" 
              maxW="2xl" 
              mx="auto"
            >
              Test your knowledge on environmental issues and solutions. Progress through levels and earn badges!
            </Text>
          </VStack>
        </MotionBox>

        {/* User Stats Section */}
        {user && (
          <MotionBox
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            mb={8}
          >
            <Card bg={cardBg} boxShadow="lg" borderRadius="xl">
              <CardBody>
                <VStack spacing={4}>
                  <HStack spacing={8} justify="center" wrap="wrap">
                    <VStack spacing={1}>
                      <Icon as={FaTrophy} color="gold" boxSize={6} />
                      <Text fontWeight="bold" fontSize="2xl">{userStats.completedQuizzes}</Text>
                      <Text fontSize="sm" color={textColor}>Completed</Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Icon as={FaChartLine} color="teal.500" boxSize={6} />
                      <Text fontWeight="bold" fontSize="2xl">{userStats.averageScore}%</Text>
                      <Text fontSize="sm" color={textColor}>Avg Score</Text>
                    </VStack>
                    <VStack spacing={1}>
                      <Icon as={FaStar} color="purple.500" boxSize={6} />
                      <Text fontWeight="bold" fontSize="2xl">{userStats.totalPoints}</Text>
                      <Text fontSize="sm" color={textColor}>Total Points</Text>
                    </VStack>
                  </HStack>
                  
                  <Box w="100%">
                    <Flex justify="space-between" mb={2}>
                      <Text fontSize="sm" fontWeight="medium">Progress</Text>
                      <Text fontSize="sm" color={textColor}>{getProgressPercentage()}%</Text>
                    </Flex>
                    <Progress 
                      value={getProgressPercentage()} 
                      colorScheme="teal" 
                      size="lg" 
                      borderRadius="full"
                      bg="gray.200"
                    />
                  </Box>
                </VStack>
              </CardBody>
            </Card>
          </MotionBox>
        )}

        {/* Filters and Search */}
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          mb={8}
        >
          <Card bg={cardBg} boxShadow="md" borderRadius="xl">
            <CardBody>
              <Flex direction={["column", "row"]} gap={4} align={["stretch", "center"]}>
                <InputGroup flex={1}>
                  <InputLeftElement>
                    <Icon as={FaSearch} color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search quizzes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    borderRadius="lg"
                  />
                </InputGroup>
                
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  maxW={["full", "200px"]}
                  borderRadius="lg"
                >
                  <option value="all">All Quizzes</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </Select>
                
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  maxW={["full", "200px"]}
                  borderRadius="lg"
                >
                  <option value="level">Sort by Level</option>
                  <option value="difficulty">Sort by Difficulty</option>
                  <option value="createdAt">Sort by Date</option>
                </Select>

                <Tooltip label="Reset filters">
                  <IconButton
                    icon={<FaRedo />}
                    onClick={() => {
                      setSearchTerm("");
                      setFilterStatus("all");
                      setSortBy("level");
                    }}
                    colorScheme="teal"
                    variant="outline"
                    borderRadius="lg"
                  />
                </Tooltip>
              </Flex>
            </CardBody>
          </Card>
        </MotionBox>

        {/* Quiz Cards */}
        <AnimatePresence>
          {filteredQuizzes.length === 0 ? (
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
            >
              <Alert status="info" borderRadius="xl" bg={cardBg} boxShadow="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">
                    {quizSections.length === 0 
                      ? "No quizzes available yet" 
                      : "No quizzes match your current filters"
                    }
                  </Text>
                  <Text fontSize="sm" color={textColor} mt={1}>
                    {quizSections.length === 0 
                      ? "Check back later for environmental quizzes" 
                      : "Try adjusting your search or filters"
                    }
                  </Text>
                </Box>
              </Alert>
            </MotionBox>
          ) : (
            <SimpleGrid columns={[1, 2, 3]} spacing={6}>
              {filteredQuizzes.map((quiz, i) => {
                const userResult = getUserResult(quiz.id);
                const isSolved = !!userResult;
                
                return (
                  <MotionCard
                    key={quiz.id}
                    height="100%"
                    bg={cardBg}
                    boxShadow="lg"
                    borderRadius="xl"
                    borderTop="4px solid"
                    borderColor={isSolved ? "green.400" : "teal.400"}
                    whileHover={{ 
                      scale: 1.05, 
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" 
                    }}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -50 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: i * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    layoutId={quiz.id}
                  >
                    <CardBody>
                      <Flex direction="column" height="100%">
                        <Box flex="1">
                          {/* Quiz Title */}
                          <Heading size="md" mb={3} color="teal.600">
                            {quiz.level}
                          </Heading>

                          {/* Badges */}
                          <HStack mb={4} wrap="wrap" spacing={2}>
                            <Badge 
                              colorScheme={isSolved ? "green" : "blue"} 
                              variant="solid"
                              borderRadius="full"
                            >
                              {isSolved ? "✓ Completed" : `${quiz.questions?.length || 0} Questions`}
                            </Badge>
                            <Badge 
                              colorScheme={getDifficultyColor(quiz.difficulty)}
                              variant="outline"
                              borderRadius="full"
                            >
                              {quiz.difficulty}
                            </Badge>
                          </HStack>

                          {/* Quiz Info */}
                          <VStack align="stretch" spacing={3} mb={4}>
                            <HStack>
                              <Icon as={FaClock} color="gray.500" />
                              <Text fontSize="sm" color={textColor}>
                                ~{quiz.estimatedTime} minutes
                              </Text>
                            </HStack>
                            
                            <HStack>
                              <Icon as={FaBookOpen} color="gray.500" />
                              <Text fontSize="sm" color={textColor}>
                                {quiz.category}
                              </Text>
                            </HStack>

                            {userResult && (
                              <HStack>
                                <Icon as={FaStar} color="yellow.500" />
                                <Text fontSize="sm" fontWeight="medium" color="yellow.600">
                                  Score: {userResult.score}% ({userResult.points} pts)
                                </Text>
                              </HStack>
                            )}
                          </VStack>

                          <Text fontSize="sm" color={textColor} noOfLines={2}>
                            {quiz.description || "Test your knowledge on various environmental topics and challenges."}
                          </Text>
                        </Box>

                        {/* Action Button */}
                        <Button
                          as={RouterLink}
                          to={`/quiz/${quiz.id}`}
                          colorScheme={isSolved ? "green" : "teal"}
                          size="md"
                          w="100%"
                          mt={4}
                          borderRadius="lg"
                          _hover={{
                            transform: "translateY(-2px)",
                            boxShadow: "lg"
                          }}
                          transition="all 0.2s"
                        >
                          {isSolved ? "🏆 View Results" : "🚀 Start Quiz"}
                        </Button>
                      </Flex>
                    </CardBody>
                  </MotionCard>
                );
              })}
            </SimpleGrid>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}
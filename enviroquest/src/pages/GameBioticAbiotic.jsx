import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Badge,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
  Grid,
  GridItem,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Select,
  Flex,
  Icon
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, StarIcon } from "@chakra-ui/icons";

const allQuestions = [
  // Easy Level
  { label: "🍎 Apple", type: "Biotic", difficulty: "Easy", hint: "It grows on trees and can decay" },
  { label: "🪨 Stone", type: "Abiotic", difficulty: "Easy", hint: "It's a mineral from the earth" },
  { label: "🌱 Plant", type: "Biotic", difficulty: "Easy", hint: "It performs photosynthesis" },
  { label: "🛍️ Plastic Bag", type: "Abiotic", difficulty: "Easy", hint: "It's manufactured, not grown" },
  { label: "🐕 Dog", type: "Biotic", difficulty: "Easy", hint: "It breathes and moves around" },
  { label: "💧 Water", type: "Abiotic", difficulty: "Easy", hint: "Essential for life but not alive itself" },
  { label: "🌳 Tree", type: "Biotic", difficulty: "Easy", hint: "It grows and produces oxygen" },
  { label: "🪙 Coin", type: "Abiotic", difficulty: "Easy", hint: "Made of metal" },
  { label: "🐱 Cat", type: "Biotic", difficulty: "Easy", hint: "It purrs and hunts mice" },
  { label: "🔥 Fire", type: "Abiotic", difficulty: "Easy", hint: "It consumes but isn't alive" },
  
  // Medium Level
  { label: "🦠 Bacteria", type: "Biotic", difficulty: "Medium", hint: "Microscopic organisms that reproduce" },
  { label: "🌊 Ocean Wave", type: "Abiotic", difficulty: "Medium", hint: "Water movement, not the water itself" },
  { label: "🍄 Mushroom", type: "Biotic", difficulty: "Medium", hint: "It's a fungus that grows" },
  { label: "⚡ Lightning", type: "Abiotic", difficulty: "Medium", hint: "Electrical discharge in the atmosphere" },
  { label: "🦴 Bone", type: "Abiotic", difficulty: "Medium", hint: "Once part of living thing, now mineral" },
  { label: "🌿 Moss", type: "Biotic", difficulty: "Medium", hint: "Small plants that grow in damp places" },
  { label: "🌋 Volcano", type: "Abiotic", difficulty: "Medium", hint: "Geological formation" },
  { label: "🐚 Seashell", type: "Abiotic", difficulty: "Medium", hint: "Made by animals but now just calcium" },
  { label: "🦀 Crab", type: "Biotic", difficulty: "Medium", hint: "Lives in the ocean and has claws" },
  { label: "❄️ Snow", type: "Abiotic", difficulty: "Medium", hint: "Frozen water crystals" },
  
  // Hard Level
  { label: "🦠 Virus", type: "Abiotic", difficulty: "Hard", hint: "Needs host cells to reproduce" },
  { label: "🌸 Pollen", type: "Biotic", difficulty: "Hard", hint: "Reproductive cells from plants" },
  { label: "🧬 DNA", type: "Biotic", difficulty: "Hard", hint: "Genetic material from living things" },
  { label: "🔬 Crystal", type: "Abiotic", difficulty: "Hard", hint: "Organized mineral structure" },
  { label: "🍯 Honey", type: "Biotic", difficulty: "Hard", hint: "Made by bees from nectar" },
  { label: "🌪️ Tornado", type: "Abiotic", difficulty: "Hard", hint: "Weather phenomenon" },
  { label: "🦠 Spore", type: "Biotic", difficulty: "Hard", hint: "Reproductive unit of fungi/bacteria" },
  { label: "🌙 Moon", type: "Abiotic", difficulty: "Hard", hint: "Celestial body made of rock" },
  { label: "🧪 Enzyme", type: "Biotic", difficulty: "Hard", hint: "Proteins made by living organisms" },
  { label: "🌋 Lava", type: "Abiotic", difficulty: "Hard", hint: "Molten rock from earth's interior" }
];

export default function EnhancedBioticAbioticGame() {
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [gameQuestions, setGameQuestions] = useState([]);
  const [difficulty, setDifficulty] = useState("Mixed");
  const [gameMode, setGameMode] = useState("Classic");
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isStatsOpen,
    onOpen: onStatsOpen,
    onClose: onStatsClose
  } = useDisclosure();
  
  const toast = useToast();

  // Timer effect for timed mode
  useEffect(() => {
    let interval;
    if (gameMode === "Timed" && gameStarted && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            endGame();
            return 0;
          }
          return t - 1;
        });
        setTotalTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameMode, gameStarted, timeLeft]);

  // Initialize game questions based on difficulty
  const initializeGame = () => {
    let questions = [];
    if (difficulty === "Easy") {
      questions = allQuestions.filter(q => q.difficulty === "Easy");
    } else if (difficulty === "Medium") {
      questions = allQuestions.filter(q => q.difficulty === "Medium");
    } else if (difficulty === "Hard") {
      questions = allQuestions.filter(q => q.difficulty === "Hard");
    } else {
      questions = [...allQuestions];
    }
    
    // Shuffle questions
    const shuffled = questions.sort(() => Math.random() - 0.5);
    setGameQuestions(shuffled.slice(0, gameMode === "Timed" ? 20 : 15));
  };

  const startGame = () => {
    initializeGame();
    setGameStarted(true);
    setCurrent(0);
    setScore(0);
    setWrongAnswers(0);
    setStreak(0);
    setHintsUsed(0);
    setFeedback("");
    setShowHint(false);
    setTotalTime(0);
    if (gameMode === "Timed") {
      setTimeLeft(gameMode === "Speed" ? 60 : 120);
    }
  };

  const handleGuess = (type) => {
    const correct = gameQuestions[current].type === type;
    
    if (correct) {
      const points = gameMode === "Timed" ? 2 : 1;
      const bonusPoints = streak >= 3 ? 1 : 0;
      const hintPenalty = showHint ? 0.5 : 0;
      const finalPoints = Math.max(1, points + bonusPoints - hintPenalty);
      
      setScore(s => s + finalPoints);
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > bestStreak) setBestStreak(newStreak);
        return newStreak;
      });
      setFeedback(`Correct! +${finalPoints} points`);
      
      if (streak >= 2) {
        toast({
          title: `🔥 ${streak + 1} Streak!`,
          description: "You're on fire!",
          status: "success",
          duration: 1500,
        });
      }
    } else {
      setWrongAnswers(w => w + 1);
      setStreak(0);
      setFeedback(`Wrong! It's ${gameQuestions[current].type}`);
    }

    setShowHint(false);
    
    setTimeout(() => {
      if (current + 1 >= gameQuestions.length) {
        endGame();
      } else {
        setCurrent(c => c + 1);
        setFeedback("");
        if (gameMode === "Timed") {
          setTimeLeft(t => Math.min(t + 3, gameMode === "Speed" ? 60 : 120)); // Bonus time
        }
      }
    }, 1000);
  };

  const endGame = () => {
    setGameStarted(false);
    onOpen();
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrent(0);
    setScore(0);
    setWrongAnswers(0);
    setStreak(0);
    setFeedback("");
    setShowHint(false);
    setGameQuestions([]);
    setTimeLeft(30);
    setTotalTime(0);
    onClose();
  };

  const useHint = () => {
    setShowHint(true);
    setHintsUsed(h => h + 1);
  };

  const getProgressColor = () => {
    if (streak >= 5) return "purple";
    if (streak >= 3) return "orange";
    return "green";
  };

  const getPerformanceRating = () => {
    const accuracy = gameQuestions.length > 0 ? (score / gameQuestions.length) * 100 : 0;
    if (accuracy >= 90) return { rating: "Excellent!", icon: "🏆", color: "gold" };
    if (accuracy >= 75) return { rating: "Great!", icon: "🥈", color: "silver" };
    if (accuracy >= 60) return { rating: "Good!", icon: "🥉", color: "bronze" };
    return { rating: "Keep Practicing!", icon: "📚", color: "gray.500" };
  };

  // Game Setup Screen
  if (!gameStarted && gameQuestions.length === 0) {
    return (
      <Box p={8} maxW="lg" mx="auto" bg="gradient(to-br, green.50, blue.50)" borderRadius="xl" boxShadow="xl">
        <VStack spacing={6}>
          <Box textAlign="center">
            <Heading size="xl" color="green.600" mb={2}>
              🌿 Biotic vs Abiotic 🪨
            </Heading>
            <Text color="gray.600" fontSize="lg">
              Test your knowledge of living and non-living things!
            </Text>
          </Box>

          <VStack spacing={4} w="full">
            <Box w="full">
              <Text mb={2} fontWeight="semibold">Choose Difficulty:</Text>
              <Select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} bg="white">
                <option value="Easy">🌱 Easy (Basic items)</option>
                <option value="Medium">🌿 Medium (Challenging items)</option>
                <option value="Hard">🌳 Hard (Tricky items)</option>
                <option value="Mixed">🌍 Mixed (All levels)</option>
              </Select>
            </Box>

            <Box w="full">
              <Text mb={2} fontWeight="semibold">Choose Game Mode:</Text>
              <Select value={gameMode} onChange={(e) => setGameMode(e.target.value)} bg="white">
                <option value="Classic">🎯 Classic (15 questions)</option>
                <option value="Timed">⏱️ Timed Challenge (2 min)</option>
              </Select>
            </Box>
          </VStack>

          <Button
            colorScheme="green"
            size="lg"
            onClick={startGame}
            leftIcon={<Icon as={StarIcon} />}
          >
            Start Game
          </Button>

          <Button variant="outline" onClick={onStatsOpen}>
            📊 View Stats
          </Button>
        </VStack>
      </Box>
    );
  }

  // Game Over Screen
  if (!gameStarted && gameQuestions.length > 0) {
    const performance = getPerformanceRating();
    return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center" fontSize="2xl">
            🎉 Game Complete! 🎉
          </ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <Text fontSize="3xl">{performance.icon}</Text>
              <Text fontSize="xl" fontWeight="bold" color={performance.color}>
                {performance.rating}
              </Text>
              
              <StatGroup w="full">
                <Stat textAlign="center">
                  <StatLabel>Final Score</StatLabel>
                  <StatNumber>{score}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel>Best Streak</StatLabel>
                  <StatNumber>{bestStreak}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel>Accuracy</StatLabel>
                  <StatNumber>{gameQuestions.length > 0 ? Math.round((score / gameQuestions.length) * 100) : 0}%</StatNumber>
                </Stat>
              </StatGroup>

              <HStack spacing={6}>
                <VStack>
                  <Text fontSize="sm" color="green.600">Correct</Text>
                  <Text fontSize="lg" fontWeight="bold">{score}</Text>
                </VStack>
                <VStack>
                  <Text fontSize="sm" color="red.600">Wrong</Text>
                  <Text fontSize="lg" fontWeight="bold">{wrongAnswers}</Text>
                </VStack>
                <VStack>
                  <Text fontSize="sm" color="blue.600">Hints Used</Text>
                  <Text fontSize="lg" fontWeight="bold">{hintsUsed}</Text>
                </VStack>
              </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter justifyContent="center">
            <HStack>
              <Button colorScheme="green" onClick={resetGame}>
                Play Again
              </Button>
              <Button variant="outline" onClick={() => { resetGame(); onStatsOpen(); }}>
                View Stats
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  // Main Game Screen
  if (current >= gameQuestions.length) {
    endGame();
    return null;
  }

  return (
    <Box p={6} maxW="xl" mx="auto" bg="gradient(to-br, green.50, blue.50)" borderRadius="xl" boxShadow="xl">
      <VStack spacing={6}>
        {/* Header with stats */}
        <Flex justify="space-between" align="center" w="full">
          <VStack spacing={1}>
            <Text fontSize="sm" color="gray.600">Score</Text>
            <Badge colorScheme="green" fontSize="lg" px={3} py={1}>
              {score}
            </Badge>
          </VStack>
          
          {gameMode === "Timed" && (
            <VStack spacing={1}>
              <Text fontSize="sm" color="gray.600">Time Left</Text>
              <Badge colorScheme={timeLeft <= 10 ? "red" : "blue"} fontSize="lg" px={3} py={1}>
                {timeLeft}s
              </Badge>
            </VStack>
          )}
          
          <VStack spacing={1}>
            <Text fontSize="sm" color="gray.600">Streak</Text>
            <Badge colorScheme={getProgressColor()} fontSize="lg" px={3} py={1}>
              🔥 {streak}
            </Badge>
          </VStack>
        </Flex>

        {/* Progress Bar */}
        <Box w="full">
          <Flex justify="space-between" mb={2}>
            <Text fontSize="sm" color="gray.600">
              Question {current + 1} of {gameQuestions.length}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {Math.round(((current) / gameQuestions.length) * 100)}% Complete
            </Text>
          </Flex>
          <Progress 
            value={((current) / gameQuestions.length) * 100} 
            colorScheme={getProgressColor()}
            size="lg" 
            borderRadius="full"
          />
        </Box>

        <Heading size="lg" textAlign="center" color="green.700">
          🌿 Biotic vs Abiotic 🪨
        </Heading>

        <Text textAlign="center" color="gray.700" fontSize="md">
          Is this item living (Biotic) or non-living (Abiotic)?
        </Text>

        {/* Question */}
        <Box 
          p={8} 
          bg="white" 
          borderRadius="xl" 
          boxShadow="lg"
          border="2px solid"
          borderColor="green.200"
          textAlign="center"
          w="full"
        >
          <Text fontSize="4xl" mb={4}>
            {gameQuestions[current]?.label}
          </Text>
          <Badge colorScheme="blue" fontSize="sm">
            {gameQuestions[current]?.difficulty}
          </Badge>
        </Box>

        {/* Hint */}
        {showHint && (
          <Box 
            p={4} 
            bg="yellow.100" 
            borderRadius="lg"
            border="1px solid"
            borderColor="yellow.300"
            w="full"
          >
            <Text fontSize="sm" fontStyle="italic" textAlign="center">
              💡 Hint: {gameQuestions[current]?.hint}
            </Text>
          </Box>
        )}

        {/* Answer Buttons */}
        <Grid templateColumns="repeat(2, 1fr)" gap={4} w="full">
          <GridItem>
            <Button
              colorScheme="green"
              size="lg"
              onClick={() => handleGuess("Biotic")}
              leftIcon={<CheckIcon />}
              w="full"
              h="60px"
              fontSize="lg"
              isDisabled={!!feedback}
            >
              🌱 Biotic
              <Text fontSize="xs" display="block">
                (Living)
              </Text>
            </Button>
          </GridItem>
          <GridItem>
            <Button
              colorScheme="blue"
              size="lg"
              onClick={() => handleGuess("Abiotic")}
              leftIcon={<CloseIcon />}
              w="full"
              h="60px"
              fontSize="lg"
              isDisabled={!!feedback}
            >
              🪨 Abiotic
              <Text fontSize="xs" display="block">
                (Non-living)
              </Text>
            </Button>
          </GridItem>
        </Grid>

        {/* Feedback */}
        {feedback && (
          <Box 
            p={4} 
            bg={feedback.includes("Correct") ? "green.100" : "red.100"}
            color={feedback.includes("Correct") ? "green.800" : "red.800"}
            borderRadius="lg"
            textAlign="center"
            w="full"
            fontWeight="bold"
            fontSize="lg"
          >
            {feedback.includes("Correct") ? "✅" : "❌"} {feedback}
          </Box>
        )}

        {/* Action Buttons */}
        <HStack spacing={4} w="full">
          {!showHint && !feedback && (
            <Button
              variant="outline"
              colorScheme="orange"
              onClick={useHint}
              leftIcon={<Text>💡</Text>}
              size="sm"
            >
              Need a Hint?
            </Button>
          )}
          <Button
            variant="outline"
            colorScheme="red"
            onClick={resetGame}
            size="sm"
          >
            End Game
          </Button>
        </HStack>
      </VStack>

      {/* Stats Modal */}
      <Modal isOpen={isStatsOpen} onClose={onStatsClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">📊 Game Statistics</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <StatGroup w="full">
                <Stat textAlign="center">
                  <StatLabel>Current Score</StatLabel>
                  <StatNumber>{score}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel>Current Streak</StatLabel>
                  <StatNumber>{streak}</StatNumber>
                </Stat>
              </StatGroup>
              <StatGroup w="full">
                <Stat textAlign="center">
                  <StatLabel>Best Streak</StatLabel>
                  <StatNumber>{bestStreak}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel>Hints Used</StatLabel>
                  <StatNumber>{hintsUsed}</StatNumber>
                </Stat>
              </StatGroup>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onStatsClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
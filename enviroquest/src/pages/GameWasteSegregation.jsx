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
  Alert, 
  AlertIcon, 
  Container,
  Card,
  CardBody,
  Flex,
  Icon,
  useColorModeValue,
  Circle,
  Divider
} from "@chakra-ui/react";
import { CheckIcon, CloseIcon, RepeatIcon } from "@chakra-ui/icons";

const wasteItems = [
  { name: "Banana Peel", type: "Biodegradable", icon: "🍌" },
  { name: "Plastic Bottle", type: "Non-Biodegradable", icon: "🍶" },
  { name: "Paper", type: "Biodegradable", icon: "📄" },
  { name: "Metal Can", type: "Non-Biodegradable", icon: "🥤" },
  { name: "Apple Core", type: "Biodegradable", icon: "🍎" },
  { name: "Glass Bottle", type: "Non-Biodegradable", icon: "🍾" },
  { name: "Cardboard Box", type: "Biodegradable", icon: "📦" },
  { name: "Plastic Bag", type: "Non-Biodegradable", icon: "🛍️" },
  { name: "Orange Peel", type: "Biodegradable", icon: "🍊" },
  { name: "Aluminum Foil", type: "Non-Biodegradable", icon: "🧻" },
  { name: "Newspaper", type: "Biodegradable", icon: "📰" },
  { name: "Styrofoam Cup", type: "Non-Biodegradable", icon: "🥤" },
  { name: "Vegetable Scraps", type: "Biodegradable", icon: "🥬" },
  { name: "Rubber Tire", type: "Non-Biodegradable", icon: "🛞" },
  { name: "Cotton T-shirt", type: "Biodegradable", icon: "👕" },
  { name: "Plastic Toys", type: "Non-Biodegradable", icon: "🧸" },
  { name: "Tea Bag", type: "Biodegradable", icon: "🫖" },
  { name: "Electronic Circuit", type: "Non-Biodegradable", icon: "🔌" },
  { name: "Wooden Stick", type: "Biodegradable", icon: "🪵" },
  { name: "Ceramic Plate", type: "Non-Biodegradable", icon: "🍽️" },
  { name: "Bread Crumbs", type: "Biodegradable", icon: "🍞" },
  { name: "Nylon Rope", type: "Non-Biodegradable", icon: "🪢" },
  { name: "Eggshells", type: "Biodegradable", icon: "🥚" },
  { name: "Battery", type: "Non-Biodegradable", icon: "🔋" },
  { name: "Leather Belt", type: "Biodegradable", icon: "👔" }
];

// Shuffle function to randomize questions
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function GameWasteSegregation() {
  const [gameItems, setGameItems] = useState([]);
  const [score, setScore] = useState(0);
  const [current, setCurrent] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const bgColor = useColorModeValue("green.50", "green.900");
  const cardBg = useColorModeValue("white", "gray.700");

  useEffect(() => {
    if (gameStarted && !gameItems.length) {
      setGameItems(shuffleArray(wasteItems).slice(0, 15)); // Random 15 items
    }
  }, [gameStarted, gameItems.length]);

  function startGame() {
    setGameStarted(true);
    setGameItems(shuffleArray(wasteItems).slice(0, 15));
    setScore(0);
    setCurrent(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setStreak(0);
    setGameComplete(false);
    setFeedback("");
    setShowFeedback(false);
  }

  function handleSort(type) {
    const isCorrect = gameItems[current].type === type;
    
    if (isCorrect) {
      setScore(s => s + 10);
      setCorrectAnswers(c => c + 1);
      setStreak(s => {
        const newStreak = s + 1;
        if (newStreak > bestStreak) {
          setBestStreak(newStreak);
        }
        return newStreak;
      });
      setFeedback("Correct! Well done! 🎉");
    } else {
      setWrongAnswers(w => w + 1);
      setStreak(0);
      setFeedback(`Oops! ${gameItems[current].name} is ${gameItems[current].type}. 🤔`);
    }
    
    setShowFeedback(true);

    setTimeout(() => {
      if (current + 1 >= gameItems.length) {
        setGameComplete(true);
      } else {
        setCurrent(c => c + 1);
      }
      setShowFeedback(false);
      setFeedback("");
    }, 1500);
  }

  function resetGame() {
    setGameStarted(false);
    setGameComplete(false);
    setGameItems([]);
    setScore(0);
    setCurrent(0);
    setCorrectAnswers(0);
    setWrongAnswers(0);
    setStreak(0);
    setFeedback("");
    setShowFeedback(false);
  }

  if (!gameStarted) {
    return (
      <Container maxW="lg" py={8}>
        <Card bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8} textAlign="center">
            <Text fontSize="6xl" mb={4}>♻️</Text>
            <Heading size="xl" mb={4} color="green.600">
              Waste Segregation Game
            </Heading>
            <Text fontSize="lg" mb={6} color="gray.600">
              Test your knowledge of biodegradable and non-biodegradable waste!
              Sort items correctly to earn points and build your streak.
            </Text>
            <VStack spacing={4} mb={6}>
              <HStack spacing={8}>
                <VStack>
                  <Circle size="60px" bg="green.100" color="green.600">
                    <Text fontSize="xl">🌱</Text>
                  </Circle>
                  <Text fontWeight="bold" color="green.600">Biodegradable</Text>
                </VStack>
                <VStack>
                  <Circle size="60px" bg="blue.100" color="blue.600">
                    <Text fontSize="xl">🏭</Text>
                  </Circle>
                  <Text fontWeight="bold" color="blue.600">Non-Biodegradable</Text>
                </VStack>
              </HStack>
            </VStack>
            <Button 
              size="lg" 
              colorScheme="green" 
              onClick={startGame}
              px={8}
              py={6}
              fontSize="xl"
              borderRadius="xl"
            >
              Start Game 🎮
            </Button>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (gameComplete) {
    const percentage = Math.round((correctAnswers / gameItems.length) * 100);
    const performance = percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good Job!" : "Keep Practicing!";
    const performanceColor = percentage >= 80 ? "green" : percentage >= 60 ? "yellow" : "red";

    return (
      <Container maxW="lg" py={8}>
        <Card bg={cardBg} shadow="xl" borderRadius="2xl">
          <CardBody p={8} textAlign="center">
            <Text fontSize="6xl" mb={4}>
              {percentage >= 80 ? "🏆" : percentage >= 60 ? "👏" : "💪"}
            </Text>
            <Heading size="xl" mb={4} color={`${performanceColor}.600`}>
              {performance}
            </Heading>
            
            <VStack spacing={4} mb={6}>
              <Text fontSize="3xl" fontWeight="bold" color="green.600">
                Final Score: {score} points
              </Text>
              
              <Divider />
              
              <HStack spacing={8} justify="center">
                <VStack>
                  <Circle size="60px" bg="green.100">
                    <Icon as={CheckIcon} color="green.600" boxSize={6} />
                  </Circle>
                  <Text fontSize="xl" fontWeight="bold">{correctAnswers}</Text>
                  <Text color="gray.600">Correct</Text>
                </VStack>
                
                <VStack>
                  <Circle size="60px" bg="red.100">
                    <Icon as={CloseIcon} color="red.600" boxSize={6} />
                  </Circle>
                  <Text fontSize="xl" fontWeight="bold">{wrongAnswers}</Text>
                  <Text color="gray.600">Wrong</Text>
                </VStack>
                
                <VStack>
                  <Circle size="60px" bg="purple.100">
                    <Text fontSize="xl" color="purple.600">🔥</Text>
                  </Circle>
                  <Text fontSize="xl" fontWeight="bold">{bestStreak}</Text>
                  <Text color="gray.600">Best Streak</Text>
                </VStack>
              </HStack>
              
              <Text fontSize="lg" color="gray.600">
                Accuracy: {percentage}%
              </Text>
            </VStack>

            <HStack spacing={4} justify="center">
              <Button 
                leftIcon={<RepeatIcon />} 
                colorScheme="green" 
                onClick={startGame}
                size="lg"
                px={6}
              >
                Play Again
              </Button>
              <Button 
                variant="outline" 
                colorScheme="gray" 
                onClick={resetGame}
                size="lg"
                px={6}
              >
                Main Menu
              </Button>
            </HStack>
          </CardBody>
        </Card>
      </Container>
    );
  }

  const progress = ((current + 1) / gameItems.length) * 100;

  return (
    <Container maxW="lg" py={8}>
      <VStack spacing={6}>
        {/* Header Stats */}
        <Card w="full" bg={cardBg} shadow="lg" borderRadius="xl">
          <CardBody>
            <Flex justify="space-between" align="center" mb={4}>
              <VStack spacing={1} align="start">
                <Text fontSize="sm" color="gray.600">Score</Text>
                <Text fontSize="xl" fontWeight="bold" color="green.600">{score}</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontSize="sm" color="gray.600">Question</Text>
                <Text fontSize="xl" fontWeight="bold">{current + 1}/{gameItems.length}</Text>
              </VStack>
              <VStack spacing={1} align="end">
                <Text fontSize="sm" color="gray.600">Streak 🔥</Text>
                <Text fontSize="xl" fontWeight="bold" color="purple.600">{streak}</Text>
              </VStack>
            </Flex>
            <Progress 
              value={progress} 
              colorScheme="green" 
              size="lg" 
              borderRadius="full"
              bg="gray.100"
            />
          </CardBody>
        </Card>

        {/* Main Game Card */}
        <Card w="full" bg={cardBg} shadow="xl" borderRadius="2xl" minH="400px">
          <CardBody p={8}>
            <VStack spacing={6} justify="center" h="full">
              <Heading size="lg" textAlign="center" color="gray.700" mb={2}>
                How should this be disposed?
              </Heading>
              
              <VStack spacing={4}>
                <Text fontSize="4xl" role="img" aria-label={gameItems[current]?.name}>
                  {gameItems[current]?.icon}
                </Text>
                <Badge 
                  fontSize="2xl" 
                  px={6} 
                  py={3} 
                  borderRadius="xl"
                  colorScheme="gray"
                  variant="subtle"
                >
                  {gameItems[current]?.name}
                </Badge>
              </VStack>

              {showFeedback ? (
                <Alert 
                  status={feedback.includes("Correct") ? "success" : "error"}
                  borderRadius="xl"
                  fontSize="lg"
                  py={4}
                >
                  <AlertIcon boxSize={6} />
                  <Text fontWeight="bold">{feedback}</Text>
                </Alert>
              ) : (
                <HStack spacing={4} pt={4}>
                  <Button 
                    leftIcon={<Text fontSize="xl">🌱</Text>}
                    colorScheme="green" 
                    onClick={() => handleSort("Biodegradable")}
                    size="lg"
                    px={8}
                    py={6}
                    fontSize="lg"
                    borderRadius="xl"
                    _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                    transition="all 0.2s"
                  >
                    Biodegradable
                  </Button>
                  <Button 
                    leftIcon={<Text fontSize="xl">🏭</Text>}
                    colorScheme="blue" 
                    onClick={() => handleSort("Non-Biodegradable")}
                    size="lg"
                    px={8}
                    py={6}
                    fontSize="lg"
                    borderRadius="xl"
                    _hover={{ transform: "translateY(-2px)", shadow: "lg" }}
                    transition="all 0.2s"
                  >
                    Non-Biodegradable
                  </Button>
                </HStack>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <HStack spacing={4} w="full">
          <Card flex={1} bg="green.50" borderColor="green.200" borderWidth={1}>
            <CardBody textAlign="center" py={3}>
              <Text fontSize="sm" color="green.600">Correct</Text>
              <Text fontSize="xl" fontWeight="bold" color="green.700">{correctAnswers}</Text>
            </CardBody>
          </Card>
          <Card flex={1} bg="red.50" borderColor="red.200" borderWidth={1}>
            <CardBody textAlign="center" py={3}>
              <Text fontSize="sm" color="red.600">Wrong</Text>
              <Text fontSize="xl" fontWeight="bold" color="red.700">{wrongAnswers}</Text>
            </CardBody>
          </Card>
          <Card flex={1} bg="purple.50" borderColor="purple.200" borderWidth={1}>
            <CardBody textAlign="center" py={3}>
              <Text fontSize="sm" color="purple.600">Best</Text>
              <Text fontSize="xl" fontWeight="bold" color="purple.700">{bestStreak}</Text>
            </CardBody>
          </Card>
        </HStack>
      </VStack>
    </Container>
  );
}
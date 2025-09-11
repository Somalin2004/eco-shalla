import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  Progress,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Grid,
  GridItem,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Flex,
  Image,
  Icon,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

import { WarningIcon } from "@chakra-ui/icons";

const plantGrowthStages = [
  { stage: 0, name: "Seed", icon: "🌱", size: "60px", color: "brown.200" },
  { stage: 1, name: "Sprout", icon: "🌱", size: "80px", color: "green.200" },
  { stage: 2, name: "Seedling", icon: "🌿", size: "100px", color: "green.300" },
  { stage: 3, name: "Young Plant", icon: "🪴", size: "120px", color: "green.400" },
  { stage: 4, name: "Mature Plant", icon: "🌳", size: "140px", color: "green.500" },
  { stage: 5, name: "Flowering Plant", icon: "🌺", size: "160px", color: "pink.400" }
];

const weatherConditions = ["☀️ Sunny", "⛅ Cloudy", "🌧️ Rainy", "❄️ Cold"];
const seasons = ["🌸 Spring", "☀️ Summer", "🍂 Autumn", "❄️ Winter"];

export default function EnhancedPlantCareGame() {
  const [plantStage, setPlantStage] = useState(0);
  const [waterLevel, setWaterLevel] = useState(50);
  const [sunlightLevel, setSunlightLevel] = useState(50);
  const [soilQuality, setSoilQuality] = useState(50);
  const [plantHealth, setPlantHealth] = useState(75);
  const [hasWeeds, setHasWeeds] = useState(false);
  const [hasPests, setHasPests] = useState(false);
  const [needsFertilizer, setNeedsFertilizer] = useState(false);
  const [gameDay, setGameDay] = useState(1);
  const [currentWeather, setCurrentWeather] = useState(0);
  const [currentSeason, setCurrentSeason] = useState(0);
  const [score, setScore] = useState(0);
  const [achievements, setAchievements] = useState([]);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [autoMode, setAutoMode] = useState(false);
  const [plantName, setPlantName] = useState("My Plant");
  const [careHistory, setCareHistory] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [showCareGuide, setShowCareGuide] = useState(false);

  const { isOpen: isStatsOpen, onOpen: onStatsOpen, onClose: onStatsClose } = useDisclosure();
  const { isOpen: isAchievementOpen, onOpen: onAchievementOpen, onClose: onAchievementClose } = useDisclosure();
  const { isOpen: isGameOverOpen, onOpen: onGameOverOpen, onClose: onGameOverClose } = useDisclosure();
  const cancelRef = useRef();
  
  const toast = useToast();

  // Game loop - updates plant status every few seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updatePlantStatus();
      if (Math.random() < 0.3) generateRandomEvent();
      setGameDay(day => day + 1);
      
      // Change weather and season
      if (gameDay % 7 === 0) {
        setCurrentWeather(Math.floor(Math.random() * weatherConditions.length));
      }
      if (gameDay % 30 === 0) {
        setCurrentSeason((prev) => (prev + 1) % seasons.length);
      }
    }, 3000 / gameSpeed);

    return () => clearInterval(interval);
  }, [gameSpeed, waterLevel, sunlightLevel, soilQuality]);

  // Monitor plant health for game over
  useEffect(() => {
    if (plantHealth <= 0 && !isGameOver) {
      setIsGameOver(true);
      onGameOverOpen();
    }
  }, [plantHealth, isGameOver, onGameOverOpen]);

  const updatePlantStatus = () => {
    // Decrease levels over time
    setWaterLevel(w => Math.max(0, w - (2 + (currentWeather === 0 ? 1 : 0)))); // More water loss in sunny weather
    setSunlightLevel(s => Math.max(0, s - (1 + (currentWeather === 1 ? 1 : 0)))); // Less sun in cloudy weather
    setSoilQuality(sq => Math.max(0, sq - 0.5));
    
    // Calculate plant health based on care levels
    const avgCare = (waterLevel + sunlightLevel + soilQuality) / 3;
    let healthChange = 0;
    
    if (avgCare > 70) healthChange = 2;
    else if (avgCare > 40) healthChange = 0;
    else healthChange = -3;
    
    // Penalties for problems
    if (hasWeeds) healthChange -= 2;
    if (hasPests) healthChange -= 3;
    if (needsFertilizer && soilQuality < 30) healthChange -= 1;
    
    // Weather effects
    if (currentWeather === 2 && waterLevel < 70) healthChange += 1; // Rain helps with water
    if (currentWeather === 3) healthChange -= 1; // Cold weather is stressful
    
    setPlantHealth(h => Math.max(0, Math.min(100, h + healthChange)));
    
    // Growth logic
    if (plantHealth > 80 && avgCare > 80 && plantStage < plantGrowthStages.length - 1) {
      if (Math.random() < 0.3) {
        growPlant();
      }
    }
    
    // Score calculation
    setScore(s => s + Math.max(0, Math.floor(plantHealth / 10) + plantStage * 5));
  };

  const generateRandomEvent = () => {
    const events = [
      () => setHasWeeds(Math.random() < 0.4),
      () => setHasPests(Math.random() < 0.3),
      () => setNeedsFertilizer(Math.random() < 0.5),
    ];
    
    events[Math.floor(Math.random() * events.length)]();
  };

  const growPlant = () => {
    setPlantStage(stage => {
      const newStage = stage + 1;
      
      toast({
        title: "🌱 Plant Growth!",
        description: `Your plant grew to ${plantGrowthStages[newStage]?.name}!`,
        status: "success",
        duration: 3000,
      });
      
      checkAchievements(newStage);
      return newStage;
    });
  };

  const checkAchievements = (stage) => {
    const newAchievements = [];
    
    if (stage === 1 && !achievements.includes("First Sprout")) {
      newAchievements.push("First Sprout");
    }
    if (stage === 3 && !achievements.includes("Green Thumb")) {
      newAchievements.push("Green Thumb");
    }
    if (stage === 5 && !achievements.includes("Master Gardener")) {
      newAchievements.push("Master Gardener");
    }
    if (plantHealth === 100 && !achievements.includes("Perfect Health")) {
      newAchievements.push("Perfect Health");
    }
    if (gameDay >= 50 && !achievements.includes("Dedicated Caretaker")) {
      newAchievements.push("Dedicated Caretaker");
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
      onAchievementOpen();
    }
  };

  const performCareAction = (action, amount, cost = 0) => {
    if (score < cost) {
      toast({
        title: "Not enough points!",
        description: `You need ${cost} points for this action.`,
        status: "error",
        duration: 2000,
      });
      return;
    }

    setScore(s => s - cost);
    
    const careAction = {
      day: gameDay,
      action,
      amount,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setCareHistory(history => [careAction, ...history.slice(0, 9)]);
    
    switch (action) {
      case "water":
        setWaterLevel(w => Math.min(100, w + amount));
        toast({
          title: "💧 Plant Watered!",
          description: `Water level increased by ${amount}`,
          status: "info",
          duration: 1500,
        });
        break;
      case "sunlight":
        setSunlightLevel(s => Math.min(100, s + amount));
        toast({
          title: "☀️ Sunlight Added!",
          description: `Sunlight level increased by ${amount}`,
          status: "info",
          duration: 1500,
        });
        break;
      case "fertilize":
        setSoilQuality(sq => Math.min(100, sq + amount));
        setNeedsFertilizer(false);
        toast({
          title: "🌿 Fertilizer Applied!",
          description: `Soil quality improved by ${amount}`,
          status: "info",
          duration: 1500,
        });
        break;
      case "weeds":
        setHasWeeds(false);
        setSoilQuality(sq => Math.min(100, sq + 10));
        toast({
          title: "🌾 Weeds Removed!",
          description: "Plant can now grow better!",
          status: "success",
          duration: 1500,
        });
        break;
      case "pest":
        setHasPests(false);
        setPlantHealth(h => Math.min(100, h + 15));
        toast({
          title: "🐛 Pests Eliminated!",
          description: "Plant health improved!",
          status: "success",
          duration: 1500,
        });
        break;
    }
  };

  const resetGame = () => {
    setPlantStage(0);
    setWaterLevel(50);
    setSunlightLevel(50);
    setSoilQuality(50);
    setPlantHealth(75);
    setHasWeeds(false);
    setHasPests(false);
    setNeedsFertilizer(false);
    setGameDay(1);
    setScore(0);
    setCareHistory([]);
    setIsGameOver(false);
    onGameOverClose();
  };

  const getHealthColor = () => {
    if (plantHealth >= 80) return "green";
    if (plantHealth >= 60) return "yellow";
    if (plantHealth >= 40) return "orange";
    return "red";
  };

  const getCurrentPlant = () => plantGrowthStages[Math.min(plantStage, plantGrowthStages.length - 1)];

  return (
    <Box 
      p={6} 
      maxW="6xl" 
      mx="auto" 
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      minH="100vh"
    >
      <VStack spacing={6}>
        {/* Header */}
        <Box 
          w="full" 
          bg="white" 
          p={6} 
          borderRadius="2xl" 
          boxShadow="xl"
          textAlign="center"
        >
          <Heading size="xl" color="green.600" mb={2}>
            🌱 Plant Care Simulator
          </Heading>
          <Text color="gray.600" fontSize="lg">
            Day {gameDay} • {seasons[currentSeason]} • {weatherConditions[currentWeather]}
          </Text>
        </Box>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr 1fr" }} gap={6} w="full">
          {/* Plant Display */}
          <GridItem colSpan={{ base: 1, lg: 2 }}>
            <Box 
              bg="white" 
              p={8} 
              borderRadius="2xl" 
              boxShadow="xl"
              textAlign="center"
              position="relative"
              minH="400px"
            >
              {/* Weather Effect */}
              <Box position="absolute" top={4} right={4}>
                <Text fontSize="3xl">{weatherConditions[currentWeather].split(' ')[0]}</Text>
              </Box>

              {/* Plant */}
              <VStack spacing={4}>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {plantName} - {getCurrentPlant().name}
                </Text>
                
                <Box
                  fontSize={getCurrentPlant().size}
                  transition="all 0.5s ease"
                  transform={plantHealth > 80 ? "scale(1.1)" : "scale(1)"}
                  filter={plantHealth < 40 ? "grayscale(50%)" : "none"}
                >
                  {getCurrentPlant().icon}
                </Box>

                {/* Plant Issues */}
                <HStack spacing={2}>
                  {hasWeeds && (
                    <Badge colorScheme="yellow" fontSize="sm">
                      🌾 Weedy
                    </Badge>
                  )}
                  {hasPests && (
                    <Badge colorScheme="red" fontSize="sm">
                      🐛 Pests
                    </Badge>
                  )}
                  {needsFertilizer && (
                    <Badge colorScheme="orange" fontSize="sm">
                      🌿 Needs Fertilizer
                    </Badge>
                  )}
                </HStack>

                {/* Health Bar */}
                <Box w="full" maxW="300px">
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm" fontWeight="semibold">Plant Health</Text>
                    <Text fontSize="sm" color={`${getHealthColor()}.500`}>
                      {plantHealth}%
                    </Text>
                  </Flex>
                  <Progress
                    value={plantHealth}
                    colorScheme={getHealthColor()}
                    size="lg"
                    borderRadius="full"
                    bg="gray.200"
                  />
                </Box>
              </VStack>
            </Box>
          </GridItem>

          {/* Stats Panel */}
          <GridItem>
            <VStack spacing={4}>
              {/* Score */}
              <Box bg="white" p={4} borderRadius="xl" boxShadow="lg" w="full">
                <Stat textAlign="center">
                  <StatLabel>Score</StatLabel>
                  <StatNumber color="purple.500">{score}</StatNumber>
                </Stat>
              </Box>

              {/* Care Levels */}
              <Box bg="white" p={4} borderRadius="xl" boxShadow="lg" w="full">
                <VStack spacing={3}>
                  <Text fontWeight="bold" color="gray.700">Care Levels</Text>
                  
                  <Box w="full">
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">💧 Water</Text>
                      <Text fontSize="sm">{waterLevel}%</Text>
                    </Flex>
                    <Progress value={waterLevel} colorScheme="blue" size="sm" />
                  </Box>
                  
                  <Box w="full">
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">☀️ Sunlight</Text>
                      <Text fontSize="sm">{sunlightLevel}%</Text>
                    </Flex>
                    <Progress value={sunlightLevel} colorScheme="yellow" size="sm" />
                  </Box>
                  
                  <Box w="full">
                    <Flex justify="space-between" mb={1}>
                      <Text fontSize="sm">🌱 Soil Quality</Text>
                      <Text fontSize="sm">{soilQuality}%</Text>
                    </Flex>
                    <Progress value={soilQuality} colorScheme="green" size="sm" />
                  </Box>
                </VStack>
              </Box>

              {/* Quick Stats */}
              <Box bg="white" p={4} borderRadius="xl" boxShadow="lg" w="full">
                <StatGroup size="sm">
                  <Stat textAlign="center">
                    <StatLabel>Stage</StatLabel>
                    <StatNumber fontSize="lg">{plantStage}</StatNumber>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>Achievements</StatLabel>
                    <StatNumber fontSize="lg">{achievements.length}</StatNumber>
                  </Stat>
                </StatGroup>
              </Box>
            </VStack>
          </GridItem>
        </Grid>

        {/* Care Actions */}
        <Box bg="white" p={6} borderRadius="2xl" boxShadow="xl" w="full">
          <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center" color="gray.700">
            Care Actions
          </Text>
          
          <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)", lg: "repeat(5, 1fr)" }} gap={4}>
            <Tooltip label="Increase water level by 30" placement="top">
              <Button
                colorScheme="blue"
                size="lg"
                onClick={() => performCareAction("water", 30)}
                leftIcon={<Text fontSize="xl">💧</Text>}
                h="80px"
                flexDirection="column"
              >
                Water
                <Text fontSize="xs">Free</Text>
              </Button>
            </Tooltip>

            <Tooltip label="Increase sunlight by 25" placement="top">
              <Button
                colorScheme="yellow"
                size="lg"
                onClick={() => performCareAction("sunlight", 25)}
                leftIcon={<Text fontSize="xl">☀️</Text>}
                h="80px"
                flexDirection="column"
              >
                Sunlight
                <Text fontSize="xs">Free</Text>
              </Button>
            </Tooltip>

            <Tooltip label="Improve soil quality by 40" placement="top">
              <Button
                colorScheme="green"
                size="lg"
                onClick={() => performCareAction("fertilize", 40, 10)}
                leftIcon={<Text fontSize="xl">🌿</Text>}
                h="80px"
                flexDirection="column"
                isDisabled={score < 10}
              >
                Fertilize
                <Text fontSize="xs">10 pts</Text>
              </Button>
            </Tooltip>

            <Tooltip label="Remove weeds to improve growth" placement="top">
              <Button
                colorScheme="orange"
                size="lg"
                onClick={() => performCareAction("weeds", 0, 5)}
                leftIcon={<Text fontSize="xl">🌾</Text>}
                h="80px"
                flexDirection="column"
                isDisabled={!hasWeeds || score < 5}
                opacity={hasWeeds ? 1 : 0.5}
              >
                Remove Weeds
                <Text fontSize="xs">5 pts</Text>
              </Button>
            </Tooltip>

            <Tooltip label="Eliminate pests to restore health" placement="top">
              <Button
                colorScheme="red"
                size="lg"
                onClick={() => performCareAction("pest", 0, 15)}
                leftIcon={<Text fontSize="xl">🐛</Text>}
                h="80px"
                flexDirection="column"
                isDisabled={!hasPests || score < 15}
                opacity={hasPests ? 1 : 0.5}
              >
                Pest Control
                <Text fontSize="xs">15 pts</Text>
              </Button>
            </Tooltip>
          </Grid>
        </Box>

        {/* Control Buttons */}
        <HStack spacing={4} flexWrap="wrap" justify="center">
          <Button colorScheme="purple" onClick={onStatsOpen} leftIcon={<Text>📊</Text>}>
            Statistics
          </Button>
          <Button colorScheme="teal" onClick={() => setShowCareGuide(!showCareGuide)} leftIcon={<Text>📚</Text>}>
            Care Guide
          </Button>
          <Button 
            colorScheme="cyan" 
            onClick={() => setGameSpeed(gameSpeed === 1 ? 2 : 1)}
            leftIcon={<Text>{gameSpeed === 1 ? "⏩" : "⏸️"}</Text>}
          >
            {gameSpeed === 1 ? "Speed Up" : "Normal Speed"}
          </Button>
          <Button colorScheme="gray" onClick={resetGame} leftIcon={<Text>🔄</Text>}>
            New Plant
          </Button>
        </HStack>

        {/* Care Guide */}
        {showCareGuide && (
          <Box bg="white" p={6} borderRadius="xl" boxShadow="lg" w="full">
            <Text fontSize="lg" fontWeight="bold" mb={4} color="gray.700">
              🌱 Plant Care Guide
            </Text>
            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
              <Box>
                <Text fontWeight="semibold" color="blue.600" mb={2}>💧 Watering Tips:</Text>
                <Text fontSize="sm" color="gray.600">
                  • Water regularly to keep levels above 40%<br/>
                  • Sunny weather increases water consumption<br/>
                  • Over-watering is better than under-watering
                </Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color="yellow.600" mb={2}>☀️ Sunlight Tips:</Text>
                <Text fontSize="sm" color="gray.600">
                  • Provide consistent sunlight exposure<br/>
                  • Cloudy weather reduces natural sunlight<br/>
                  • Use grow lights when needed
                </Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color="green.600" mb={2}>🌱 Soil Care:</Text>
                <Text fontSize="sm" color="gray.600">
                  • Fertilize when soil quality drops below 30%<br/>
                  • Remove weeds immediately when they appear<br/>
                  • Good soil = faster growth
                </Text>
              </Box>
              <Box>
                <Text fontWeight="semibold" color="red.600" mb={2}>🐛 Problem Prevention:</Text>
                <Text fontSize="sm" color="gray.600">
                  • Monitor for pests regularly<br/>
                  • Act quickly when problems arise<br/>
                  • Prevention is cheaper than treatment
                </Text>
              </Box>
            </Grid>
          </Box>
        )}
      </VStack>

      {/* Statistics Modal */}
      <Modal isOpen={isStatsOpen} onClose={onStatsClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">📊 Plant Statistics</ModalHeader>
          <ModalBody>
            <VStack spacing={6}>
              <StatGroup w="full">
                <Stat textAlign="center">
                  <StatLabel>Current Score</StatLabel>
                  <StatNumber>{score}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel>Days Survived</StatLabel>
                  <StatNumber>{gameDay}</StatNumber>
                </Stat>
                <Stat textAlign="center">
                  <StatLabel>Plant Stage</StatLabel>
                  <StatNumber>{getCurrentPlant().name}</StatNumber>
                </Stat>
              </StatGroup>

              <Box w="full">
                <Text fontWeight="bold" mb={3}>🏆 Achievements ({achievements.length})</Text>
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  {[
                    "First Sprout", "Green Thumb", "Master Gardener", 
                    "Perfect Health", "Dedicated Caretaker"
                  ].map(achievement => (
                    <Badge
                      key={achievement}
                      colorScheme={achievements.includes(achievement) ? "green" : "gray"}
                      p={2}
                      textAlign="center"
                    >
                      {achievements.includes(achievement) ? "✓" : "○"} {achievement}
                    </Badge>
                  ))}
                </Grid>
              </Box>

              <Box w="full">
                <Text fontWeight="bold" mb={3}>📋 Recent Care History</Text>
                <VStack spacing={2} maxH="200px" overflowY="auto">
                  {careHistory.map((care, index) => (
                    <Box key={index} p={2} bg="gray.50" borderRadius="md" w="full">
                      <Text fontSize="sm">
                        Day {care.day}: {care.action} (+{care.amount}) at {care.timestamp}
                      </Text>
                    </Box>
                  ))}
                  {careHistory.length === 0 && (
                    <Text fontSize="sm" color="gray.500">No care actions yet</Text>
                  )}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onStatsClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Game Over Modal */}
      <AlertDialog
        isOpen={isGameOverOpen}
        leastDestructiveRef={cancelRef}
        onClose={onGameOverClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              <HStack>
                <WarningIcon color="red.500" />
                <Text>Plant Died! 😢</Text>
              </HStack>
            </AlertDialogHeader>

            <AlertDialogBody>
              <VStack spacing={4}>
                <Text>Your plant couldn't survive! Here's what happened:</Text>
                <StatGroup w="full">
                  <Stat textAlign="center">
                    <StatLabel>Days Survived</StatLabel>
                    <StatNumber>{gameDay}</StatNumber>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>Final Score</StatLabel>
                    <StatNumber>{score}</StatNumber>
                  </Stat>
                </StatGroup>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Try to maintain better care levels next time! Keep water, sunlight, and soil quality above 40%.
                </Text>
              </VStack>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onGameOverClose}>
                View Stats
              </Button>
              <Button colorScheme="green" onClick={resetGame} ml={3}>
                Try Again
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Achievement Modal */}
      <Modal isOpen={isAchievementOpen} onClose={onAchievementClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign="center">🏆 Achievement Unlocked!</ModalHeader>
          <ModalBody textAlign="center">
            <VStack spacing={4}>
              <Text fontSize="4xl">🎉</Text>
              <Text fontSize="xl" fontWeight="bold">
                {achievements[achievements.length - 1]}
              </Text>
              <Text color="gray.600">
                Great job taking care of your plant!
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter justifyContent="center">
            <Button colorScheme="green" onClick={onAchievementClose}>
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
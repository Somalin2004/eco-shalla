import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Progress,
  Badge,
  Container,
  Card,
  CardBody,
  Flex,
  Circle,
  Divider,
  SimpleGrid,
  Icon
} from '@chakra-ui/react';
import { TimeIcon, StarIcon, RepeatIcon } from '@chakra-ui/icons';

const trashTypes = [
  { emoji: '🥤', name: 'Plastic Bottle', points: 25, color: 'red.500' },
  { emoji: '🛍️', name: 'Plastic Bag', points: 20, color: 'orange.500' },
  { emoji: '🥫', name: 'Metal Can', points: 30, color: 'gray.500' },
  { emoji: '🍶', name: 'Glass Bottle', points: 35, color: 'blue.500' },
  { emoji: '📦', name: 'Cardboard', points: 15, color: 'brown.500' },
  { emoji: '🔋', name: 'Battery', points: 50, color: 'purple.500' },
  { emoji: '👟', name: 'Old Shoe', points: 40, color: 'yellow.600' },
  { emoji: '📱', name: 'Phone', points: 60, color: 'pink.500' }
];

const generateRandomTrash = (count = 8) => {
  return Array.from({ length: count }, (_, index) => {
    const trashType = trashTypes[Math.floor(Math.random() * trashTypes.length)];
    return {
      id: index + 1,
      x: Math.random() * 500 + 30, // Random x position within river bounds
      y: Math.random() * 200 + 30, // Random y position within river bounds
      removed: false,
      ...trashType
    };
  });
};

const CleanRiverGame = () => {
  const [gameState, setGameState] = useState('menu'); // menu, playing, paused, completed
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lives, setLives] = useState(3);
  const [timeLeft, setTimeLeft] = useState(60);
  const [trashItems, setTrashItems] = useState([]);
  const [draggedItem, setDraggedItem] = useState(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [totalItemsCollected, setTotalItemsCollected] = useState(0);
  const [pollutionLevel, setPollutionLevel] = useState(100);
  const [achievements, setAchievements] = useState([]);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const totalTrash = trashItems.length;
  const removedTrash = trashItems.filter(item => item.removed).length;
  const progress = totalTrash > 0 ? (removedTrash / totalTrash) * 100 : 0;

  // Timer effect
  useEffect(() => {
    let timer;
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameState('completed');
            onOpen();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, onOpen]);

  // Level progression
  useEffect(() => {
    if (removedTrash === totalTrash && totalTrash > 0 && gameState === 'playing') {
      setTimeout(() => {
        nextLevel();
      }, 1000);
    }
  }, [removedTrash, totalTrash, gameState]);

  // Pollution level calculation
  useEffect(() => {
    const cleanPercentage = totalTrash > 0 ? (removedTrash / totalTrash) * 100 : 100;
    setPollutionLevel(Math.max(0, 100 - cleanPercentage));
  }, [removedTrash, totalTrash]);

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setLives(3);
    setTimeLeft(60);
    setCombo(0);
    setMaxCombo(0);
    setTotalItemsCollected(0);
    setAchievements([]);
    setTrashItems(generateRandomTrash(5 + level));
  };

  const nextLevel = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    setTimeLeft(prev => Math.min(prev + 15, 90)); // Bonus time
    setTrashItems(generateRandomTrash(5 + newLevel));
    
    toast({
      title: `Level ${newLevel}! 🎉`,
      description: `+15 seconds bonus time! More trash to clean!`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Check achievements
    checkAchievements(newLevel);
  };

  const checkAchievements = (currentLevel) => {
    const newAchievements = [];
    
    if (currentLevel >= 5 && !achievements.includes('level5')) {
      newAchievements.push('level5');
      showAchievement('🏆 Level Master', 'Reached level 5!');
    }
    
    if (maxCombo >= 5 && !achievements.includes('combo5')) {
      newAchievements.push('combo5');
      showAchievement('🔥 Combo King', '5x combo achieved!');
    }
    
    if (score >= 1000 && !achievements.includes('score1000')) {
      newAchievements.push('score1000');
      showAchievement('💎 High Scorer', '1000+ points!');
    }

    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  };

  const showAchievement = (title, description) => {
    toast({
      title: title,
      description: description,
      status: "info",
      duration: 4000,
      isClosable: true,
      position: "top",
    });
  };

  const handleDragStart = (e, trashId) => {
    setDraggedItem(trashId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = useCallback((e, isRecycleBin = false) => {
    e.preventDefault();
    if (!draggedItem) return;

    const trashItem = trashItems.find(item => item.id === draggedItem);
    if (!trashItem) return;

    // Check if item should go to recycle bin
    const shouldRecycle = ['Plastic Bottle', 'Metal Can', 'Glass Bottle', 'Cardboard'].includes(trashItem.name);
    const correctBin = isRecycleBin === shouldRecycle;

    setTrashItems(prev => 
      prev.map(item => 
        item.id === draggedItem ? { ...item, removed: true } : item
      )
    );

    let pointsEarned = trashItem.points;
    let comboBonus = 0;

    if (correctBin) {
      setCombo(prev => {
        const newCombo = prev + 1;
        setMaxCombo(max => Math.max(max, newCombo));
        return newCombo;
      });
      comboBonus = combo * 5;
      pointsEarned += comboBonus;
      
      toast({
        title: correctBin ? "Perfect! ♻️" : "Great job! 🎉",
        description: `+${pointsEarned} points ${comboBonus > 0 ? `(+${comboBonus} combo bonus)` : ''}`,
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } else {
      setCombo(0);
      pointsEarned = Math.floor(pointsEarned / 2);
      
      toast({
        title: "Wrong bin! 😅",
        description: `+${pointsEarned} points (combo broken)`,
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
    }

    setScore(prev => prev + pointsEarned);
    setTotalItemsCollected(prev => prev + 1);
    setDraggedItem(null);

    // Check achievements
    checkAchievements(level);
  }, [draggedItem, trashItems, combo, level, achievements]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreGrade = () => {
    if (score >= 2000) return { grade: 'S', color: 'purple.500' };
    if (score >= 1500) return { grade: 'A+', color: 'green.500' };
    if (score >= 1000) return { grade: 'A', color: 'blue.500' };
    if (score >= 500) return { grade: 'B', color: 'yellow.500' };
    return { grade: 'C', color: 'orange.500' };
  };

  if (gameState === 'menu') {
    return (
      <Container maxW="6xl" py={8}>
        <Card bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)" color="white" shadow="2xl" borderRadius="2xl">
          <CardBody p={12} textAlign="center">
            <Text fontSize="6xl" mb={4}>🌊</Text>
            <Text fontSize="4xl" fontWeight="bold" mb={4}>
              Clean the River
            </Text>
            <Text fontSize="xl" mb={8} opacity={0.9}>
              Help save our waterways by cleaning up pollution!
              Sort recyclables correctly for bonus points!
            </Text>
            
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
              <VStack>
                <Circle size="80px" bg="whiteAlpha.200">
                  <Text fontSize="2xl">🎯</Text>
                </Circle>
                <Text fontWeight="bold">Sort & Clean</Text>
                <Text fontSize="sm" opacity={0.8}>
                  Drag trash to the correct bins
                </Text>
              </VStack>
              <VStack>
                <Circle size="80px" bg="whiteAlpha.200">
                  <Text fontSize="2xl">⏰</Text>
                </Circle>
                <Text fontWeight="bold">Beat the Clock</Text>
                <Text fontSize="sm" opacity={0.8}>
                  Clean before time runs out
                </Text>
              </VStack>
              <VStack>
                <Circle size="80px" bg="whiteAlpha.200">
                  <Text fontSize="2xl">🏆</Text>
                </Circle>
                <Text fontWeight="bold">Earn Combos</Text>
                <Text fontSize="sm" opacity={0.8}>
                  Consecutive correct sorts = bonus points
                </Text>
              </VStack>
            </SimpleGrid>

            <Button
              size="xl"
              fontSize="xl"
              px={12}
              py={6}
              bg="white"
              color="purple.600"
              onClick={startGame}
              _hover={{ transform: "translateY(-2px)", shadow: "xl" }}
              borderRadius="xl"
            >
              Start Cleaning! 🚀
            </Button>
          </CardBody>
        </Card>
      </Container>
    );
  }

  if (gameState === 'completed') {
    const { grade, color } = getScoreGrade();
    
    return (
      <Modal isOpen={true} onClose={() => {}} isCentered size="xl">
        <ModalOverlay backdropFilter="blur(10px)" />
        <ModalContent borderRadius="2xl">
          <ModalHeader textAlign="center" fontSize="3xl" pb={2}>
            {timeLeft === 0 ? "⏰ Time's Up!" : "🎉 Level Complete!"}
          </ModalHeader>
          <ModalBody>
            <VStack spacing={6}>
              <Circle size="100px" bg={`${color}Alpha.100`} color={color}>
                <Text fontSize="3xl" fontWeight="bold">{grade}</Text>
              </Circle>
              
              <SimpleGrid columns={2} spacing={6} w="full">
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="green.500">{score}</Text>
                  <Text fontSize="sm" color="gray.600">Final Score</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.500">{level}</Text>
                  <Text fontSize="sm" color="gray.600">Level Reached</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="purple.500">{maxCombo}</Text>
                  <Text fontSize="sm" color="gray.600">Max Combo</Text>
                </VStack>
                <VStack>
                  <Text fontSize="2xl" fontWeight="bold" color="orange.500">{totalItemsCollected}</Text>
                  <Text fontSize="sm" color="gray.600">Items Cleaned</Text>
                </VStack>
              </SimpleGrid>

              {achievements.length > 0 && (
                <Box w="full">
                  <Text fontWeight="bold" mb={2}>🏆 Achievements Unlocked:</Text>
                  <HStack wrap="wrap" spacing={2}>
                    {achievements.map((achievement, index) => (
                      <Badge key={index} colorScheme="gold" px={2} py={1}>
                        {achievement === 'level5' && '🏆 Level Master'}
                        {achievement === 'combo5' && '🔥 Combo King'}
                        {achievement === 'score1000' && '💎 High Scorer'}
                      </Badge>
                    ))}
                  </HStack>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter justifyContent="center" gap={4}>
            <Button colorScheme="green" onClick={startGame} size="lg">
              Play Again
            </Button>
            <Button variant="outline" onClick={() => setGameState('menu')} size="lg">
              Main Menu
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Box minH="100vh" bg="linear-gradient(to bottom, #a8edea, #fed6e3)" p={4}>
      <Container maxW="6xl">
        <VStack spacing={6}>
          {/* Header Stats */}
          <Card w="full" shadow="lg" borderRadius="xl">
            <CardBody>
              <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
                <HStack spacing={6}>
                  <VStack spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">{score}</Text>
                    <Text fontSize="sm" color="gray.600">Score</Text>
                  </VStack>
                  <VStack spacing={0}>
                    <Text fontSize="2xl" fontWeight="bold" color="blue.500">{level}</Text>
                    <Text fontSize="sm" color="gray.600">Level</Text>
                  </VStack>
                  <VStack spacing={0}>
                    <HStack>
                      <Icon as={TimeIcon} color="red.500" />
                      <Text fontSize="xl" fontWeight="bold" color={timeLeft <= 10 ? "red.500" : "gray.700"}>
                        {formatTime(timeLeft)}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">Time Left</Text>
                  </VStack>
                </HStack>

                <HStack spacing={4}>
                  {combo > 1 && (
                    <Badge colorScheme="purple" fontSize="lg" px={3} py={1}>
                      🔥 {combo}x Combo
                    </Badge>
                  )}
                  <HStack>
                    {[...Array(3)].map((_, i) => (
                      <Circle key={i} size="30px" bg={i < lives ? "red.400" : "gray.200"}>
                        <Text>❤️</Text>
                      </Circle>
                    ))}
                  </HStack>
                </HStack>
              </Flex>

              <Box mt={4}>
                <Flex justify="space-between" mb={2}>
                  <Text fontSize="sm">Progress ({removedTrash}/{totalTrash})</Text>
                  <Text fontSize="sm" color={pollutionLevel > 50 ? "red.500" : "green.500"}>
                    Pollution: {Math.round(pollutionLevel)}%
                  </Text>
                </Flex>
                <Progress value={progress} colorScheme="green" size="lg" borderRadius="full" />
              </Box>
            </CardBody>
          </Card>

          {/* Game Area */}
          <Card w="full" shadow="xl" borderRadius="2xl">
            <CardBody p={0}>
              <Box position="relative">
                {/* River */}
                <Box
                  w="full"
                  h="400px"
                  bg={pollutionLevel > 70 ? "linear-gradient(45deg, #8B4513 0%, #A0522D 100%)" : 
                      pollutionLevel > 30 ? "linear-gradient(45deg, #4682B4 0%, #87CEEB 100%)" :
                      "linear-gradient(45deg, #4facfe 0%, #00f2fe 100%)"}
                  borderTopRadius="2xl"
                  position="relative"
                  overflow="hidden"
                >
                  {/* Flowing Animation */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    background={`repeating-linear-gradient(
                      90deg,
                      transparent,
                      transparent 20px,
                      rgba(255,255,255,0.1) 20px,
                      rgba(255,255,255,0.1) 40px
                    )`}
                    animation="flow 3s linear infinite"
                  />

                  <style>
                    {`
                      @keyframes flow {
                        from { transform: translateX(-40px); }
                        to { transform: translateX(40px); }
                      }
                      @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                      }
                      .trash-item {
                        animation: float 2s ease-in-out infinite;
                      }
                    `}
                  </style>

                  {/* Trash Items */}
                  {trashItems.map(trash => (
                    !trash.removed && (
                      <Box
                        key={trash.id}
                        className="trash-item"
                        position="absolute"
                        left={`${trash.x}px`}
                        top={`${trash.y}px`}
                        w="60px"
                        h="60px"
                        bg="whiteAlpha.900"
                        borderRadius="xl"
                        cursor="grab"
                        draggable
                        onDragStart={(e) => handleDragStart(e, trash.id)}
                        _hover={{ 
                          transform: "scale(1.1)",
                          shadow: "lg"
                        }}
                        _active={{ 
                          cursor: "grabbing",
                          transform: "scale(0.95)"
                        }}
                        transition="all 0.2s ease"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        fontSize="2xl"
                        boxShadow="lg"
                        border="2px solid"
                        borderColor={trash.color}
                      >
                        {trash.emoji}
                      </Box>
                    )
                  ))}

                  {/* Marine Life (shows more when water is cleaner) */}
                  {pollutionLevel < 70 && (
                    <>
                      <Box
                        position="absolute"
                        top="50px"
                        left="100px"
                        fontSize="2xl"
                        animation="float 1.5s ease-in-out infinite"
                      >
                        🐟
                      </Box>
                      <Box
                        position="absolute"
                        bottom="60px"
                        right="120px"
                        fontSize="xl"
                        animation="float 2.5s ease-in-out infinite"
                      >
                        🌿
                      </Box>
                    </>
                  )}
                  
                  {pollutionLevel < 30 && (
                    <>
                      <Box
                        position="absolute"
                        top="100px"
                        right="200px"
                        fontSize="xl"
                        animation="float 2s ease-in-out infinite"
                      >
                        🐠
                      </Box>
                      <Box
                        position="absolute"
                        bottom="100px"
                        left="250px"
                        fontSize="lg"
                        animation="float 3s ease-in-out infinite"
                      >
                        🦀
                      </Box>
                    </>
                  )}
                </Box>

                {/* Bins */}
                <HStack spacing={8} justify="center" p={6} bg="gray.50" borderBottomRadius="2xl">
                  {/* Recycle Bin */}
                  <Box
                    w="180px"
                    h="120px"
                    border="3px dashed"
                    borderColor="green.400"
                    borderRadius="15px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="green.50"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, true)}
                    _hover={{ 
                      borderColor: "green.500",
                      bg: "green.100",
                      transform: "scale(1.02)"
                    }}
                    transition="all 0.3s ease"
                    cursor="pointer"
                  >
                    <VStack>
                      <Text fontSize="3xl">♻️</Text>
                      <Text fontWeight="bold" color="green.600" fontSize="sm">
                        Recycle Bin
                      </Text>
                      <Text fontSize="xs" color="green.500" textAlign="center">
                        Bottles, Cans, Cardboard
                      </Text>
                    </VStack>
                  </Box>

                  {/* Trash Bin */}
                  <Box
                    w="180px"
                    h="120px"
                    border="3px dashed"
                    borderColor="gray.400"
                    borderRadius="15px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="gray.50"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, false)}
                    _hover={{ 
                      borderColor: "gray.500",
                      bg: "gray.100",
                      transform: "scale(1.02)"
                    }}
                    transition="all 0.3s ease"
                    cursor="pointer"
                  >
                    <VStack>
                      <Text fontSize="3xl">🗑️</Text>
                      <Text fontWeight="bold" color="gray.600" fontSize="sm">
                        Trash Bin
                      </Text>
                      <Text fontSize="xs" color="gray.500" textAlign="center">
                        Other Waste
                      </Text>
                    </VStack>
                  </Box>
                </HStack>
              </Box>
            </CardBody>
          </Card>

          {/* Instructions */}
          <Card w="full">
            <CardBody>
              <Text textAlign="center" color="gray.600">
                <strong>🎯 Goal:</strong> Drag trash items to the correct bins! 
                <strong style={{color: '#38A169'}}> ♻️ Recyclables</strong> earn bonus points when sorted correctly!
                <strong style={{color: '#E53E3E'}}> Wrong bin = combo broken!</strong>
              </Text>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default CleanRiverGame;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  useColorModeValue,
  Container,
  Badge,
  Progress,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Alert,
  AlertIcon,
  Flex,
  Heading,
  useToast,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  Divider,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react';

const AirPurifierGames = () => {
  const [score, setScore] = useState(0);
  const [currentGame, setCurrentGame] = useState('home');
  const [gameData, setGameData] = useState({});
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameStats, setGameStats] = useState({ 
    totalGamesPlayed: 0, 
    highScore: 0, 
    cleanActions: 0 
  });
  const [timeLeft, setTimeLeft] = useState(0);
  const [combo, setCombo] = useState(0);
  
  const gameAreaRef = useRef(null);
  const toast = useToast();
  
  const { isOpen: isWinOpen, onOpen: onWinOpen, onClose: onWinClose } = useDisclosure();
  const { isOpen: isLoseOpen, onOpen: onLoseOpen, onClose: onLoseClose } = useDisclosure();
  const { isOpen: isStatsOpen, onOpen: onStatsOpen, onClose: onStatsClose } = useDisclosure();

  // Enhanced color scheme
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, cyan.100, teal.50)',
    'linear(to-br, blue.900, cyan.800, teal.900)'
  );
  
  const cardBg = useColorModeValue('white', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.300');

  // Enhanced score update with animations and feedback
  const updateScore = useCallback((points, action = '') => {
    setScore(prev => {
      const newScore = Math.max(0, prev + points);
      
      // Update high score
      setGameStats(stats => ({
        ...stats,
        highScore: Math.max(stats.highScore, newScore),
        cleanActions: points > 0 ? stats.cleanActions + 1 : stats.cleanActions
      }));

      // Combo system
      if (points > 0) {
        setCombo(c => c + 1);
        // Bonus points for combo
        if (combo > 3) {
          const bonusPoints = Math.floor(combo / 3);
          toast({
            title: `Combo x${combo}!`,
            description: `+${bonusPoints} bonus points!`,
            status: 'success',
            duration: 2000,
            position: 'top',
          });
          return newScore + bonusPoints;
        }
      } else {
        setCombo(0);
      }

      // Show toast feedback
      if (points > 0) {
        toast({
          title: action || 'Great job!',
          description: `+${points} points`,
          status: 'success',
          duration: 1500,
          position: 'top-right',
        });
      } else if (points < 0) {
        toast({
          title: 'Oops!',
          description: `${points} points`,
          status: 'warning',
          duration: 1500,
          position: 'top-right',
        });
      }
      
      // Win/lose conditions
      if (newScore >= 100) {
        onWinOpen();
        setIsGameActive(false);
        setGameStats(stats => ({ ...stats, totalGamesPlayed: stats.totalGamesPlayed + 1 }));
      }
      if (newScore <= 0 && prev > 0) {
        onLoseOpen();
        setIsGameActive(false);
        setGameStats(stats => ({ ...stats, totalGamesPlayed: stats.totalGamesPlayed + 1 }));
      }
      
      return newScore;
    });
  }, [combo, onWinOpen, onLoseOpen, toast]);

  const resetGame = () => {
    setScore(0);
    setIsGameActive(false);
    setGameData({});
    setTimeLeft(0);
    setCombo(0);
    onWinClose();
    onLoseClose();
  };

  const backToHome = () => {
    setCurrentGame('home');
    resetGame();
  };

  // Game 1: Balloons vs Smoke with timer and improved mechanics
  const startBalloonsGame = () => {
    setCurrentGame('balloons');
    setIsGameActive(true);
    setTimeLeft(30);
    setCombo(0);
    
    const items = [];
    for (let i = 0; i < 20; i++) {
      items.push({
        id: i,
        type: Math.random() > 0.4 ? 'balloon' : 'smoke',
        x: Math.random() * 85,
        y: Math.random() * 80,
        clicked: false,
        size: 30 + Math.random() * 20,
        speed: 0.5 + Math.random() * 1
      });
    }
    setGameData({ items, itemsClicked: 0, totalBalloons: items.filter(item => item.type === 'balloon').length });
  };

  // Game 2: Purifier Catch - Fixed version
  const startPurifierGame = () => {
    setCurrentGame('purifier');
    setIsGameActive(true);
    setTimeLeft(45);
    setCombo(0);
    setGameData({
      purifierPos: 42.5,
      fallingItems: [],
      nextId: 0,
      itemsCaught: 0,
      purifierWidth: 15
    });
  };

  // Spawn falling items for purifier game
  useEffect(() => {
    if (currentGame === 'purifier' && isGameActive && timeLeft > 0) {
      const spawnInterval = setInterval(() => {
        setGameData(prev => {
          const itemTypes = ['clean', 'dirty', 'bonus', 'penalty'];
          const weights = [0.4, 0.35, 0.15, 0.1];
          let randomValue = Math.random();
          let selectedType = 'clean';
          let cumulativeWeight = 0;
          
          for (let i = 0; i < itemTypes.length; i++) {
            cumulativeWeight += weights[i];
            if (randomValue <= cumulativeWeight) {
              selectedType = itemTypes[i];
              break;
            }
          }
          
          const newItem = {
            id: prev.nextId,
            type: selectedType,
            x: Math.random() * 75,
            y: 0,
            speed: 1.5 + Math.random() * 1.5,
            size: selectedType === 'bonus' ? 25 : selectedType === 'penalty' ? 20 : 20
          };
          
          return {
            ...prev,
            nextId: prev.nextId + 1,
            fallingItems: [...prev.fallingItems, newItem]
          };
        });
      }, 900);
      
      return () => clearInterval(spawnInterval);
    }
  }, [currentGame, isGameActive, timeLeft]);

  // Move falling items and handle collisions
  useEffect(() => {
    if (currentGame === 'purifier' && isGameActive) {
      const moveInterval = setInterval(() => {
        setGameData(prev => ({
          ...prev,
          fallingItems: prev.fallingItems.map(item => ({
            ...item,
            y: item.y + item.speed
          })).filter(item => {
            if (item.y > 85) {
              const purifierLeft = prev.purifierPos;
              const purifierRight = prev.purifierPos + prev.purifierWidth;
              
              if (item.x >= purifierLeft && item.x <= purifierRight) {
                let points = 0;
                let message = '';
                
                switch(item.type) {
                  case 'clean':
                    points = 8;
                    message = 'Clean air captured!';
                    break;
                  case 'dirty':
                    points = -5;
                    message = 'Pollution caught!';
                    break;
                  case 'bonus':
                    points = 15;
                    message = 'Bonus item!';
                    break;
                  case 'penalty':
                    points = -10;
                    message = 'Penalty item!';
                    break;
                }
                
                updateScore(points, message);
                setGameData(prevData => ({
                  ...prevData,
                  itemsCaught: prevData.itemsCaught + 1
                }));
              }
              return false;
            }
            return item.y <= 85;
          })
        }));
      }, 50);

      return () => clearInterval(moveInterval);
    }
  }, [currentGame, isGameActive, updateScore]);

  // Game 3: Air Quality Monitor
  const startMonitorGame = () => {
    setCurrentGame('monitor');
    setIsGameActive(true);
    setTimeLeft(60);
    setCombo(0);
    
    const pollutants = [
      { name: 'CO₂', level: 60 + Math.random() * 40, safe: false, color: 'red', cleanRate: 15 },
      { name: 'PM2.5', level: 70 + Math.random() * 30, safe: false, color: 'orange', cleanRate: 12 },
      { name: 'O₃', level: 50 + Math.random() * 40, safe: false, color: 'yellow', cleanRate: 18 },
      { name: 'NO₂', level: 40 + Math.random() * 50, safe: false, color: 'purple', cleanRate: 14 },
      { name: 'SO₂', level: 30 + Math.random() * 40, safe: false, color: 'pink', cleanRate: 20 },
      { name: 'O₂', level: 80 + Math.random() * 15, safe: true, color: 'green', cleanRate: 0 }
    ];
    
    setGameData({ 
      pollutants, 
      cleanedCount: 0, 
      actionsRemaining: 25,
      targetCleanLevel: 25 
    });
  };

  // Timer effects for all games
  useEffect(() => {
    let interval;
    if (isGameActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsGameActive(false);
            let description = `Final score: ${score}`;
            
            if (currentGame === 'purifier') {
              description = `Items caught: ${gameData.itemsCaught || 0}`;
            } else if (currentGame === 'monitor') {
              const cleanedPollutants = gameData.pollutants?.filter(p => !p.safe && p.level <= gameData.targetCleanLevel).length || 0;
              description = `Cleaned ${cleanedPollutants}/5 pollutants`;
            }
            
            toast({
              title: 'Time\'s up!',
              description,
              status: 'info',
              duration: 3000,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentGame, isGameActive, timeLeft, score, gameData.itemsCaught, gameData.pollutants, gameData.targetCleanLevel, toast]);

  const handleItemClick = (itemId, type, size) => {
    setGameData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, clicked: true } : item
      ),
      itemsClicked: prev.itemsClicked + 1
    }));

    if (type === 'balloon') {
      const points = size > 40 ? 8 : 5;
      updateScore(points, 'Clean air captured!');
    } else {
      updateScore(-3, 'Pollution released!');
    }
  };

  const movePurifier = (direction) => {
    setGameData(prev => ({
      ...prev,
      purifierPos: Math.max(0, Math.min(85, prev.purifierPos + (direction === 'left' ? -8 : 8)))
    }));
  };

  const cleanPollutant = (index) => {
    if (gameData.actionsRemaining <= 0) return;
    
    setGameData(prev => {
      const newPollutants = [...prev.pollutants];
      const pollutant = newPollutants[index];
      
      if (!pollutant.safe) {
        const reduction = pollutant.cleanRate + Math.random() * 5;
        pollutant.level = Math.max(0, pollutant.level - reduction);
        updateScore(6, `Reduced ${pollutant.name}!`);
        
        const newCleanedCount = newPollutants.filter(p => !p.safe && p.level <= prev.targetCleanLevel).length;
        
        return {
          ...prev,
          pollutants: newPollutants,
          cleanedCount: newCleanedCount,
          actionsRemaining: prev.actionsRemaining - 1
        };
      } else {
        updateScore(-8, 'Don\'t reduce oxygen!');
        return {
          ...prev,
          actionsRemaining: prev.actionsRemaining - 1
        };
      }
    });
  };

  const getItemEmoji = (type) => {
    switch(type) {
      case 'clean': return '💨';
      case 'dirty': return '☁️';
      case 'bonus': return '⭐';
      case 'penalty': return '💀';
      default: return '💨';
    }
  };

  const getItemColor = (type) => {
    switch(type) {
      case 'clean': return 'cyan.300';
      case 'dirty': return 'gray.600';
      case 'bonus': return 'yellow.300';
      case 'penalty': return 'red.500';
      default: return 'cyan.300';
    }
  };

  // Enhanced keyboard controls
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (currentGame === 'purifier' && isGameActive) {
        e.preventDefault();
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
          movePurifier('left');
        } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
          movePurifier('right');
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentGame, isGameActive]);

  const renderGame = () => {
    switch (currentGame) {
      case 'balloons':
        return (
          <VStack spacing={6}>
            <Flex justify="space-between" align="center" w="100%" wrap="wrap" gap={4}>
              <Heading size="lg" color={accentColor} textAlign="center">
                🎈 Balloon Pop Challenge
              </Heading>
              <HStack spacing={4}>
                <Badge colorScheme="blue" fontSize="md" p={2} borderRadius="lg">
                  Time: {timeLeft}s
                </Badge>
                <Badge colorScheme="green" fontSize="md" p={2} borderRadius="lg">
                  Combo: x{combo}
                </Badge>
              </HStack>
            </Flex>
            
            <Text textAlign="center" color={textColor} fontSize="md">
              Click balloons (clean air) and avoid smoke clouds! Bigger balloons are worth more points.
            </Text>
            
            <Box
              position="relative"
              width="100%"
              height="450px"
              bg="linear-gradient(to-b, #87CEEB, #E0F6FF, #F0FFFF)"
              borderRadius="2xl"
              overflow="hidden"
              border="3px solid"
              borderColor={accentColor}
              shadow="2xl"
            >
              {gameData.items?.map(item => (
                <Box
                  key={item.id}
                  position="absolute"
                  left={`${item.x}%`}
                  top={`${item.y}%`}
                  width={`${item.size}px`}
                  height={`${item.size}px`}
                  borderRadius="50%"
                  bg={item.type === 'balloon' ? 'red.400' : 'gray.700'}
                  cursor={item.clicked ? 'default' : 'pointer'}
                  opacity={item.clicked ? 0.2 : 1}
                  transform={item.clicked ? 'scale(0.6)' : 'scale(1)'}
                  transition="all 0.4s ease-out"
                  onClick={() => !item.clicked && handleItemClick(item.id, item.type, item.size)}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize={`${Math.max(16, item.size * 0.6)}px`}
                  shadow="lg"
                  _hover={{
                    transform: item.clicked ? 'scale(0.6)' : 'scale(1.1)',
                    shadow: 'xl'
                  }}
                >
                  {item.type === 'balloon' ? '🎈' : '💨'}
                </Box>
              ))}
              
              {timeLeft <= 10 && timeLeft > 0 && (
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  fontSize="6xl"
                  fontWeight="bold"
                  color="red.500"
                  textShadow="2px 2px 4px rgba(0,0,0,0.5)"
                >
                  {timeLeft}
                </Box>
              )}
            </Box>
            
            <HStack spacing={4}>
              <Stat textAlign="center">
                <StatLabel>Items Clicked</StatLabel>
                <StatNumber>{gameData.itemsClicked || 0}</StatNumber>
              </Stat>
              <Stat textAlign="center">
                <StatLabel>Accuracy</StatLabel>
                <StatNumber>
                  {gameData.itemsClicked > 0 ? 
                    Math.round((score / (gameData.itemsClicked * 5)) * 100) : 0}%
                </StatNumber>
              </Stat>
            </HStack>
          </VStack>
        );

      case 'purifier':
        return (
          <VStack spacing={6}>
            <Flex justify="space-between" align="center" w="100%" wrap="wrap" gap={4}>
              <Heading size="lg" color={accentColor}>
                🌬️ Air Purifier Challenge
              </Heading>
              <HStack spacing={4}>
                <Badge colorScheme="blue" fontSize="md" p={2} borderRadius="lg">
                  Time: {timeLeft}s
                </Badge>
                <Badge colorScheme="purple" fontSize="md" p={2} borderRadius="lg">
                  Caught: {gameData.itemsCaught || 0}
                </Badge>
              </HStack>
            </Flex>
            
            <Text textAlign="center" color={textColor} fontSize="md">
              Move your purifier to catch clean air (💨) and bonus stars (⭐). Avoid pollution (☁️) and penalties (💀)!
            </Text>
            
            <HStack spacing={4} flexWrap="wrap" justify="center">
              <Button 
                onClick={() => movePurifier('left')} 
                colorScheme="blue" 
                size="lg"
                leftIcon={<Text fontSize="xl">←</Text>}
              >
                Left
              </Button>
              <Button 
                onClick={() => movePurifier('right')} 
                colorScheme="blue" 
                size="lg"
                rightIcon={<Text fontSize="xl">→</Text>}
              >
                Right
              </Button>
            </HStack>
            
            <Box
              position="relative"
              width="100%"
              height="500px"
              bg="linear-gradient(to-b, #B0E0E6, #F0F8FF, #E6F3FF)"
              borderRadius="2xl"
              overflow="hidden"
              border="3px solid"
              borderColor={accentColor}
              shadow="2xl"
            >
              {/* Purifier */}
              <Box
                position="absolute"
                bottom="30px"
                left={`${gameData.purifierPos}%`}
                width="80px"
                height="50px"
                bg="linear-gradient(to-t, #2D3748, #4A5568)"
                borderRadius="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="28px"
                transition="left 0.3s ease-out"
                shadow="lg"
                border="2px solid"
                borderColor="gray.700"
              >
                🏭
                <Box
                  position="absolute"
                  top="-10px"
                  width="90px"
                  height="15px"
                  bg="blue.300"
                  borderRadius="full"
                  opacity={0.7}
                />
              </Box>

              {/* Falling Items */}
              {gameData.fallingItems?.map(item => (
                <Box
                  key={item.id}
                  position="absolute"
                  left={`${item.x}%`}
                  top={`${item.y}%`}
                  width={`${item.size}px`}
                  height={`${item.size}px`}
                  borderRadius="50%"
                  bg={getItemColor(item.type)}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize={`${Math.max(14, item.size * 0.8)}px`}
                  shadow="md"
                  border="2px solid"
                  borderColor="white"
                  transition="all 0.2s"
                  _hover={{ transform: 'scale(1.1)' }}
                >
                  {getItemEmoji(item.type)}
                </Box>
              ))}
              
              {/* Combo indicator */}
              {combo > 2 && (
                <Box
                  position="absolute"
                  top="20px"
                  right="20px"
                  bg="yellow.300"
                  p={3}
                  borderRadius="lg"
                  fontSize="xl"
                  fontWeight="bold"
                >
                  🔥 x{combo}
                </Box>
              )}
            </Box>
          </VStack>
        );

      case 'monitor':
        return (
          <VStack spacing={6}>
            <Flex justify="space-between" align="center" w="100%" wrap="wrap" gap={4}>
              <Heading size="lg" color={accentColor}>
                🌡️ Air Quality Control Center
              </Heading>
              <HStack spacing={4}>
                <Badge colorScheme="blue" fontSize="md" p={2} borderRadius="lg">
                  Time: {timeLeft}s
                </Badge>
                <Badge colorScheme="orange" fontSize="md" p={2} borderRadius="lg">
                  Actions: {gameData.actionsRemaining}
                </Badge>
              </HStack>
            </Flex>
            
            <Alert status="info" borderRadius="lg">
              <AlertIcon />
              <VStack align="start" spacing={1}>
                <Text fontWeight="bold">Mission: Reduce harmful pollutants below 25%</Text>
                <Text fontSize="sm">Click pollutants to clean them. Don't click Oxygen! Actions are limited.</Text>
              </VStack>
            </Alert>
            
            <Grid templateColumns="repeat(auto-fit, minmax(280px, 1fr))" gap={6} width="100%">
              {gameData.pollutants?.map((pollutant, index) => (
                <GridItem key={index}>
                  <Card
                    bg={pollutant.safe ? 'green.50' : 'white'}
                    border="2px solid"
                    borderColor={pollutant.safe ? 'green.300' : `${pollutant.color}.300`}
                    cursor={gameData.actionsRemaining > 0 ? 'pointer' : 'not-allowed'}
                    _hover={{ 
                      transform: gameData.actionsRemaining > 0 ? 'scale(1.05)' : 'none',
                      shadow: 'xl' 
                    }}
                    transition="all 0.3s ease"
                    onClick={() => gameData.actionsRemaining > 0 && cleanPollutant(index)}
                    opacity={gameData.actionsRemaining === 0 ? 0.6 : 1}
                  >
                    <CardBody>
                      <VStack spacing={4}>
                        <HStack justify="space-between" w="100%">
                          <Text fontWeight="bold" fontSize="xl" color={`${pollutant.color}.600`}>
                            {pollutant.name}
                          </Text>
                          <CircularProgress 
                            value={pollutant.level} 
                            color={`${pollutant.color}.400`}
                            size="60px"
                            thickness="8px"
                          >
                            <CircularProgressLabel fontSize="sm" fontWeight="bold">
                              {Math.round(pollutant.level)}%
                            </CircularProgressLabel>
                          </CircularProgress>
                        </HStack>
                        
                        <Progress
                          value={pollutant.level}
                          colorScheme={pollutant.color}
                          size="lg"
                          width="100%"
                          borderRadius="md"
                          bg="gray.100"
                        />
                        
                        <HStack justify="space-between" w="100%">
                          <Badge
                            colorScheme={
                              pollutant.level <= 25 ? 'green' : 
                              pollutant.level <= 50 ? 'yellow' : 'red'
                            }
                            fontSize="md"
                            p={1}
                            borderRadius="md"
                          >
                            {pollutant.level <= 25 ? 'SAFE' : 
                             pollutant.level <= 50 ? 'MODERATE' : 'DANGEROUS'}
                          </Badge>
                          
                          {pollutant.level <= gameData.targetCleanLevel && !pollutant.safe && (
                            <Badge colorScheme="green" fontSize="sm">
                              ✅ TARGET REACHED
                            </Badge>
                          )}
                        </HStack>
                        
                        <Text fontSize="xs" textAlign="center" color="gray.600">
                          {pollutant.safe ? 
                            '🚫 Essential gas - Do not reduce!' : 
                            `Click to reduce by ~${pollutant.cleanRate}%`}
                        </Text>
                      </VStack>
                    </CardBody>
                  </Card>
                </GridItem>
              ))}
            </Grid>
            
            {gameData.cleanedCount >= 4 && (
              <Alert status="success" borderRadius="lg" bg="green.100">
                <AlertIcon />
                <VStack align="start">
                  <Text fontWeight="bold">🎉 Excellent work!</Text>
                  <Text>You've achieved safe air quality levels! The environment thanks you.</Text>
                </VStack>
              </Alert>
            )}
            
            <HStack spacing={6}>
              <Stat textAlign="center">
                <StatLabel>Pollutants Cleaned</StatLabel>
                <StatNumber color="green.500">{gameData.cleanedCount}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Target: 4/5
                </StatHelpText>
              </Stat>
              
              <Stat textAlign="center">
                <StatLabel>Efficiency</StatLabel>
                <StatNumber color="blue.500">
                  {Math.round(((25 - (gameData.actionsRemaining || 0)) / 25) * 100)}%
                </StatNumber>
                <StatHelpText>Actions used</StatHelpText>
              </Stat>
            </HStack>
          </VStack>
        );

      default:
        return (
          <VStack spacing={10}>
            <VStack spacing={4} textAlign="center">
              <Heading size="2xl" bgGradient="linear(to-r, blue.400, cyan.400, teal.400)" bgClip="text">
                🌬️ Air Purification Games
              </Heading>
              <Text color={textColor} maxWidth="700px" fontSize="lg">
                Join the mission to protect our planet's air quality! Master three exciting games 
                and become an environmental hero. Every action counts in the fight for clean air.
              </Text>
            </VStack>
            
            <HStack spacing={6} flexWrap="wrap" justify="center">
              <Button 
                onClick={onStatsOpen} 
                colorScheme="purple" 
                variant="outline"
                leftIcon={<Text>📊</Text>}
              >
                View Stats
              </Button>
              <Badge colorScheme="blue" fontSize="md" p={2}>
                High Score: {gameStats.highScore}
              </Badge>
              <Badge colorScheme="green" fontSize="md" p={2}>
                Clean Actions: {gameStats.cleanActions}
              </Badge>
            </HStack>
            
            <Grid 
              templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} 
              gap={8} 
              width="100%" 
              maxWidth="1200px"
            >
              <GridItem>
                <Card
                  bg={cardBg}
                  borderRadius="2xl"
                  shadow="2xl"
                  _hover={{ transform: 'translateY(-8px)', shadow: '2xl' }}
                  transition="all 0.4s ease"
                  cursor="pointer"
                  onClick={startBalloonsGame}
                  border="2px solid transparent"
                  _hoverBorder="2px solid"
                  _hoverBorderColor="red.300"
                >
                  <CardBody p={8}>
                    <VStack spacing={6}>
                      <Box
                        fontSize="5xl"
                        filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                        transition="all 0.3s"
                        _groupHover={{ transform: 'scale(1.2)' }}
                      >
                        🎈
                      </Box>
                      <Heading size="lg" color="red.500" textAlign="center">
                        Balloon POP
                      </Heading>
                      <Text textAlign="center" color={textColor} fontSize="sm" lineHeight="tall">
                        Test your reflexes in this fast-paced game! Click balloons to capture 
                        clean air while avoiding pollution clouds.
                      </Text>
                      <VStack spacing={2} fontSize="sm" color="gray.600">
                        <HStack><Text>⏱️</Text><Text>30 seconds</Text></HStack>
                        <HStack><Text>🎯</Text><Text>Accuracy matters</Text></HStack>
                        <HStack><Text>🔥</Text><Text>Combo system</Text></HStack>
                      </VStack>
                      <Button 
                        colorScheme="red" 
                        size="lg" 
                        width="100%"
                        _hover={{ transform: 'scale(1.05)' }}
                        transition="all 0.2s"
                      >
                        Start Challenge
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>

              <GridItem>
                <Card
                  bg={cardBg}
                  borderRadius="2xl"
                  shadow="2xl"
                  _hover={{ transform: 'translateY(-8px)', shadow: '2xl' }}
                  transition="all 0.4s ease"
                  cursor="pointer"
                  onClick={startPurifierGame}
                  border="2px solid transparent"
                  _hoverBorder="2px solid"
                  _hoverBorderColor="cyan.300"
                >
                  <CardBody p={8}>
                    <VStack spacing={6}>
                      <Box
                        fontSize="5xl"
                        filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                        transition="all 0.3s"
                        _groupHover={{ transform: 'scale(1.2)' }}
                      >
                        🏭
                      </Box>
                      <Heading size="lg" color="cyan.500" textAlign="center">
                        Purifier Catch
                      </Heading>
                      <Text textAlign="center" color={textColor} fontSize="sm" lineHeight="tall">
                        Control your air purifier to catch clean particles and bonus items! 
                        Use keyboard arrows or buttons. Avoid pollution and penalties!
                      </Text>
                      <VStack spacing={2} fontSize="sm" color="gray.600">
                        <HStack><Text>⏱️</Text><Text>45 seconds</Text></HStack>
                        <HStack><Text>🎮</Text><Text>Arrow keys support</Text></HStack>
                        <HStack><Text>⭐</Text><Text>Bonus items</Text></HStack>
                      </VStack>
                      <Button 
                        colorScheme="cyan" 
                        size="lg" 
                        width="100%"
                        _hover={{ transform: 'scale(1.05)' }}
                        transition="all 0.2s"
                      >
                        Start Challenge
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>

              <GridItem>
                <Card
                  bg={cardBg}
                  borderRadius="2xl"
                  shadow="2xl"
                  _hover={{ transform: 'translateY(-8px)', shadow: '2xl' }}
                  transition="all 0.4s ease"
                  cursor="pointer"
                  onClick={startMonitorGame}
                  border="2px solid transparent"
                  _hoverBorder="2px solid"
                  _hoverBorderColor="green.300"
                >
                  <CardBody p={8}>
                    <VStack spacing={6}>
                      <Box
                        fontSize="5xl"
                        filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
                        transition="all 0.3s"
                        _groupHover={{ transform: 'scale(1.2)' }}
                      >
                        🌡️
                      </Box>
                      <Heading size="lg" color="green.500" textAlign="center">
                        Air Quality Control
                      </Heading>
                      <Text textAlign="center" color={textColor} fontSize="sm" lineHeight="tall">
                        Monitor and reduce dangerous pollutants like CO₂, PM2.5, and more! 
                        Strategic thinking required - actions are limited!
                      </Text>
                      <VStack spacing={2} fontSize="sm" color="gray.600">
                        <HStack><Text>⏱️</Text><Text>60 seconds</Text></HStack>
                        <HStack><Text>🧠</Text><Text>Strategy game</Text></HStack>
                        <HStack><Text>🎯</Text><Text>Limited actions</Text></HStack>
                      </VStack>
                      <Button 
                        colorScheme="green" 
                        size="lg" 
                        width="100%"
                        _hover={{ transform: 'scale(1.05)' }}
                        transition="all 0.2s"
                      >
                        Start Challenge
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>
            </Grid>

            <VStack spacing={4} textAlign="center" mt={8}>
              <Divider />
              <Text fontSize="md" color="gray.600" fontStyle="italic">
                "Every small action contributes to cleaner air for future generations"
              </Text>
              <HStack spacing={6} color="gray.500">
                <Text fontSize="sm">🌱 Educational</Text>
                <Text fontSize="sm">🎮 Interactive</Text>
                <Text fontSize="sm">🌍 Environmental</Text>
              </HStack>
            </VStack>
          </VStack>
        );
    }
  };

  return (
    <Container maxWidth="1400px" py={6}>
      <Box bgGradient={bgGradient} minHeight="100vh" borderRadius="2xl" p={8} shadow="2xl">
        {/* Enhanced Header */}
        <VStack spacing={6} mb={10}>
          <Flex justify="space-between" align="center" w="100%" wrap="wrap" gap={4}>
            <VStack align="start" spacing={2}>
              <Heading size="xl" color={accentColor}>
                🌱 Air Purification Center
              </Heading>
              {currentGame !== 'home' && (
                <Text color="gray.600" fontSize="sm">
                  Mission: Protect our planet's air quality
                </Text>
              )}
            </VStack>
            
            {currentGame !== 'home' && (
              <Button 
                onClick={backToHome} 
                colorScheme="gray" 
                variant="outline"
                leftIcon={<Text fontSize="lg">🏠</Text>}
                size="lg"
              >
                Home
              </Button>
            )}
          </Flex>
          
          {/* Enhanced Score Display */}
          {currentGame !== 'home' && (
            <Flex justify="center" align="center" wrap="wrap" gap={6} w="100%">
              <Card bg={cardBg} shadow="md">
                <CardBody p={4}>
                  <Stat textAlign="center">
                    <StatLabel>Current Score</StatLabel>
                    <StatNumber fontSize="2xl" color="blue.500">{score}</StatNumber>
                    {combo > 1 && (
                      <StatHelpText color="orange.500" fontWeight="bold">
                        🔥 Combo x{combo}
                      </StatHelpText>
                    )}
                  </Stat>
                </CardBody>
              </Card>
              
              <CircularProgress 
                value={Math.min(score, 100)} 
                size="80px" 
                color="green.400"
                thickness="8px"
              >
                <CircularProgressLabel fontSize="sm" fontWeight="bold">
                  {Math.min(score, 100)}%
                </CircularProgressLabel>
              </CircularProgress>
              
              <Card bg={cardBg} shadow="md">
                <CardBody p={4}>
                  <Stat textAlign="center">
                    <StatLabel>High Score</StatLabel>
                    <StatNumber fontSize="xl" color="purple.500">{gameStats.highScore}</StatNumber>
                    <StatHelpText>Personal Best</StatHelpText>
                  </Stat>
                </CardBody>
              </Card>
            </Flex>
          )}
        </VStack>

        {/* Game Area */}
        <Box ref={gameAreaRef}>
          {renderGame()}
        </Box>

        {/* Enhanced Win Modal */}
        <Modal isOpen={isWinOpen} onClose={onWinClose} size="lg">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent bg={cardBg} borderRadius="2xl" shadow="2xl">
            <ModalHeader>
              <VStack spacing={2}>
                <Text fontSize="3xl">🎉</Text>
                <Heading color="green.500">Mission Accomplished!</Heading>
              </VStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={6}>
                <Text fontSize="xl" textAlign="center" color={textColor}>
                  Congratulations! You've achieved excellent air quality and helped protect our environment!
                </Text>
                
                <Grid templateColumns="repeat(3, 1fr)" gap={4} w="100%">
                  <Stat textAlign="center">
                    <StatLabel>Final Score</StatLabel>
                    <StatNumber color="blue.500">{score}</StatNumber>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>Max Combo</StatLabel>
                    <StatNumber color="orange.500">x{combo}</StatNumber>
                  </Stat>
                  <Stat textAlign="center">
                    <StatLabel>Clean Actions</StatLabel>
                    <StatNumber color="green.500">{gameStats.cleanActions}</StatNumber>
                  </Stat>
                </Grid>
                
                <Alert status="success" borderRadius="lg">
                  <AlertIcon />
                  <Text>Your efforts contribute to a cleaner, healthier planet for everyone!</Text>
                </Alert>
                
                <HStack spacing={4}>
                  <Button colorScheme="green" size="lg" onClick={backToHome}>
                    Play Another Game
                  </Button>
                  <Button variant="outline" onClick={onWinClose}>
                    Continue
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Enhanced Lose Modal */}
        <Modal isOpen={isLoseOpen} onClose={onLoseClose} size="lg">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent bg={cardBg} borderRadius="2xl" shadow="2xl">
            <ModalHeader>
              <VStack spacing={2}>
                <Text fontSize="3xl">🌫️</Text>
                <Heading color="orange.500">Mission Incomplete</Heading>
              </VStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={6}>
                <Text fontSize="xl" textAlign="center" color={textColor}>
                  The air quality needs more attention, but every effort counts! 
                  Environmental protection is a continuous journey.
                </Text>
                
                <Alert status="info" borderRadius="lg">
                  <AlertIcon />
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">Remember:</Text>
                    <Text fontSize="sm">Small consistent actions create big environmental changes over time.</Text>
                  </VStack>
                </Alert>
                
                <HStack spacing={4}>
                  <Button colorScheme="blue" size="lg" onClick={backToHome}>
                    Try Again
                  </Button>
                  <Button variant="outline" onClick={onLoseClose}>
                    Continue
                  </Button>
                </HStack>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        {/* Stats Modal */}
        <Modal isOpen={isStatsOpen} onClose={onStatsClose} size="lg">
          <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(10px)" />
          <ModalContent bg={cardBg} borderRadius="2xl" shadow="2xl">
            <ModalHeader>
              <HStack>
                <Text fontSize="2xl">📊</Text>
                <Heading color={accentColor}>Your Environmental Impact</Heading>
              </HStack>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <VStack spacing={6}>
                <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4} w="100%">
                  <Card bg="blue.50" borderColor="blue.200" borderWidth="2px">
                    <CardBody textAlign="center">
                      <Stat>
                        <StatLabel color="blue.600">Games Played</StatLabel>
                        <StatNumber fontSize="3xl" color="blue.500">{gameStats.totalGamesPlayed}</StatNumber>
                        <StatHelpText>Total sessions</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card bg="purple.50" borderColor="purple.200" borderWidth="2px">
                    <CardBody textAlign="center">
                      <Stat>
                        <StatLabel color="purple.600">High Score</StatLabel>
                        <StatNumber fontSize="3xl" color="purple.500">{gameStats.highScore}</StatNumber>
                        <StatHelpText>Personal best</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card bg="green.50" borderColor="green.200" borderWidth="2px">
                    <CardBody textAlign="center">
                      <Stat>
                        <StatLabel color="green.600">Clean Actions</StatLabel>
                        <StatNumber fontSize="3xl" color="green.500">{gameStats.cleanActions}</StatNumber>
                        <StatHelpText>Environmental impact</StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </Grid>
                
                <Alert status="success" borderRadius="lg">
                  <AlertIcon />
                  <VStack align="start">
                    <Text fontWeight="bold">Environmental Hero Level:</Text>
                    <Text>
                      {gameStats.cleanActions >= 100 ? '🌟 Master Guardian' :
                       gameStats.cleanActions >= 50 ? '🌿 Eco Warrior' :
                       gameStats.cleanActions >= 20 ? '🌱 Green Defender' :
                       '🌾 Nature Friend'}
                    </Text>
                  </VStack>
                </Alert>
                
                <Button colorScheme="blue" size="lg" onClick={onStatsClose} w="100%">
                  Continue Protecting Our Environment
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Container>
  );
};

export default AirPurifierGames;
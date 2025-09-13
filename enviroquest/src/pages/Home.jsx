import React, { useState, useEffect, useRef } from "react";
import {
  Box, Flex, Heading, Text, Button, VStack, HStack,
  Container, Badge, Card, CardBody, Stat, StatLabel,
  StatNumber, SimpleGrid, Image, Progress, useDisclosure,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody,
  ModalFooter, ModalCloseButton, Grid, GridItem, Icon,
  useColorModeValue, Avatar, AvatarGroup, Tooltip,
  Divider, Center
} from "@chakra-ui/react";
import { ChevronRightIcon, StarIcon, CheckCircleIcon } from "@chakra-ui/icons";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, useAnimation } from "framer-motion";
import { useAuth } from "../context/AuthContext";

// Enhanced keyframes
const float = keyframes`0%,100%{transform:translateY(0px) rotate(0deg);}50%{transform:translateY(-20px) rotate(180deg);}`;
const pulse = keyframes`0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.05);opacity:0.8;}`;
const shimmer = keyframes`0%{background-position:-200px 0;}100%{background-position:calc(200px + 100%) 0;}`;
const bounce = keyframes`0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}`;
const glow = keyframes`0%,100%{box-shadow:0 0 20px rgba(59, 130, 246, 0.5);}50%{box-shadow:0 0 30px rgba(147, 51, 234, 0.7);}`;

// Motion components
const MotionBox = motion(Box);
const MotionCard = motion(Card);
const MotionButton = motion(Button);

// Enhanced Icons with gradients
const GlobeIcon = ({ size = "4xl" }) => (
  <Text fontSize={size} filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))">🌍</Text>
);
const LeafIcon = ({ size = "2xl" }) => (
  <Text fontSize={size} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))">🌱</Text>
);
const AwardIcon = ({ size = "2xl" }) => (
  <Text fontSize={size} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))">🏆</Text>
);
const UsersIcon = ({ size = "2xl" }) => (
  <Text fontSize={size} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))">👥</Text>
);
const TargetIcon = ({ size = "2xl" }) => (
  <Text fontSize={size} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))">🎯</Text>
);
const TrendingUpIcon = ({ size = "2xl" }) => (
  <Text fontSize={size} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))">📈</Text>
);
const ZapIcon = ({ size = "2xl" }) => (
  <Text fontSize={size} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))">⚡</Text>
);
const RocketIcon = ({ size = "2xl" }) => (
  <Text fontSize={size} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))">🚀</Text>
);

export default function Home() {
  const [currentStat, setCurrentStat] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [currentQuote, setCurrentQuote] = useState(0);
  const [progress, setProgress] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();
  const controls = useAnimation();
  const ref = useRef(null);
  const inView = useInView(ref);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Color mode values
  const bg = useColorModeValue("white", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const mutedText = useColorModeValue("gray.600", "gray.400");

  // Enhanced stats with more data
  const stats = [
    { number: "50K+", label: "Eco Warriors", icon: UsersIcon, color: "blue", detail: "Active learners worldwide" },
    { number: "1M+", label: "Questions Answered", icon: TargetIcon, color: "green", detail: "Knowledge shared daily" },
    { number: "95%", label: "Success Rate", icon: TrendingUpIcon, color: "purple", detail: "Learning achievement" },
    { number: "200+", label: "Topics Covered", icon: GlobeIcon, color: "orange", detail: "Environmental subjects" },
  ];

  // Inspiring quotes
  const quotes = [
    "The Earth does not belong to us; we belong to the Earth.",
    "Small acts, when multiplied by millions, can transform the world.",
    "Be the change you wish to see in the world.",
    "Every day is Earth Day when you're an Eco Champion."
  ];

  // Enhanced features with more details
  const features = [
    {
      step: "01",
      title: "Discover Your Impact",
      description: "Start with a personalized assessment to understand your current environmental knowledge and get customized learning paths.",
      color: "blue",
      icon: LeafIcon,
      benefits: ["Personalized learning", "Progress tracking", "Skill assessment"],
      duration: "5 min"
    },
    {
      step: "02",
      title: "Learn & Challenge",
      description: "Engage with interactive quizzes covering climate change, sustainability, wildlife conservation, and renewable energy.",
      color: "purple",
      icon: ZapIcon,
      benefits: ["Interactive content", "Real-world scenarios", "Expert insights"],
      duration: "15-30 min"
    },
    {
      step: "03",
      title: "Earn Recognition",
      description: "Unlock badges, climb leaderboards, and join a community of environmental champions making real difference.",
      color: "cyan",
      icon: AwardIcon,
      benefits: ["Achievement badges", "Community ranking", "Networking"],
      duration: "Ongoing"
    },
  ];



  // Typewriter effect
  useEffect(() => {
    const text = "Play. Learn. Protect.";
    let i = 0;
    const timer = setInterval(() => {
      setTypedText(text.slice(0, i));
      i++;
      if (i > text.length) {
        i = 0;
        setTypedText("");
      }
    }, 150);
    return () => clearInterval(timer);
  }, []);

  // Stats rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [stats.length]);

  // Quote rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [quotes.length]);

  // Progress animation
  useEffect(() => {
    const timer = setTimeout(() => setProgress(85), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll animations
  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const CurrentStatIcon = stats[currentStat].icon;

  return (
    <Box bgGradient="linear(to-br, blue.50, purple.50, cyan.50)" minH="100vh" position="relative" overflow="hidden">
      {/* Enhanced Background Elements */}
      <Box position="absolute" top="10%" left="5%" w="300px" h="300px" opacity="0.1" pointerEvents="none">
        <Box w="100%" h="100%" bgGradient="radial(circle, blue.400, transparent)" borderRadius="full" animation={`${pulse} 4s infinite`} />
      </Box>
      <Box position="absolute" top="60%" right="10%" w="200px" h="200px" opacity="0.1" pointerEvents="none">
        <Box w="100%" h="100%" bgGradient="radial(circle, purple.400, transparent)" borderRadius="full" animation={`${bounce} 3s infinite`} />
      </Box>
      <Box position="absolute" bottom="10%" left="20%" w="150px" h="150px" opacity="0.1" pointerEvents="none">
        <Box w="100%" h="100%" bgGradient="radial(circle, cyan.400, transparent)" borderRadius="full" animation={`${pulse} 5s infinite`} />
      </Box>

      <Container maxW="7xl" py={8} position="relative" zIndex={10}>
        {/* Hero Section */}
        <MotionBox
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <VStack spacing={12} textAlign="center" mb={20}>
            {/* Logo with enhanced animation */}
            <Box position="relative">
              <MotionBox
                w={{ base: "20", md: "24" }}
                h={{ base: "20", md: "24" }}
                bgGradient="linear(to-r, blue.500, purple.600, cyan.500)"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="2xl"
                animation={`${glow} 3s infinite`}
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <GlobeIcon size="5xl" />
              </MotionBox>
              <Box
                position="absolute"
                top="-2"
                right="-2"
                w="8"
                h="8"
                bgGradient="linear(to-r, yellow.400, orange.500)"
                borderRadius="full"
                animation={`${bounce} 2s infinite`}
                boxShadow="lg"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <StarIcon color="white" boxSize={4} />
              </Box>
            </Box>

            {/* Enhanced Heading */}
            {/* Enhanced Heading */}
<VStack spacing={6}>
  <Heading size={{ base: "2xl", md: "4xl" }} color={textColor} fontWeight="bold">
    {user ? `Welcome back, ${user.displayName || 'Eco Champion'}!` : '✨Together we can build a greener tomorrow. ✨'}
  </Heading>
  <Heading
    size={{ base: "3xl", md: "5xl" }}
    bgGradient="linear(to-r, blue.600, purple.600, cyan.600)"
    bgClip="text"
    fontWeight="bold"
    position="relative"
  >
    Eco Champion
    <Text fontSize="lg" color="green.500" mt={2} fontWeight="semibold" minH="30px">
      {typedText}
      <Box as="span" animation={`${pulse} 1s infinite`} ml={1}>|</Box>
    </Text>
  </Heading>
</VStack>

            {/* Quote Section */}
            <MotionBox
              key={currentQuote}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              maxW="4xl"
            >
              <Text fontSize={{ base: "lg", md: "xl" }} color={mutedText} fontStyle="italic" textAlign="center" lineHeight="tall">
                "{quotes[currentQuote]}"
              </Text>
            </MotionBox>

            {/* Enhanced Stats Card */}
            <MotionCard
              bg="whiteAlpha.90"
              backdropFilter="blur(20px)"
              borderRadius="3xl"
              p={8}
              maxW="lg"
              boxShadow="2xl"
              border="1px"
              borderColor="whiteAlpha.300"
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ duration: 0.3 }}
            >
              <CardBody>
                <VStack spacing={6}>
                  <HStack spacing={8} justify="center" align="center">
                    <MotionBox
                      animation={`${bounce} 2s infinite`}
                      whileHover={{ scale: 1.2, rotate: 15 }}
                    >
                      <CurrentStatIcon size="3xl" />
                    </MotionBox>
                    <VStack spacing={1} align="center">
                      <Stat textAlign="center">
                        <StatNumber fontSize="5xl" fontWeight="bold" color={textColor}>
                          {stats[currentStat].number}
                        </StatNumber>
                        <StatLabel fontSize="md" color={mutedText} fontWeight="medium">
                          {stats[currentStat].label}
                        </StatLabel>
                      </Stat>
                    </VStack>
                  </HStack>
                  <Text fontSize="sm" color={mutedText} textAlign="center">
                    {stats[currentStat].detail}
                  </Text>
                  <Progress
                    value={progress}
                    size="sm"
                    colorScheme={stats[currentStat].color}
                    borderRadius="full"
                    bg="gray.200"
                    w="100%"
                  />
                </VStack>
              </CardBody>
            </MotionCard>

            {/* Enhanced CTA Buttons */}
            <HStack spacing={6} flexWrap="wrap" justify="center">
              <MotionButton
                size="lg"
                bgGradient="linear(to-r, blue.600, purple.700)"
                color="white"
                px={12}
                py={8}
                borderRadius="full"
                fontSize="lg"
                fontWeight="bold"
                rightIcon={<ChevronRightIcon />}
                boxShadow="xl"
                _hover={{ bgGradient: "linear(to-r, blue.700, purple.800)" }}
                onClick={() => navigate(user ? "/quizzes" : "/quizzes")}
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                {user ? "Continue Learning" : "Start Your Journey"}
              </MotionButton>
            </HStack>

            {/* User Avatars */}
            <VStack spacing={4}>
              <Text fontSize="sm" color={mutedText}>
                Join <Text as="span" fontWeight="bold" color="blue.600">50,000+</Text> environmental champions
              </Text>
            </VStack>
          </VStack>
        </MotionBox>

        {/* Enhanced Features Section */}
        <MotionBox
          ref={ref}
          initial={{ opacity: 0 }}
          animate={controls}
          variants={{
            visible: { opacity: 1, y: 0 },
            hidden: { opacity: 0, y: 50 }
          }}
          transition={{ duration: 0.6 }}
        >
          <VStack spacing={16} mb={20}>
            <VStack spacing={6} textAlign="center">
              <Badge colorScheme="blue" px={4} py={2} borderRadius="full" fontSize="sm" fontWeight="bold">
                YOUR LEARNING PATH
              </Badge>
              <Heading size="2xl" color={textColor} fontWeight="bold">
                Master Environmental Knowledge in 3 Steps
              </Heading>
              <Text fontSize="xl" color={mutedText} maxW="3xl" lineHeight="tall">
                A structured approach to becoming an environmental expert with personalized learning, 
                interactive challenges, and community recognition.
              </Text>
            </VStack>

            <Grid templateColumns={{ base: "1fr", lg: "repeat(3, 1fr)" }} gap={8} w="100%">
              {features.map((feature, index) => (
                <MotionCard
                  key={index}
                  bg={cardBg}
                  borderRadius="3xl"
                  p={8}
                  boxShadow="xl"
                  border="1px"
                  borderColor="gray.100"
                  h="100%"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ y: -10, boxShadow: "2xl" }}
                >
                  <CardBody>
                    <VStack align="start" spacing={6} h="100%">
                      <HStack>
                        <Badge 
                          fontSize="lg" 
                          fontWeight="bold" 
                          colorScheme={feature.color}
                          px={3}
                          py={1}
                          borderRadius="full"
                        >
                          {feature.step}
                        </Badge>
                        <Badge variant="outline" colorScheme="gray" fontSize="xs">
                          {feature.duration}
                        </Badge>
                      </HStack>
                      
                      <MotionBox
                        w="20"
                        h="20"
                        bgGradient={`linear(to-r, ${feature.color}.400, ${feature.color}.600)`}
                        borderRadius="2xl"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        boxShadow="lg"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <feature.icon size="3xl" />
                      </MotionBox>

                      <VStack align="start" spacing={4} flex={1}>
                        <Heading size="lg" color={textColor} fontWeight="bold">
                          {feature.title}
                        </Heading>
                        <Text color={mutedText} lineHeight="tall">
                          {feature.description}
                        </Text>
                        
                        <VStack align="start" spacing={2} w="100%">
                          {feature.benefits.map((benefit, i) => (
                            <HStack key={i} spacing={2}>
                              <CheckCircleIcon color={`${feature.color}.500`} boxSize={4} />
                              <Text fontSize="sm" color={mutedText}>{benefit}</Text>
                            </HStack>
                          ))}
                        </VStack>
                      </VStack>
                    </VStack>
                  </CardBody>
                </MotionCard>
              ))}
            </Grid>
          </VStack>
        </MotionBox>


        {/* Enhanced CTA Banner */}
        <MotionCard
          bgGradient="linear(to-r, blue.600, purple.700, cyan.600)"
          borderRadius="3xl"
          p={{ base: 8, md: 16 }}
          color="white"
          textAlign="center"
          boxShadow="2xl"
          position="relative"
          overflow="hidden"
          whileHover={{ scale: 1.02, y: -5 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background Pattern */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bgGradient="linear(45deg, transparent 30%, whiteAlpha.100 50%, transparent 70%)"
            animation={`${shimmer} 3s infinite`}
          />
          
          <CardBody position="relative" zIndex={1}>
            <VStack spacing={8}>
              <MotionBox
                w="32"
                h="32"
                bg="whiteAlpha.200"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="xl"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <RocketIcon size="4xl" />
              </MotionBox>
              
              <VStack spacing={4}>
                <Heading size={{ base: "xl", md: "2xl" }} fontWeight="bold">
                  Ready to Transform Your Environmental Knowledge?
                </Heading>
                <Text fontSize={{ base: "lg", md: "xl" }} opacity="0.9" maxW="4xl" lineHeight="tall">
                  Join our global community of environmental champions and embark on an interactive 
                  learning journey that makes a real difference for our planet.
                </Text>
              </VStack>
              
              <HStack spacing={6} flexWrap="wrap" justify="center">
                <MotionButton
                  size="lg"
                  bg="white"
                  color="blue.700"
                  px={12}
                  py={6}
                  borderRadius="full"
                  fontSize="lg"
                  fontWeight="bold"
                  rightIcon={<ChevronRightIcon />}
                  boxShadow="xl"
                  _hover={{ bg: "gray.50" }}
                  onClick={() => navigate(user ? "/dashboard" : "/signup")}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user ? "Continue Journey" : "Start Free Today"}
                </MotionButton>
                
                <Button
                  size="lg"
                  variant="outline"
                  borderColor="whiteAlpha.500"
                  color="white"
                  px={8}
                  py={6}
                  borderRadius="full"
                  fontSize="lg"
                  fontWeight="medium"
                  _hover={{ bg: "whiteAlpha.200", borderColor: "white" }}
                  onClick={() => navigate("/quizzes")}
                >
                  Explore Quizzes
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </MotionCard>
      </Container>

      {/* Assessment Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent borderRadius="2xl" bg={cardBg}>
          <ModalHeader>
            <VStack spacing={4}>
              <ZapIcon size="3xl" />
              <Heading size="lg" textAlign="center" color={textColor}>
                Quick Environmental Assessment
              </Heading>
            </VStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={6}>
              <Text color={mutedText} textAlign="center" lineHeight="tall">
                Discover your environmental knowledge level and get personalized 
                learning recommendations in just 5 minutes!
              </Text>
              
              <SimpleGrid columns={2} spacing={4} w="100%">
                <Box textAlign="center" p={4} bg="blue.50" borderRadius="xl">
                  <Text fontWeight="bold" color="blue.700" fontSize="2xl">5</Text>
                  <Text fontSize="sm" color="blue.600">Minutes</Text>
                </Box>
                <Box textAlign="center" p={4} bg="green.50" borderRadius="xl">
                  <Text fontWeight="bold" color="green.700" fontSize="2xl">20</Text>
                  <Text fontSize="sm" color="green.600">Questions</Text>
                </Box>
              </SimpleGrid>
              
              <VStack spacing={2} w="100%">
                <HStack spacing={2}>
                  <CheckCircleIcon color="green.500" />
                  <Text fontSize="sm" color={mutedText}>Personalized learning path</Text>
                </HStack>
                <HStack spacing={2}>
                  <CheckCircleIcon color="green.500" />
                  <Text fontSize="sm" color={mutedText}>Knowledge gap analysis</Text>
                </HStack>
                <HStack spacing={2}>
                  <CheckCircleIcon color="green.500" />
                  <Text fontSize="sm" color={mutedText}>Skill level certification</Text>
                </HStack>
              </VStack>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <HStack spacing={4} w="100%">
              <Button
                flex={1}
                colorScheme="blue"
                size="lg"
                borderRadius="xl"
                onClick={() => {
                  onClose();
                  navigate("/assessment");
                }}
              >
                Start Assessment
              </Button>
              <Button
                flex={1}
                variant="ghost"
                size="lg"
                onClick={onClose}
              >
                Maybe Later
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
import React, { useState, useEffect } from "react";
import {
  Box, Flex, Heading, Text, Button, VStack, HStack,
  Container, Icon, Badge, Card, CardBody, Stat,
  StatLabel, StatNumber, SimpleGrid
} from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { keyframes } from "@emotion/react";
import { useNavigate } from "react-router-dom";

// 🔹 Keyframes
const float = keyframes`0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}`;
const pulse = keyframes`0%,100%{transform:scale(1);opacity:1;}50%{transform:scale(1.1);opacity:.8;}`;
const spin = keyframes`from{transform:rotate(0deg);}to{transform:rotate(360deg);}`;
const bounce = keyframes`0%,100%{transform:translateY(0);}50%{transform:translateY(-5px);}`;

// 🔹 Mock Icons
const GlobeIcon = () => <Text fontSize="4xl">🌍</Text>;
const LeafIcon = () => <Text fontSize="2xl">🌱</Text>;
const AwardIcon = () => <Text fontSize="2xl">🏆</Text>;
const UsersIcon = () => <Text fontSize="2xl">👥</Text>;
const TargetIcon = () => <Text fontSize="2xl">🎯</Text>;
const TrendingUpIcon = () => <Text fontSize="2xl">📈</Text>;
const ZapIcon = () => <Text fontSize="2xl">⚡</Text>;

export default function Home() {
  const [currentStat, setCurrentStat] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  // 🔹 Stats & Features
  const stats = [
    { number: "50K+", label: "Eco Warriors", icon: UsersIcon },
    { number: "1M+", label: "Questions Answered", icon: TargetIcon },
    { number: "95%", label: "Learning Success Rate", icon: TrendingUpIcon },
    { number: "200+", label: "Environmental Topics", icon: GlobeIcon },
  ];

  const features = [
    {
      step: "01",
      title: "Discover Your Impact",
      description:
        "Start with a personalized assessment to understand your current environmental knowledge and get customized quiz recommendations.",
      color: "blue",
      icon: LeafIcon,
    },
    {
      step: "02",
      title: "Learn & Challenge",
      description:
        "Engage with interactive quizzes covering climate change, sustainability, wildlife conservation, and renewable energy.",
      color: "purple",
      icon: ZapIcon,
    },
    {
      step: "03",
      title: "Earn Recognition",
      description:
        "Unlock badges, climb leaderboards, and join a community of environmental champions making a real difference.",
      color: "cyan",
      icon: AwardIcon,
    },
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const CurrentStatIcon = stats[currentStat].icon;

  return (
    <Box bgGradient="linear(to-br, white, blue.50, purple.50)" minH="100vh" position="relative">
      {/* Background Animations */}
      <Box position="absolute" top="20" left="10" w="16" h="16" opacity="0.3">
        <Box w="100%" h="100%" bg="blue.200" borderRadius="full" animation={`${pulse} 3s infinite`} />
      </Box>
      <Box position="absolute" top="40" right="20" w="12" h="12" opacity="0.4">
        <Box w="100%" h="100%" bg="purple.200" borderRadius="full" animation={`${bounce} 2s infinite`} />
      </Box>
      <Box position="absolute" bottom="20" left="20" w="20" h="20" opacity="0.25">
        <Box w="100%" h="100%" bg="cyan.200" borderRadius="full" animation={`${pulse} 4s infinite`} />
      </Box>

      <Container maxW="7xl" py={12} position="relative" zIndex={10}>
        {/* Hero Section */}
        <VStack
          spacing={8}
          textAlign="center"
          mb={20}
          opacity={isVisible ? 1 : 0}
          transform={isVisible ? "translateY(0)" : "translateY(40px)"}
          transition="all 1s ease-in-out"
        >
          {/* Logo */}
          <Box position="relative">
            <Box
              w="20"
              h="20"
              bgGradient="linear(to-r, blue.500, purple.600)"
              borderRadius="full"
              display="flex"
              alignItems="center"
              justifyContent="center"
              boxShadow="xl"
              animation={`${spin} 8s linear infinite`}
            >
              <GlobeIcon />
            </Box>
            <Box
              position="absolute"
              top="-2"
              right="-2"
              w="6"
              h="6"
              bg="yellow.400"
              borderRadius="full"
              animation={`${pulse} 2s infinite`}
              boxShadow="sm"
            />
          </Box>

          {/* Heading */}
          <VStack spacing={4}>
            <Heading size="4xl" color="gray.800" fontWeight="bold">
              Become an
            </Heading>
            <Heading
              size="4xl"
              bgGradient="linear(to-r, blue.600, purple.600)"
              bgClip="text"
              animation={`${pulse} 3s infinite`}
              fontWeight="bold"
            >
              Eco Champion
            </Heading>
          </VStack>

          {/* Subtitle */}
          <Text fontSize={{ base: "xl", md: "2xl" }} color="gray.600" maxW="4xl">
            Join thousands of environmental enthusiasts in the most engaging way to learn about our planet.{" "}
            <Text as="span" color="blue.700" fontWeight="semibold">
              Every answer matters!
            </Text>
          </Text>

          {/* Stats */}
          <Card bg="whiteAlpha.900" backdropFilter="blur(10px)" borderRadius="2xl" p={6} maxW="md" boxShadow="xl">
            <CardBody>
              <HStack spacing={6} justify="center">
                <Box animation={`${bounce} 2s infinite`}>
                  <CurrentStatIcon />
                </Box>
                <VStack spacing={1}>
                  <Stat textAlign="center">
                    <StatNumber fontSize="4xl" fontWeight="bold" color="gray.800">
                      {stats[currentStat].number}
                    </StatNumber>
                    <StatLabel fontSize="sm" color="gray.500" fontWeight="medium">
                      {stats[currentStat].label}
                    </StatLabel>
                  </Stat>
                </VStack>
              </HStack>
            </CardBody>
          </Card>

          {/* CTA */}
          <HStack spacing={6} flexWrap="wrap" justify="center">
            <Button
              size="lg"
              bgGradient="linear(to-r, blue.600, purple.700)"
              color="white"
              px={10}
              py={6}
              borderRadius="full"
              fontSize="lg"
              fontWeight="semibold"
              rightIcon={<ChevronRightIcon />}
              _hover={{ bgGradient: "linear(to-r, blue.700, purple.800)", transform: "scale(1.05)", boxShadow: "xl" }}
              onClick={() => navigate("/quizzes")}
            >
              Start Your Journey
            </Button>
            <Button
              size="lg"
              variant="outline"
              borderColor="blue.500"
              color="blue.700"
              bg="white"
              px={10}
              py={6}
              borderRadius="full"
              fontSize="lg"
              fontWeight="semibold"
              rightIcon={<Text>🎯</Text>}
              _hover={{ bg: "blue.50", transform: "scale(1.05)", borderColor: "blue.600" }}
              onClick={() => navigate("/assessment")}
            >
              Take Quick Assessment
            </Button>
          </HStack>
        </VStack>

        {/* Features */}
        <VStack spacing={16} mb={20}>
          <VStack spacing={6} textAlign="center">
            <Heading size="2xl" color="gray.800" fontWeight="bold">
              Your Path to Environmental Mastery
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="2xl">
              Three simple steps to becoming an eco-conscious expert
            </Text>
          </VStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8} w="100%">
            {features.map((feature, index) => (
              <Card
                key={index}
                bg="white"
                borderRadius="3xl"
                p={6}
                boxShadow="xl"
                border="1px"
                borderColor="gray.100"
                transition="all 0.5s ease"
                opacity={isVisible ? 1 : 0}
                transform={isVisible ? "translateY(0)" : "translateY(40px)"}
                transitionDelay={`${index * 200}ms`}
                h="100%"
              >
                <CardBody>
                  <VStack align="start" spacing={6} h="100%">
                    <Badge fontSize="2xl" fontWeight="bold" color={`${feature.color}.700`} bg="transparent">
                      {feature.step}
                    </Badge>
                    <Box
                      w="16"
                      h="16"
                      bgGradient={`linear(to-r, ${feature.color}.400, ${feature.color}.600)`}
                      borderRadius="2xl"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      boxShadow="lg"
                      transition="transform 0.3s ease"
                    >
                      <feature.icon />
                    </Box>
                    <VStack align="start" spacing={4} flex={1}>
                      <Heading size="lg" color="gray.800" fontWeight="bold">
                        {feature.title}
                      </Heading>
                      <Text color="gray.600" lineHeight="tall">
                        {feature.description}
                      </Text>
                    </VStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        </VStack>

        {/* CTA Banner */}
        <Card
          bgGradient="linear(to-r, blue.600, purple.700, blue.800)"
          borderRadius="3xl"
          p={{ base: 8, md: 16 }}
          color="white"
          textAlign="center"
          boxShadow="2xl"
          position="relative"
        >
          <CardBody>
            <VStack spacing={8}>
              <Box
                w="24"
                h="24"
                bg="whiteAlpha.200"
                borderRadius="full"
                display="flex"
                alignItems="center"
                justifyContent="center"
                boxShadow="lg"
                animation={`${pulse} 3s infinite`}
              >
                <LeafIcon />
              </Box>
              <Heading size={{ base: "xl", md: "2xl" }} fontWeight="bold">
                Ready to Make a Difference?
              </Heading>
              <Text fontSize={{ base: "lg", md: "xl" }} opacity="0.9" maxW="3xl" lineHeight="tall">
                Join our community of environmental champions and start your journey towards a more sustainable future today!
              </Text>
              <Button
                size="lg"
                bg="white"
                color="blue.700"
                px={10}
                py={6}
                borderRadius="full"
                fontSize="lg"
                fontWeight="bold"
                rightIcon={<ChevronRightIcon />}
                _hover={{ bg: "gray.50", transform: "scale(1.05)" }}
                onClick={() => navigate("/signup")}
              >
                Get Started Now
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}

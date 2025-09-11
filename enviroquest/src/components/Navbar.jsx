import React from "react";
import {
  Box,
  Flex,
  Heading,
  Spacer,
  Button,
  Link,
  IconButton,
  HStack,
  VStack,
  useDisclosure,
  Collapse,
  Image,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Container,
  useColorModeValue,
  Stack,
  Avatar,
  MenuDivider,
} from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  HamburgerIcon, 
  CloseIcon, 
  ChevronDownIcon,
  SettingsIcon,
  InfoIcon 
} from "@chakra-ui/icons";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/generated-image.png";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onToggle, onClose } = useDisclosure();

  // Color mode values for better theming
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.200");
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
      onClose(); // Close mobile menu if open
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const MotionBox = motion(Box);
  const MotionFlex = motion(Flex);

  // Navigation items for easier management
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Quizzes", path: "/quizzes" },
  ];

  const gameItems = [
    { name: "Biotic vs Abiotic", path: "/game-biotic-abiotic" },
    { name: "Waste Segregation", path: "/game-waste-segregation" },
    { name: "Plant Care", path: "/game-plant-care" },
    { name: "River Cleaning", path: "/rivercleaning" },
  ];

  return (
    <MotionBox
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      position="sticky"
      top="0"
      zIndex="1000"
      backdropFilter="blur(10px)"
      boxShadow="sm"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Container maxW="7xl" px={{ base: 4, md: 6 }}>
        <Flex alignItems="center" py={{ base: 3, md: 4 }} minH="60px">
          {/* Logo Section */}
          <MotionFlex
            alignItems="center"
            gap={3}
            cursor="pointer"
            onClick={() => {
              navigate("/");
              onClose();
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            flex="0 0 auto"
          >
            <Image 
              src={logo} 
              alt="ECO-SHALLA Logo" 
              boxSize={{ base: "32px", md: "36px" }}
              borderRadius="md"
            />
            <Heading
              size={{ base: "sm", md: "md" }}
              color="teal.500"
              letterSpacing="wide"
              fontWeight="bold"
              display={{ base: "none", sm: "block" }}
            >
              ECO-SHALLA
            </Heading>
            <Text
              fontSize={{ base: "lg", sm: "xl" }}
              color="teal.500"
              fontWeight="bold"
              display={{ base: "block", sm: "none" }}
            >
              ECO
            </Text>
          </MotionFlex>

          <Spacer />

          {/* Desktop Navigation */}
          <HStack 
            spacing={1} 
            alignItems="center" 
            display={{ base: "none", lg: "flex" }}
          >
            {navItems.map((item) => (
              <Link
                key={item.name}
                as={RouterLink}
                to={item.path}
                px={4}
                py={2}
                rounded="md"
                fontWeight="medium"
                color={textColor}
                _hover={{
                  textDecoration: "none",
                  bg: "teal.50",
                  color: "teal.600",
                  transform: "translateY(-1px)",
                }}
                transition="all 0.2s"
              >
                {item.name}
              </Link>
            ))}

            {/* Games Dropdown - Desktop */}
            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                variant="ghost"
                fontWeight="medium"
                color={textColor}
                _hover={{
                  bg: "teal.50",
                  color: "teal.600",
                }}
                _active={{
                  bg: "teal.100",
                }}
              >
                Games
              </MenuButton>
              <MenuList
                border="1px"
                borderColor={borderColor}
                boxShadow="xl"
                minW="200px"
              >
                {gameItems.map((game) => (
                  <MenuItem
                    key={game.name}
                    as={RouterLink}
                    to={game.path}
                    _hover={{ bg: "teal.50" }}
                    fontWeight="medium"
                  >
                    {game.name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>

            {user && (
              <Link
                as={RouterLink}
                to="/dashboard"
                px={4}
                py={2}
                rounded="md"
                fontWeight="medium"
                color={textColor}
                _hover={{
                  textDecoration: "none",
                  bg: "teal.50",
                  color: "teal.600",
                  transform: "translateY(-1px)",
                }}
                transition="all 0.2s"
              >
                Dashboard
              </Link>
            )}
          </HStack>

          {/* Auth Buttons - Desktop */}
          <HStack spacing={3} ml={6} display={{ base: "none", lg: "flex" }}>
            {!user ? (
              <>
                <Button
                  as={RouterLink}
                  to="/login"
                  variant="ghost"
                  colorScheme="teal"
                  size="sm"
                  fontWeight="medium"
                >
                  Login
                </Button>
                <Button
                  as={RouterLink}
                  to="/signup"
                  colorScheme="teal"
                  size="sm"
                  fontWeight="medium"
                  _hover={{ transform: "translateY(-1px)" }}
                  transition="all 0.2s"
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <Menu>
                <MenuButton>
                  <Avatar size="sm" name={user?.displayName || user?.email} />
                </MenuButton>
                <MenuList>
                  <MenuItem as={RouterLink} to="/dashboard" icon={<SettingsIcon />}>
                    Dashboard
                  </MenuItem>
                  <MenuItem as={RouterLink} to="/profile" icon={<InfoIcon />}>
                    Profile
                  </MenuItem>
                  <MenuDivider />
                  <MenuItem onClick={handleLogout} color="red.500">
                    Sign Out
                  </MenuItem>
                </MenuList>
              </Menu>
            )}
          </HStack>

          {/* Mobile Menu Toggle */}
          <IconButton
            aria-label={isOpen ? "Close menu" : "Open menu"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            display={{ lg: "none" }}
            onClick={onToggle}
            variant="ghost"
            size="md"
            ml={4}
            _hover={{
              bg: "teal.50",
              transform: "scale(1.05)",
            }}
            transition="all 0.2s"
          />
        </Flex>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <MotionBox
              display={{ lg: "none" }}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              overflow="hidden"
            >
              <VStack
                spacing={1}
                pb={4}
                align="stretch"
                divider={<Box h="1px" bg="gray.100" />}
              >
                {navItems.map((item, index) => (
                  <MotionBox
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      as={RouterLink}
                      to={item.path}
                      display="block"
                      px={4}
                      py={3}
                      fontWeight="medium"
                      color={textColor}
                      _hover={{
                        textDecoration: "none",
                        bg: "teal.50",
                        color: "teal.600",
                      }}
                      onClick={onClose}
                    >
                      {item.name}
                    </Link>
                  </MotionBox>
                ))}

                {/* Games Section - Mobile */}
                <MotionBox
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Box px={4} py={2}>
                    <Text fontWeight="semibold" fontSize="sm" color="gray.500" mb={2}>
                      GAMES
                    </Text>
                    <Stack spacing={1}>
                      {gameItems.map((game) => (
                        <Link
                          key={game.name}
                          as={RouterLink}
                          to={game.path}
                          display="block"
                          px={2}
                          py={2}
                          fontSize="sm"
                          fontWeight="medium"
                          color={textColor}
                          _hover={{
                            textDecoration: "none",
                            bg: "teal.50",
                            color: "teal.600",
                          }}
                          onClick={onClose}
                        >
                          {game.name}
                        </Link>
                      ))}
                    </Stack>
                  </Box>
                </MotionBox>

                {user && (
                  <MotionBox
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      as={RouterLink}
                      to="/dashboard"
                      display="block"
                      px={4}
                      py={3}
                      fontWeight="medium"
                      color={textColor}
                      _hover={{
                        textDecoration: "none",
                        bg: "teal.50",
                        color: "teal.600",
                      }}
                      onClick={onClose}
                    >
                      Dashboard
                    </Link>
                  </MotionBox>
                )}

                {/* Auth Buttons - Mobile */}
                <MotionBox
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  px={4}
                  pt={3}
                >
                  {!user ? (
                    <Stack spacing={3}>
                      <Button
                        as={RouterLink}
                        to="/login"
                        variant="outline"
                        colorScheme="teal"
                        size="md"
                        onClick={onClose}
                        fontWeight="medium"
                      >
                        Login
                      </Button>
                      <Button
                        as={RouterLink}
                        to="/signup"
                        colorScheme="teal"
                        size="md"
                        onClick={onClose}
                        fontWeight="medium"
                      >
                        Sign Up
                      </Button>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      <Flex alignItems="center" gap={3} px={2}>
                        <Avatar size="sm" name={user?.displayName || user?.email} />
                        <Text fontWeight="medium" fontSize="sm">
                          {user?.displayName || user?.email}
                        </Text>
                      </Flex>
                      <Button
                        colorScheme="red"
                        variant="outline"
                        size="md"
                        onClick={handleLogout}
                        fontWeight="medium"
                      >
                        Sign Out
                      </Button>
                    </Stack>
                  )}
                </MotionBox>
              </VStack>
            </MotionBox>
          )}
        </AnimatePresence>
      </Container>
    </MotionBox>
  );
}
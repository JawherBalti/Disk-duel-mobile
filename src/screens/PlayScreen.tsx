import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  Clipboard,
  SafeAreaView,
  StyleSheet,
  TextInput,
  ScrollView,
  Dimensions,
  TouchableWithoutFeedback,
  LayoutChangeEvent,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { GamePhase, CardType, Sector, RootStackParamList } from "../lib/types";
import Modal from "../components/modal";
import Button from "../components/button";
import type { RouteProp } from "@react-navigation/native";
import { useRoute, useNavigation } from "@react-navigation/native";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Canvas, useCanvas } from "@shopify/react-native-skia";
import Disk from "../components/disk";
import io, { Socket } from "socket.io-client";
import { generateRandomSectors, getOppositePair } from "../lib/utils"; // assume these exist
import { preloadAnimations } from "../lib/preloadAnimations";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CardsModal from "../components/cards-modal";
import CardPickModal from "../components/card-pick-modal";
import SceneModal from "../components/scene-modal";
import LoadingSprites from "../components/loading-sprites";
// import {
//   attack,
//   backgroundGameover,
//   backgroundRoomMusic,
//   backgroundVictory,
//   cardPick,
//   countdownTick,
//   hit,
//   reveal,
//   tick,
// } from "../lib/audio"; // audio modules
import {
  DANGER_ANGLE,
  SAFE_ANGLE,
  BULLSEYE_ANGLE,
  HALF_DISK_START,
  CANVAS_SIZE,
  HALF_DISK_END,
  RADIUS,
  CENTER,
} from "../lib/constants";
import Svg, { Path } from "react-native-svg";
import SoundPlayer from "react-native-sound-player";

type PlayScreenRouteProp = RouteProp<RootStackParamList, "Play">;
const DISPLAY_SIZE = CANVAS_SIZE - 200;
const scale = DISPLAY_SIZE / CANVAS_SIZE;

const defaultOptions: any = {
  bgMusic: true,
  sfx: true,
};

export default function PlayScreen() {
  const route = useRoute<PlayScreenRouteProp>();
  const navigation = useNavigation();
  const safeAreaInsets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const roomId = route.params.gameCode; // non-optional

  // --- Socket ---
  const [socket, setSocket] = useState<Socket | null>(null);

  // --- Game state ---
  const [gamePhase, setGamePhase] = useState<GamePhase>("lobby");
  const [options, setOptions] = useState<any>(defaultOptions);
  const [role, setRole] = useState<"player1" | "player2" | null>(null);
  const [players, setPlayers] = useState<{ role: string; name: string }[]>([]);
  const [teamScore, setTeamScore] = useState<number>(0);
  const [hintSent, setHintSent] = useState<boolean>(false);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hint, setHint] = useState<string>("");
  const [clockHandAngle, setClockHandAngle] = useState<number | null>(null);
  const [hoverAngle, setHoverAngle] = useState<number | null>(null);
  const [guestName, setGuestName] = useState("");
  const [phase3Timer, setPhase3Timer] = useState<number | null>(null);
  const [phase3Duration, setPhase3Duration] = useState(20);
  const phase3IntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  // --- Round / lives / cards ---
  const [round, setRound] = useState(1);
  const [playerLives, setPlayerLives] = useState(3);
  const [dealerLives, setDealerLives] = useState(3);
  const [cardPicked, setCardPicked] = useState(false);
  const [revealedCardIndex, setRevealedCardIndex] = useState<number | null>(
    null,
  );
  const [revealedCardType, setRevealedCardType] = useState<CardType>(null);
  const [lastResultMessage, setLastResultMessage] = useState<string>("");

  // --- Card modal ---
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardModalDismissed, setCardModalDismissed] = useState(false);
  const [cardsZoomingOut, setCardsZoomingOut] = useState(false);

  // --- Opposite pair ---
  const [oppositePair, setOppositePair] = useState<{
    left: string;
    right: string;
  } | null>(null);

  // --- Animations / Sprites ---
  const [sprites, setSprites] = useState<Record<string, any>>({});
  // --- Scene modal ---
  const [sceneModal, setSceneModal] = useState<{
    isOpen: boolean;
    pose: string;
    messages: string[];
  }>({
    isOpen: false,
    pose: "welcome1",
    messages: [],
  });

  // --- Modal for alerts ---
  const [modal, setModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm?: () => void;
    confirmText?: string;
  }>({ isOpen: false, title: "", message: "" });

  // --- Touch / canvas refs ---
  const canvasContainerRef = useRef<View>(null);
  const latestHoverAngleRef = useRef<number | null>(null);
  const [canvasLayout, setCanvasLayout] = useState<{
    width: number;
    height: number;
    x: number;
    y: number;
  } | null>(null);

  // --- Copy room ID ---
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const copyRoomId = useCallback(() => {
    if (!roomId) return;
    try {
      Clipboard.setString(roomId);
      setCopyMessage("Room ID copied!");
      setTimeout(() => setCopyMessage(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setCopyMessage("Failed to copy");
      setTimeout(() => setCopyMessage(null), 2000);
    }
  }, [roomId]);

  // --- Modal helpers ---
  const showModal = (
    title: string,
    message: string,
    onConfirm?: () => void,
    confirmText = "OK",
  ) => {
    setModal({ isOpen: true, title, message, onConfirm, confirmText });
  };
  const closeModal = () => {
    setModal({ isOpen: false, title: "", message: "" });
  };

  // --- Navigation helper ---
  const goHome = useCallback(() => {
    navigation.navigate("Home" as any); // adjust to your home route
  }, [navigation]);

  // --- Preload sprites ---
  useEffect(() => {
    preloadAnimations().then(setSprites);
  }, []);

  // --- Socket connection ---
  useEffect(() => {
    const newSocket = io("http://localhost:3000", {
      path: "/socket.io",
      transports: ["websocket"],
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const openScene = (pose: string, messages: string[]) => {
    setSceneModal({ isOpen: true, pose, messages });
  };
  const closeScene = () => {
    setSceneModal((prev) => ({ ...prev, isOpen: false }));
  };

  // 1️⃣ Load options from AsyncStorage (replaces localStorage)
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const stored = await AsyncStorage.getItem("gameOptions");
        if (stored) {
          setOptions(JSON.parse(stored));
        } else {
          await AsyncStorage.setItem(
            "gameOptions",
            JSON.stringify(defaultOptions),
          );
          setOptions(defaultOptions);
        }
      } catch (error) {
        console.error("Failed to load options", error);
      }
    };
    loadOptions();
  }, []);

  //Control background music (REPLACE with react-native-sound)
  useEffect(() => {
    try {
      if (options.bgMusic) {
        // 1. Play the background audio file (do not include file extension)
        SoundPlayer.playSoundFile("room", "m4a");

        // 2. Enable infinite looping
        // iOS: -1 loops indefinitely. Android: non-zero integer loops indefinitely.
        SoundPlayer.setNumberOfLoops(Platform.OS === "ios" ? -1 : 1);
      } else {
        SoundPlayer.stop();
      }
    } catch (e) {
      console.log("Cannot play sound file", e);
    }
    // Clean up when the component unmounts
    return () => {
      SoundPlayer.stop();
    };
  }, [options.bgMusic]);

  // --- Timer for Phase 3 ---
  useEffect(() => {
    if (gamePhase === "phase3") {
      if (phase3IntervalRef.current) clearInterval(phase3IntervalRef.current);
      setPhase3Timer(phase3Duration);
      phase3IntervalRef.current = setInterval(() => {
        setPhase3Timer((prev) => {
          if (prev === null || prev <= 1) {
            if (phase3IntervalRef.current)
              clearInterval(phase3IntervalRef.current);
            return 0;
          }
          if (options.sfx) SoundPlayer.playSoundFile("tick", "m4a");

          return prev - 1;
        });
      }, 1000);
    } else {
      if (phase3IntervalRef.current) {
        clearInterval(phase3IntervalRef.current);
        phase3IntervalRef.current = null;
      }
      setPhase3Timer(null);
    }
    return () => {
      if (phase3IntervalRef.current) clearInterval(phase3IntervalRef.current);
    };
  }, [gamePhase, phase3Duration]);

  // --- Card modal auto-open on phase2 ---
  useEffect(() => {
    if (gamePhase === "phase2") {
      setCardModalOpen(true);
      setCardModalDismissed(false);
      setCardsZoomingOut(false);
    } else {
      setCardModalOpen(false);
      setCardModalDismissed(false);
      setCardsZoomingOut(false);
    }
  }, [gamePhase]);

  // --- Welcome scene on lobby ---
  useEffect(() => {
    if (gamePhase === "lobby" && !sceneModal.isOpen) {
      openScene("welcome1", [
        "Welcome to Disk Duel!",
        "I am the dealer. You and your partner will face me.",
        "Each round, you must avoid the danger zone on the disk.",
        "Use the categories and the hint to guess right.",
        "Good luck!",
      ]);
    }
  }, [gamePhase, sceneModal.isOpen]);

  // --- Socket event listeners ---
  useEffect(() => {
    if (!socket) return;

    socket.on("gameReady", ({ players: updatedPlayers, teamScore: score }) => {
      setPlayers(updatedPlayers);
      setTeamScore(score);
    });

    socket.on("countdownStart", ({ duration, oppositePair }) => {
      if (countdownIntervalRef.current)
        clearInterval(countdownIntervalRef.current);
      let count = duration;
      setCountdown(count);
      setSceneModal((prev) => ({ ...prev, isOpen: false }));

      if (oppositePair) {
        setOppositePair(oppositePair);
      } else {
        setOppositePair(null);
      }
      if (options.bgMusic) SoundPlayer.stop();
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null) return null;

          const newCount = prev - 1;

          if (newCount <= 0) {
            clearInterval(interval);
            countdownIntervalRef.current = null;
            return null;
          }

          return newCount;
        });

        if (options.sfx) {
          SoundPlayer.playSoundFile("countdown", "m4a");
        }
      }, 1000);
      countdownIntervalRef.current = interval;
    });

    socket.on("phaseChanged", ({ phase, timerDuration, round: newRound }) => {
      if (
        (phase === "cardSelect" || phase === "phase2") &&
        countdownIntervalRef.current
      ) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
        setCountdown(null);
      }

      if (phase === "cardSelect") {
        setCardPicked(false);
        setRevealedCardIndex(null);
        setRevealedCardType(null);
      }

      if (phase === "phase1") {
        setClockHandAngle(null);
        setHoverAngle(null);
        latestHoverAngleRef.current = null;
        setHint("");
        setHintSent(false);
        setLastResultMessage("");
      }

      if (phase === "phase2" && options.sfx)
        SoundPlayer.playSoundFile("reveal", "m4a");

      setGamePhase(phase);
      if (phase === "phase3" && timerDuration) setPhase3Duration(timerDuration);
      if (phase === "roundTransition" && newRound) setRound(newRound);
    });

    socket.on("hintUpdate", ({ hint: newHint, hintSent }) => {
      setHint(newHint);
      setHintSent(hintSent);
    });

    socket.on(
      "cardRevealed",
      ({
        cardIndex,
        cardType,
        playerLives: newPlayerLives,
      }: {
        cardIndex: number;
        cardType: CardType;
        playerLives: number;
      }) => {
        if (options.sfx) SoundPlayer.playSoundFile("reveal", "m4a");
        setRevealedCardIndex(cardIndex);
        setRevealedCardType(cardType);
        setCardPicked(true);
        setPlayerLives(newPlayerLives);
      },
    );

    socket.on(
      "roundResult",
      ({
        angle,
        message,
        teamScore: newScore,
        players: updatedPlayers,
        playerLives: newPlayerLives,
        dealerLives: newDealerLives,
        round: newRound,
        sectorType,
      }) => {
        setClockHandAngle(angle);
        setTeamScore(newScore);
        setPlayers(updatedPlayers);
        if (typeof newPlayerLives === "number") setPlayerLives(newPlayerLives);
        if (typeof newDealerLives === "number") setDealerLives(newDealerLives);
        if (typeof newRound === "number") setRound(newRound);
        setLastResultMessage(message || "");
        setGamePhase("roundComplete");

        const isCorrect =
          sectorType && sectorType !== "danger" && sectorType !== "timeout";
        if (isCorrect) {
          if (options.sfx) SoundPlayer.playSoundFile("attack", "m4a");
          openScene("attack", ["I will get you next time."]);
        } else {
          if (options.sfx) SoundPlayer.playSoundFile("hit", "m4a");
          openScene("hit", ["HA HA HA! You don't stand a chance."]);
        }
      },
    );

    socket.on("gameOver", ({ teamScore: finalScore, reason, result }) => {
      setTeamScore(finalScore);
      if (result === "victory") {
        if (options.bgMusic) SoundPlayer.playSoundFile("victory", "m4a");
        setGamePhase("victory");
        openScene("victory", [
          "Congratulations! Here is your prize.",
          "Amazing teamwork!",
        ]);
      } else if (reason === "timeout" || reason === "danger") {
        if (options.bgMusic) SoundPlayer.playSoundFile("gameover", "m4a");
        setGamePhase("gameover");
        openScene("laughing", ["You lose!"]);
      }
    });

    socket.on("resetRound", ({ hintSent }) => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
      setHintSent(hintSent);
      setSectors([]);
      setCountdown(null);
      setClockHandAngle(null);
      setHoverAngle(null);
      setHint("");
      setGamePhase("phase1");
      setOppositePair(null);
      setCardPicked(false);
      setRevealedCardIndex(null);
      setRevealedCardType(null);
      setSceneModal((prev) => ({ ...prev, isOpen: false }));
    });

    socket.on(
      "gameReset",
      ({ teamScore: newScore, hintSent, players: updatedPlayers }) => {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
        if (options.bgMusic) {
          SoundPlayer.playSoundFile("room", "m4a");
          SoundPlayer.setNumberOfLoops(Platform.OS === "ios" ? -1 : 1);
        }
        setHintSent(hintSent);
        setPlayers(updatedPlayers);
        setTeamScore(newScore);
        setSectors([]);
        setCountdown(null);
        setClockHandAngle(null);
        setHoverAngle(null);
        setHint("");
        setGamePhase("phase1");
        setOppositePair(null);
        setRound(1);
        setPlayerLives(3);
        setDealerLives(3);
        setCardPicked(false);
        setRevealedCardIndex(null);
        setRevealedCardType(null);
        setLastResultMessage("");
        setPhase3Duration(20);
      },
    );

    socket.on("partnerLeft", () => {
      showModal(
        "Partner Left",
        "Your partner has left the game. Returning to home.",
        () => {
          goHome();
        },
      );
    });

    return () => {
      socket.off("gameReady");
      socket.off("countdownStart");
      socket.off("phaseChanged");
      socket.off("hintUpdate");
      socket.off("cardRevealed");
      socket.off("roundResult");
      socket.off("gameOver");
      socket.off("resetRound");
      socket.off("gameReset");
      socket.off("partnerLeft");
    };
  }, [socket, goHome, options.sfx, options.bgMusic]);
  
  // --- Handlers ---
  const handleCreateGame = () => {
    if (!socket) return;
    socket.emit("createGame", roomId, (response: any) => {
      if (response.success) {
        setRole("player1");
        setGamePhase("phase1");
      } else {
        showModal(
          "Creation Failed",
          response.error || "Could not create room.",
        );
      }
    });
  };

  const handleJoinGame = () => {
    if (!socket) return;
    const name = guestName.trim() || "Player2";
    socket.emit("joinGame", { roomId, playerName: name }, (response: any) => {
      if (response.success) {
        setRole("player2");
        setGamePhase("phase1");
      } else {
        showModal("Join Failed", response.error || "Could not join room.");
      }
    });
  };

  const handleReadyPhase1 = () => {
    if (role !== "player1") return;
    if (countdown !== null) return;
    if (options.sfx) SoundPlayer.playSoundFile("click", "m4a");
    const newSectors = generateRandomSectors();
    setSectors(newSectors);
    setCardPicked(false);
    setRevealedCardIndex(null);
    setRevealedCardType(null);
    socket?.emit("startGame", { roomId, sectors: newSectors });
  };

  const handleReadyToPhase3 = () => {
    if (role !== "player1") return;
    socket?.emit("readyForPhase3", { roomId });
  };

  const handleSetHint = (text: string) => {
    if (role !== "player1") return;
    setHint(text);
    socket?.emit("sendHint", { roomId, hint: text });
  };

  const handlePickCard = (index: number) => {
    if (role !== "player1") return;
    if (cardPicked) return;
    socket?.emit("pickCard", { roomId, cardIndex: index });
    if (options.sfx) SoundPlayer.playSoundFile("click", "m4a");
  };

  const handleNextRound = () => {
    if (options.sfx) SoundPlayer.playSoundFile("click", "m4a");
    if (role === "player1") socket?.emit("nextRound", { roomId });
  };

  const handleStartNextRoundTier = () => {
    if (role !== "player1") return;
    if (countdown !== null) return;
    const newSectors = generateRandomSectors();
    setSectors(newSectors);
    socket?.emit("startGame", { roomId, sectors: newSectors });
  };

  const handlePlayAgain = () => {
    if (options.sfx) SoundPlayer.playSoundFile("click", "m4a");
    if (role === "player1") socket?.emit("resetGame", { roomId });
  };

  // --- Touch interaction for placing hand ---
  const handleCanvasMove = (clientX: number, clientY: number) => {
    if (role !== "player2") return;
    if (gamePhase !== "phase3") return;
    if (clockHandAngle !== null) return;
    if (!canvasLayout) return;

    const { width, height, x, y } = canvasLayout;
    const scaleX = CANVAS_SIZE / width;
    const scaleY = CANVAS_SIZE / height;
    const canvasX = (clientX - x) * scaleX;
    const canvasY = (clientY - y) * scaleY;
    const dx = canvasX - CENTER.x;
    const dy = canvasY - CENTER.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > RADIUS) {
      setHoverAngle(null);
      latestHoverAngleRef.current = null;
      return;
    }
    let angle = Math.atan2(dy, dx);
    if (angle < HALF_DISK_START) angle = HALF_DISK_START;
    if (angle > HALF_DISK_END) angle = HALF_DISK_END;
    setHoverAngle(angle);
    latestHoverAngleRef.current = angle;
  };

  const handleCanvasClick = () => {
    if (role !== "player2") return;
    if (gamePhase !== "phase3") return;
    if (clockHandAngle !== null) return;
    if (hoverAngle === null) return;
    socket?.emit("placeHand", { roomId, angle: hoverAngle });
  };

  // --- Touch event handlers for canvas ---
  const onTouchStart = (e: any) => {
    const touch = e.nativeEvent.touches[0];
    if (touch) {
      handleCanvasMove(touch.pageX, touch.pageY);
    }
  };
  const onTouchMove = (e: any) => {
    e.preventDefault();
    const touch = e.nativeEvent.touches[0];
    if (touch) {
      handleCanvasMove(touch.pageX, touch.pageY);
    }
  };
  const onTouchEnd = (e: any) => {
    e.preventDefault();
    if (
      role === "player2" &&
      gamePhase === "phase3" &&
      clockHandAngle === null &&
      latestHoverAngleRef.current !== null
    ) {
      socket?.emit("placeHand", {
        roomId,
        angle: latestHoverAngleRef.current,
      });
      setHoverAngle(null);
      latestHoverAngleRef.current = null;
    } else {
      setHoverAngle(null);
      latestHoverAngleRef.current = null;
    }
  };

  // --- onLayout for canvas container ---
  const onCanvasLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setCanvasLayout({ x, y, width, height });
  };

  // --- Action Buttons component ---
  const ActionButtons = useMemo(() => {
    if (
      gamePhase === "phase1" &&
      role === "player1" &&
      sectors.length === 0 &&
      countdown === null
    ) {
      return (
        <Button
          variant="green"
          onPress={handleReadyPhase1}
          disabled={players.length < 2}
        >
          {players.length < 2 ? "Waiting for player 2" : "Generate Areas"}
        </Button>
      );
    }
    if (gamePhase === "phase2" && role === "player1") {
      return (
        <Button variant="blue" onPress={handleReadyToPhase3}>
          Start Partner's Turn
        </Button>
      );
    }
    if (gamePhase === "roundComplete" && role === "player1") {
      return (
        <Button variant="green" onPress={handleNextRound}>
          Next Round
        </Button>
      );
    }
    if (gamePhase === "roundTransition" && role === "player1") {
      return (
        <Button variant="orange" onPress={handleStartNextRoundTier}>
          Begin Round {round}
        </Button>
      );
    }
    if (
      (gamePhase === "gameover" || gamePhase === "victory") &&
      role === "player1"
    ) {
      return (
        <Button variant="orange" onPress={handlePlayAgain}>
          Play Again
        </Button>
      );
    }
    return null;
  }, [gamePhase, role, sectors, countdown, players, round]);

  const isSmall = width < 600;
  const titleSize = isSmall ? "text-2xl" : "text-4xl";

  // --- Lives and round indicator ---
  const LivesAndRoundBar = () => (
    <View style={styles.livesBar}>
      <View style={styles.livesGroup}>
        <Text style={styles.livesLabel}>You</Text>
        <Text style={styles.livesHeart}>❤️</Text>
        <Text style={styles.livesCount}>× {Math.max(0, playerLives)}</Text>
      </View>
      <View style={styles.livesGroup}>
        <Text style={styles.livesLabel}>Dealer</Text>
        <Text style={styles.livesHeart}>❤️</Text>
        <Text style={styles.livesCount}>× {Math.max(0, dealerLives)}</Text>
      </View>
    </View>
  );

  // --- If sprites not loaded, show loading ---
  // if (!sprites) {
  //   return <LoadingSprites sectors={sectors} />;
  // }

  // --- Lobby UI ---
  if (gamePhase === "lobby") {
    return (
      <SafeAreaView
        style={[styles.safeArea, { paddingBottom: safeAreaInsets.bottom }]}
      >
        <LinearGradient
          colors={["#06b6d4", "#3b82f6", "#a855f7"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.lobbyContainer}>
            <View className="w-full rounded-[28px] border-4 border-yellow-400 px-6 py-7 bg-[rgba(15,15,40,0.92)]">
              <Text style={styles.title}>Disk Duel</Text>
              <Text style={styles.roomIdLabel}>Room ID:</Text>
              <Pressable onPress={copyRoomId} style={styles.roomIdContainer}>
                <Text style={styles.roomIdText}>{roomId}</Text>
              </Pressable>
              <View style={styles.buttonGroup}>
                <Button variant="green" onPress={handleCreateGame}>
                  Host
                </Button>
                <View style={styles.guestInputContainer}>
                  <Button variant="blue" onPress={handleJoinGame}>
                    Guest
                  </Button>
                </View>
              </View>
              {copyMessage && (
                <Text style={styles.copyMessage}>{copyMessage}</Text>
              )}
            </View>
          </View>
          <View className="absolute bottom-7 right-7">
            <Pressable
              onPress={() => navigation.navigate("Home")}
              className="bg-orange-500 p-4 rounded-full items-center justify-center mb-2"
            >
              <HomeIcon width={24} height={24} color="white" />
            </Pressable>
          </View>
        </LinearGradient>
        <Modal
          isOpen={modal.isOpen}
          title={modal.title}
          message={modal.message}
          onClose={closeModal}
          onConfirm={modal.onConfirm}
          confirmText={modal.confirmText}
        />
      </SafeAreaView>
    );
  }

  // --- Main game UI ---
  return (
    <SafeAreaView
      style={[styles.safeArea, { paddingBottom: safeAreaInsets.bottom }]}
    >
      <LinearGradient
        colors={["#06b6d4", "#3b82f6", "#a855f7"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { paddingTop: safeAreaInsets.top }]}
      >
        {/* Header bar */}
        <View style={styles.header}>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreLabel}>Score</Text>
            <Text style={styles.scoreValue}>{teamScore}</Text>
          </View>
          {gamePhase === "phase3" && phase3Timer !== null ? (
            <View style={styles.timerContainer}>
              <Text style={styles.timerIcon}>⏱️</Text>
              <Text style={styles.timerText}>{phase3Timer}s</Text>
              <View style={styles.timerProgressBg}>
                <View
                  style={[
                    styles.timerProgressFill,
                    { width: `${(phase3Timer / phase3Duration) * 100}%` },
                  ]}
                />
              </View>
            </View>
          ) : (
            <Text style={styles.roundText}>Round {round}/3</Text>
          )}
          <Pressable onPress={copyRoomId} style={styles.roomIdChip}>
            <Text style={styles.roomIdChipText}>{roomId}</Text>
          </Pressable>
        </View>

        <LivesAndRoundBar />

        <View className="flex-1 items-center justify-center">
          <Animated.Text
            className={`font-fredoka font-bold text-white mb-0 mt-10 text-center ${titleSize}`}
            style={{
              textShadowColor: "rgba(0,0,0,0.28)",
              textShadowOffset: { width: 0, height: 4 },
              textShadowRadius: 14,
              letterSpacing: 2,
            }}
          >
            {gamePhase === "phase1" && !countdown
              ? role === "player1" && sectors.length === 0
                ? "Press 'Generate Areas' below"
                : "Waiting for Player 1"
              : gamePhase === "phase1" && countdown !== null
                ? "Memorise the zones!"
                : gamePhase === "phase2"
                  ? "Categories"
                  : gamePhase === "phase3"
                    ? role === "player2"
                      ? "Select an area"
                      : "Player 2 selecting an area"
                    : gamePhase === "roundComplete"
                      ? "Round complete"
                      : gamePhase === "gameover"
                        ? "Game Over"
                        : gamePhase === "victory"
                          ? "Victory"
                          : null}
          </Animated.Text>
          {/* Canvas area */}
          <View
            ref={canvasContainerRef}
            onLayout={onCanvasLayout}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <Canvas style={{ width: DISPLAY_SIZE, height: DISPLAY_SIZE }}>
              <Disk
                scale={scale}
                phase={gamePhase}
                role={role}
                sectors={sectors}
                countdown={countdown}
                clockHandAngle={clockHandAngle}
                hoverAngle={hoverAngle}
              />
            </Canvas>
          </View>
        </View>

        {(players.length < 2 ||
          gamePhase === "victory" ||
          gamePhase === "gameover") && (
          <View className="absolute bottom-28 right-7">
            <Pressable
              onPress={() => navigation.navigate("Home")}
              className="bg-orange-500 p-4 rounded-full items-center justify-center mb-2"
            >
              <HomeIcon width={24} height={24} color="white" />
            </Pressable>
          </View>
        )}

        {/* Bottom bar */}
        <View style={styles.bottomBar}>
          {/* Opposite pair cards (if visible) */}
          {(gamePhase === "phase3" || cardModalDismissed) && oppositePair && (
            <View style={styles.pairContainer}>
              <View style={[styles.pairCard, styles.pairLeft]}>
                <Text style={styles.pairText}>{oppositePair.left}</Text>
              </View>
              <View style={[styles.pairCard, styles.pairRight]}>
                <Text style={styles.pairText}>{oppositePair.right}</Text>
              </View>
            </View>
          )}

          {/* Hint input for player1 in phase3 */}
          {gamePhase === "phase3" && role === "player1" && (
            <View style={styles.hintContainer}>
              <Text style={styles.hintLabel}>Give a Hint</Text>
              <View style={styles.hintInputRow}>
                <TextInput
                  style={styles.hintInput}
                  placeholder="e.g. 'Ferrari Enzo'"
                  placeholderTextColor="#666"
                  value={hint}
                  editable={!hintSent}
                  onChangeText={setHint}
                  onSubmitEditing={() => handleSetHint(hint)}
                />
              </View>
            </View>
          )}

          {/* Hint display for player2 */}
          {gamePhase === "phase3" && hint && role === "player2" && (
            <View style={styles.hintDisplay}>
              <Text style={styles.hintDisplayLabel}>Partner's Hint</Text>
              <Text style={styles.hintDisplayText}>{hint}</Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.actionButtons}>{ActionButtons}</View>
        </View>
      </LinearGradient>

      {/* Modals */}
      <Modal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        onClose={closeModal}
        onConfirm={modal.onConfirm}
        confirmText={modal.confirmText}
      />

      <SceneModal
        isOpen={sceneModal.isOpen}
        onClose={closeScene}
        pose={sceneModal.pose}
        setSceneModal={setSceneModal}
        messages={sceneModal.messages}
        sprites={sprites}
        lastResultMessage={lastResultMessage}
        gamePhase={gamePhase}
      />

      {gamePhase === "cardSelect" && (
        <CardPickModal
          role={role}
          options={options}
          cardPicked={cardPicked}
          revealedCardIndex={revealedCardIndex}
          revealedCardType={revealedCardType}
          onPickCard={handlePickCard}
        />
      )}

      {cardModalOpen && (
        <CardsModal
          cardsZoomingOut={cardsZoomingOut}
          handleCloseCardModal={() => {
            setCardsZoomingOut(true);
            setTimeout(() => {
              setCardModalOpen(false);
              setCardModalDismissed(true);
              setCardsZoomingOut(false);
            }, 500);
          }}
          oppositePair={oppositePair}
        />
      )}

      {/* <BackgroundMusic sound={backgroundRoomMusic} /> */}
    </SafeAreaView>
  );
}

const HomeIcon = ({
  width,
  height,
  color,
}: {
  width: number;
  height: number;
  color: string;
}) => (
  <Svg width={width} height={height} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 2.1 3 9.3V21h6v-6h6v6h6V9.3l-9-7.2zm0 2.56 6.5 5.2V19h-2v-6H7.5v6h-2v-9.14L12 4.66z" />
  </Svg>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    paddingTop: 8,
  },
  // Lobby styles
  lobbyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },

  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 16,
  },
  roomIdLabel: {
    fontSize: 20,
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  roomIdContainer: {
    backgroundColor: "rgba(128, 90, 213, 0.8)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
    width: "50%",
    margin: "auto",
  },
  roomIdText: {
    fontFamily: "monospace",
    fontWeight: "bold",
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  buttonGroup: {
    width: "100%",
    gap: 12,
    marginTop: 16,
  },
  guestInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  guestInput: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 8,
    color: "#1f2937",
  },
  copyMessage: {
    color: "#d1d5db",
    marginTop: 8,
    textAlign: "center",
  },
  // Game UI styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    marginBottom: 6,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scoreLabel: {
    color: "#fcd34d",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  scoreValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
  },
  timerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(185, 28, 28, 0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  timerIcon: {
    color: "#fca5a5",
    fontSize: 12,
  },
  timerText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
    marginLeft: 4,
  },
  timerProgressBg: {
    width: 48,
    height: 6,
    backgroundColor: "#374151",
    borderRadius: 4,
    marginLeft: 4,
    overflow: "hidden",
  },
  timerProgressFill: {
    height: "100%",
    backgroundColor: "#ef4444",
    borderRadius: 4,
  },
  roundText: {
    color: "#fcd34d",
    fontWeight: "900",
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  roomIdChip: {
    backgroundColor: "rgba(128, 90, 213, 0.8)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roomIdChipText: {
    fontFamily: "monospace",
    fontWeight: "bold",
    color: "white",
    fontSize: 16,
  },
  livesBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 6,
  },
  livesGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  livesLabel: {
    color: "#93c5fd",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  livesHeart: {
    color: "#f87171",
    fontSize: 16,
  },
  livesCount: {
    color: "white",
    fontWeight: "900",
    fontSize: 16,
  },
  bottomBar: {
    backgroundColor: "rgba(0,0,0,0.5)", // bg-black/50
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)", // border-white/10
    paddingHorizontal: 12, // px-3
    paddingTop: 8, // pt-2
    paddingBottom: 12, // pb-3
    flexDirection: "column",
    rowGap: 8, // gap-2 (RN 0.71+)
  },
  pairContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  pairCard: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fcd34d",
  },
  pairLeft: {
    backgroundColor: "rgba(37, 99, 235, 0.7)",
  },
  pairRight: {
    backgroundColor: "rgba(185, 28, 28, 0.7)",
  },
  pairText: {
    color: "#fcd34d",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  hintContainer: {
    marginBottom: 4,
  },
  hintLabel: {
    color: "white",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 2,
  },
  hintInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  hintInput: {
    flex: 1,
    backgroundColor: "#fef9c3",
    borderRadius: 12,
    padding: 8,
    textAlign: "center",
    fontSize: 14,
    color: "#1f2937",
  },
  hintDisplay: {
    backgroundColor: "rgba(250, 204, 21, 0.2)",
    borderWidth: 1,
    borderColor: "#facc15",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
  },
  hintDisplayLabel: {
    color: "#fcd34d",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  hintDisplayText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 14,
  },
  actionButtons: {
    alignItems: "center",
    marginTop: 4,
  },
});

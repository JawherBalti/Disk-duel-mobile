import { useEffect, useRef, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  Pressable,
  FlatList,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { AnimationState, LoadedAnimations } from "../lib/types";
import { preloadAnimations } from "../lib/preloadAnimations";

type Slide = {
  title: string;
  description: string;
  image: any;
  pose: AnimationState;
};

type HowToPlayModalProps = {
  isHowToPlayOpen: boolean;
  setIsHowToPlayOpen: (open: boolean) => void;
};

const slides: Slide[] = [
  {
    title: "Generate Areas",
    description:
      "Player 1 (the Host) starts the round by generating the colored areas on the disk.",
    image: require("../assets/rules/1.webp"),
    pose: "welcome1",
  },
  {
    title: "Memorize the Areas",
    description:
      "Player 1 has 5 seconds to memorize the areas. Red is the danger zone, green is the safe zone, and yellow is the bullseye worth the most points.",
    image: require("../assets/rules/2.webp"),
    pose: "welcome2",
  },
  {
    title: "Round Effect",
    description:
      "Once the timer ends, Player 1 draws 1 of 3 random effect cards. Effects can help your team or make the round more challenging.",
    image: require("../assets/rules/3.webp"),
    pose: "welcome3",
  },
  {
    title: "Round Cards",
    description:
      'Next, two opposite statements are revealed. For example: "Largest Planet" versus "Smallest Planet".',
    image: require("../assets/rules/4.webp"),
    pose: "welcome2",
  },
  {
    title: "Category Scale",
    description:
      'The disk is now split into two halves representing the two statements. In this example, one side means "larger planets" and the other means "smaller planets".',
    image: require("../assets/rules/5.webp"),
    pose: "welcome1",
  },
  {
    title: "Choose a Hint",
    description:
      "Player 1 must remember where the colored areas are and choose a planet that helps Player 2 avoid the danger zone while aiming for the bullseye. Send a hint using the input at the bottom.",
    image: require("../assets/rules/6.webp"),
    pose: "welcome2",
  },
  {
    title: "Optimize Your Hint",
    description:
      "Choosing 'Mercury' points to the 'smallest' end of the scale, leading Player 2 toward the safe zone for only 1 point. Choosing 'Earth' instead suggests a position closer to the middle, helping Player 2 target the bullseye for 3 points.",
    image: require("../assets/rules/7.webp"),
    pose: "welcome3",
  },
  {
    title: "Place Your Marker",
    description:
      "Using the hint, Player 2 places the marker on the disk where they believe the chosen planet belongs. If they remembered the areas correctly, they'll avoid the danger zone and hopefully land on the bullseye.",
    image: require("../assets/rules/8.webp"),
    pose: "welcome2",
  },
];

export default function HowToPlayModal({
  isHowToPlayOpen,
  setIsHowToPlayOpen,
}: HowToPlayModalProps) {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sprites, setSprites] = useState<LoadedAnimations | null>(null);
  const flatListRef = useRef<FlatList>(null);

  const totalSlides = slides.length;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // when 50% of the item is visible
  }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentSlide(viewableItems[0].index);
    }
  }).current;
  useEffect(() => {
    let mounted = true;
    preloadAnimations()
      .then((loaded) => {
        if (mounted) setSprites(loaded);
      })
      .catch(console.error);
    return () => {
      mounted = false;
    };
  }, []);

  const goToSlide = useCallback(
    (index: number) => {
      const clamped = Math.max(0, Math.min(index, totalSlides - 1));
      setCurrentSlide(clamped);
      flatListRef.current?.scrollToIndex({
        index: clamped,
        animated: true,
      });
    },
    [totalSlides],
  );

  const next = useCallback(
    () => goToSlide(currentSlide + 1),
    [currentSlide, goToSlide],
  );
  const prev = useCallback(
    () => goToSlide(currentSlide - 1),
    [currentSlide, goToSlide],
  );

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
      if (idx !== currentSlide) setCurrentSlide(idx);
    },
    [SCREEN_WIDTH, currentSlide],
  );

  const close = useCallback(
    () => setIsHowToPlayOpen(false),
    [setIsHowToPlayOpen],
  );

  // Check if modal is open
  if (!isHowToPlayOpen) return null;

  return (
    <Modal
      visible={isHowToPlayOpen}
      animationType="fade"
      transparent
      onRequestClose={close}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/70 px-4"
        onPress={close}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-5xl rounded-3xl border-4 border-yellow-500 bg-slate-900 px-6 py-5"
          style={{
            maxHeight: "90%",
            shadowColor: "#000",
            shadowOpacity: 0.45,
            shadowRadius: 18,
            elevation: 15,
          }}
        >
          {sprites ? (
            <>
              {/* Heading */}
              <Text
                className="mb-4 text-center text-3xl font-bold text-yellow-400"
                style={{
                  fontFamily: "FredokaOne-Regular",
                  textShadowColor: "rgba(0,0,0,0.45)",
                  textShadowRadius: 8,
                }}
              >
                How To Play
              </Text>

              {/* Close */}
              <Pressable
                onPress={close}
                className="absolute right-5 top-5 h-10 w-10 items-center justify-center rounded-full bg-red-500"
              >
                <Text className="text-xl font-bold text-white">✕</Text>
              </Pressable>

              <FlatList
                ref={flatListRef}
                data={slides}
                horizontal
                showsHorizontalScrollIndicator={false}
                keyExtractor={(_, i) => String(i)}
                viewabilityConfig={viewabilityConfig}
                onViewableItemsChanged={onViewableItemsChanged}
                renderItem={({ item }) => (
                  <View
                    style={{ width: SCREEN_WIDTH * 0.82 }}
                    className=""
                  >
                    {/* full width, then inner padding */}
                    {/* title */}
                    <Text className="mb-3 text-center text-2xl font-bold text-white">
                      {item.title}
                    </Text>
                    {/* image */}
                    <Image
                      source={item.image}
                      resizeMode="stretch"
                      style={{
                        width: "auto",
                        height: SCREEN_HEIGHT / 2,
                        backgroundColor: 'red'
                      }}
                    />
                    {/* character + description */}
                    <View className="mt-5 w-full flex justify-center items-center px-5">
                      <Text className="w-full mx-auto text-center text-base leading-6 text-gray-300">
                        {item.description}
                      </Text>
                    </View>
                  </View>
                )}
              />

              {/* Controls */}
              <View className="mt-6 flex-row items-center justify-between">
                <Pressable
                  disabled={currentSlide === 0}
                  onPress={prev}
                  className={`h-12 w-12 items-center justify-center rounded-full border-2 border-yellow-400 bg-slate-800 ${currentSlide === 0 ? "opacity-40" : ""
                    }`}
                >
                  <Text className="text-3xl text-yellow-400">‹</Text>
                </Pressable>

                <View className="flex-row items-center">
                  {slides.map((_, idx) => (
                    <Pressable
                      key={idx}
                      onPress={() => goToSlide(idx)}
                      className={`mx-1 h-3 w-3 rounded-full ${idx === currentSlide ? "bg-yellow-400" : "bg-slate-500"
                        }`}
                    />
                  ))}
                </View>

                <Pressable
                  disabled={currentSlide === totalSlides - 1}
                  onPress={next}
                  className={`h-12 w-12 items-center justify-center rounded-full border-2 border-yellow-400 bg-slate-800 ${currentSlide === totalSlides - 1 ? "opacity-40" : ""
                    }`}
                >
                  <Text className="text-3xl text-yellow-400">›</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <Text
              className="py-20 text-center text-5xl font-bold text-white"
              style={{
                fontFamily: "FredokaOne-Regular",
                textShadowColor: "rgba(0,0,0,0.35)",
                textShadowRadius: 12,
              }}
            >
              Loading...
            </Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

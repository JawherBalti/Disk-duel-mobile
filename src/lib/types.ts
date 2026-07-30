import { ParamValue } from "next/dist/server/request/params";
import { CSSProperties, Dispatch, SetStateAction } from "react";

export type CardType = "double" | "extraLife" | "fastTimer" | null;
export type SectorType = "danger" | "safe" | "bullseye";
export type AnimationState =
  | "welcome1"
  | "welcome2"
  | "welcome3"
  | "laughing"
  | "hit"
  | "attack"
  | "victory";

export type GamePhase =
  | "lobby"
  | "phase1"
  | "cardSelect"
  | "phase2"
  | "phase3"
  | "roundComplete"
  | "roundTransition"
  | "gameover"
  | "victory";

export type Sector = {
  type: SectorType;
  start: number;
  end: number;
};

export type DiskDrawOptions = {
  phase: GamePhase
  role: "player1" | "player2" | null;
  sectors: Sector[];
  countdown: number | null;
  clockHandAngle: number | null;
  hoverAngle: number | null;
  gameOver?: boolean;
};

export type AnimationConfig = {
  src: string;
  frames: number;
  fps: number;
  loop: boolean;
  height: number;
  width: number;
};

export type CharacterAnimationProps = {
  state?: AnimationState;
  width?: number;
  height?: number;
  caption: string;
  sprites: LoadedAnimations;
  customWidth?: string;
  customHeight?: string;
  showBubble: boolean;
  frame?: number;
};

export type LoadedAnimations = Record<AnimationState, HTMLImageElement>;

export type CommonButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "green" | "blue" | "orange" | "transparent";
  className?: string;
  type?: "button" | "submit" | "reset";
  style?: CSSProperties | undefined;
};

export type CardsModalProps = {
  handleCloseCardModal: () => void;
  cardsZoomingOut: boolean;
  oppositePair: { left: string; right: string } | null;
};

export type GameBoardProps = {
  initialSectors: Sector[];
};

export type ModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm?: () => void; // optional extra action (e.g., redirect)
  confirmText?: string;
};

export type SidebarProps = {
  teamScore: number;
  copyRoomId: () => void;
  roomId: ParamValue;
  gamePhase: GamePhase
  phase3Timer: number | null;
  cardModalDismissed: boolean;
  showCards: boolean;
  hint: string;
  role: string | null;
  ActionButtons: React.ComponentType;
  oppositePair: { left: string; right: string } | null;
  setHint: Dispatch<SetStateAction<string>>;
  handleSetHint: (text: string) => void;
  hintSent: boolean;
  LivesAndRoundBar: React.ComponentType;
};

export type CardPickModalProps = {
  role: "player1" | "player2" | null;
  cardPicked: boolean;
  revealedCardIndex: number | null;
  revealedCardType: CardType;
  onPickCard: (index: number) => void;
};

export type SceneModalProps = {
  isOpen: boolean;
  onClose: () => void;
  pose: AnimationState;
  messages: string[];
  setSceneModal: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      pose: AnimationState;
      messages: string[];
    }>
  >;
  sprites: LoadedAnimations;
  gamePhase: GamePhase;
  lastResultMessage: string
};

export type Options = {
  bgMusic: boolean;
  sfx: boolean;
};

export type OptionsProps = {
  isOptionsOpen: boolean;
  setIsOptionsOpen: Dispatch<SetStateAction<boolean>>;
  setOptions: Dispatch<SetStateAction<Options>>;
  options: Options
};
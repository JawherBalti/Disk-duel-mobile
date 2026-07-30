import { SidebarProps } from "@/lib/types";

export default function Sidebar({
  teamScore,
  copyRoomId,
  roomId,
  gamePhase,
  phase3Timer,
  cardModalDismissed,
  showCards,
  hint,
  role,
  ActionButtons,
  oppositePair,
  setHint,
  handleSetHint,
  hintSent,
  LivesAndRoundBar,
}: SidebarProps) {
  return (
    <div className="w-80 flex flex-col gap-5 p-6 bg-black/20 backdrop-blur-md border-l border-white/20 shadow-2xl min-h-screen">
      <div className="bg-linear-to-br from-gray-900/60 to-gray-800/40 rounded-2xl p-5 text-center border border-yellow-400/30 shadow-xl backdrop-blur-sm">
        <div className="text-yellow-300 text-sm font-bold uppercase tracking-widest mb-1 flex items-center justify-center gap-2">
          Score
          <span className="text-white font-black text-4xl drop-shadow-lg">
            {teamScore}
          </span>
        </div>
        <div className="text-white font-bold text-lg mt-2">
          Room:{" "}
          <span
            onClick={copyRoomId}
            className="font-mono font-bold bg-purple-700/80 px-2 py-0.5 rounded-full cursor-pointer hover:bg-purple-600/70 transition"
          >
            {roomId}
          </span>
        </div>
      </div>
      <LivesAndRoundBar />

      {gamePhase === "phase3" && phase3Timer !== null && (
        <div className="bg-linear-to-r from-red-900/50 to-red-800/40 rounded-2xl p-4 text-center border border-red-400 shadow-xl animate-pulse">
          <div className="text-red-300 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2">
            Time Left
          </div>
          <div className="text-white font-black text-4xl">{phase3Timer}s</div>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
            <div
              className="bg-linear-to-r from-red-500 to-orange-500 h-2.5 rounded-full transition-all duration-1000"
              style={{
                width: `${(phase3Timer / 20) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      <div className="bg-white/10 rounded-2xl p-3 text-center backdrop-blur-sm">
        <div className="text-white/60 text-xs font-bold uppercase tracking-wider">
          Current Phase
        </div>
        <div className="text-yellow-300 font-black text-2xl capitalize flex items-center justify-center gap-2">
          {gamePhase === "phase1" && "Memorise"}
          {gamePhase === "phase2" && "Study"}
          {gamePhase === "phase3" && "Guess"}
          {gamePhase === "roundComplete" && "Round Done"}
          {gamePhase === "gameover" && "💀 Game Over"}
        </div>
      </div>

      {showCards && oppositePair && (
        <div
          className={`flex flex-col gap-3 ${cardModalDismissed ? "animate-sidebarCardsIn" : ""}`}
        >
          <div className="sidebar-card bg-linear-to-r from-blue-700 to-blue-500 p-3 rounded-2xl text-center border-2 border-yellow-400 shadow-xl transform transition hover:scale-105">
            <div className="text-yellow-300 text-xs font-bold uppercase tracking-wide">
              {oppositePair.left}
            </div>
          </div>
          <div className="sidebar-card bg-linear-to-r from-red-700 to-red-500 p-3 rounded-2xl text-center border-2 border-yellow-400 shadow-xl transform transition hover:scale-105">
            <div className="text-yellow-300 text-xs font-bold uppercase tracking-wide">
              {oppositePair.right}
            </div>
          </div>
        </div>
      )}

      {gamePhase === "phase3" && role === "player1" && (
        <div className="flex flex-col gap-1">
          <div className="text-white text-xs font-bold uppercase tracking-wide text-center">
            Give a Hint
          </div>
          <input
            disabled={hintSent}
            type="text"
            placeholder="e.g. 'Ferrari Enzo'"
            value={hint}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSetHint(hint);
              }
            }}
            onChange={(e) => setHint(e.target.value)}
            className="w-full p-2 rounded-xl text-center text-sm bg-yellow-100 border-2 border-yellow-400 focus:outline-none text-gray-800"
          />
        </div>
      )}

      {gamePhase === "phase3" && hint && role === "player2" && (
        <div className="bg-yellow-400/20 border-2 border-yellow-400 rounded-2xl p-4 text-center animate-pulse backdrop-blur-sm">
          <div className="text-yellow-300 text-xs font-bold uppercase tracking-wide mb-1">
            💡 Partner's Hint
          </div>
          <div className="text-white font-bold text-lg">{hint}</div>
        </div>
      )}

      <div className="flex-1" />
      <div className="flex flex-col gap-3">
        <ActionButtons />
      </div>
    </div>
  );
}

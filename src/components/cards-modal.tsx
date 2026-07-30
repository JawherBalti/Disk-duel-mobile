import { CardsModalProps } from "@/lib/types";

export default function CardsModal({
    handleCloseCardModal,
    cardsZoomingOut,
    oppositePair,
}: CardsModalProps) {
    return (
        <div className="card-modal-overlay" onClick={handleCloseCardModal}>
            <div
                className="card-modal-content"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    className="card-modal-close"
                    onClick={handleCloseCardModal}
                >
                    ✕
                </button>
                <div className="text-white font-bold text-xl mb-6 text-center uppercase tracking-widest opacity-70">
                    This Round's Cards
                </div>
                <div className="flex gap-6 justify-center flex-wrap">
                    <div
                        className={`modal-card bg-linear-to-r from-red-700 to-red-500 p-6 rounded-2xl text-center border-4 border-yellow-400 shadow-2xl ${cardsZoomingOut ? "animate-cardZoomOut" : "animate-cardLeft"}`}
                    >
                        <div className="text-yellow-300 text-base font-bold uppercase tracking-wide">
                            {oppositePair?.left || "Expensive Car"}
                        </div>
                    </div>
                    <div
                        className={`modal-card bg-linear-to-r from-blue-700 to-blue-500 p-6 rounded-2xl text-center border-4 border-yellow-400 shadow-2xl ${cardsZoomingOut ? "animate-cardZoomOut" : "animate-cardRight"}`}
                    >
                        <div className="text-yellow-300 text-base font-bold uppercase tracking-wide">
                            {oppositePair?.right || "Cheap Car"}
                        </div>
                    </div>
                </div>
                <div className="text-center mt-8">
                    <button
                        onClick={handleCloseCardModal}
                        className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-xl py-3 px-10 rounded-full shadow-xl transition duration-200 hover:scale-105 active:scale-95"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
}

import { Chess } from 'chess.js'
import { useState } from 'react'
import { Chessboard } from 'react-chessboard'
import { ASSET_MANIFEST } from './types/assets'

function App() {
  const [chess] = useState(new Chess())
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      })
      if (move) {
        setFen(chess.fen())
        return true
      }
    } catch {
      return false
    }
    return false
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          ♟️ 琪雅学棋
        </h1>
        <p className="text-white/80">儿童国际象棋趣味学习平台</p>
      </header>

      <main className="flex flex-col lg:flex-row gap-8 items-start justify-center max-w-6xl w-full">
        {/* 棋盘区域 */}
        <section className="flex-shrink-0">
          <div className="rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20">
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              boardWidth={400}
              boardOrientation="white"
              arePiecesDraggable={true}
            />
          </div>
        </section>

        {/* 角色展示 */}
        <section className="flex-1 max-w-md">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-4">👋 认识一下你的新朋友</h2>
            <div className="space-y-4">
              <div className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-yellow-300 flex items-center justify-center text-3xl">
                  👑
                </div>
                <div>
                  <h3 className="text-white font-semibold">{ASSET_MANIFEST.characters.mascot_queen.name}</h3>
                  <p className="text-white/70 text-sm">琪雅 · 你的专属象棋老师</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-gray-300 flex items-center justify-center text-3xl">
                  🐴
                </div>
                <div>
                  <h3 className="text-white font-semibold">{ASSET_MANIFEST.characters.mascot_knight.name}</h3>
                  <p className="text-white/70 text-sm">阿塔 · 你的练习伙伴</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-8 text-center text-white/50 text-sm">
        <p>© 2026 琪雅学棋 · 跟琪雅一起学国际象棋</p>
      </footer>
    </div>
  )
}

export default App

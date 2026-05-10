import { Chess } from 'chess.js'
import { useState, useEffect, useRef } from 'react'
import { Chessboard } from 'react-chessboard'

// 棋灵角色
const CHESS_SPIRIT = { name: '炭治郎', avatar: '👹' }

// 使用说明
const GUIDE_ITEMS = [
  { icon: '♟️', title: '自由对局', desc: '与AI下棋练习，AI会自动回应' },
  { icon: '🎯', title: '战术题库', desc: '每天挑战战术题，提高棋艺' },
  { icon: '💬', title: 'AI对话', desc: '向炭治郎提问，获得指导' },
  { icon: '📊', title: '积分系统', desc: '答对获得金币，解锁功能' }
]

// 战术题库
const SAMPLE_PUZZLES = [
  { id: 1, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', moves: ['Qf3'], theme: '双射', rating: 800, hint: '白棋先走，有什么战术？' },
  { id: 2, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', moves: ['Bxf7+'], theme: '将军', rating: 600, hint: '用象吃 f7 的兵！' }
]

interface PuzzleState { puzzle: typeof SAMPLE_PUZZLES[0]; userMove: string | null; result: 'pending' | 'correct' | 'wrong'; step: 'view' | 'try' | 'result' }
interface ChatMessage { id: number; sender: 'spirit' | 'user'; text: string; time: string }

// MiniMax 大模型 API 调用
async function callAI(userMessage: string): Promise<string> {
  try {
    const response = await fetch('https://api.minimax.chat/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_MINIMAX_API_KEY || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        messages: [{
          role: 'user',
          content: `你是炭治郎，孜孜国际象棋AI教练（鬼灭之刃主题）。用户说：${userMessage}\n\n请用炭治郎的语气回答，简洁、鼓励、友好。不要说自己是AI。`
        }]
      })
    })
    const data = await response.json()
    return data.choices?.[0]?.message?.content || '让我想想...'
  } catch {
    return '嗯...这个问题炭治郎还需要想一想，下次告诉你答案！💪'
  }
}

function App() {
  const [chess] = useState(new Chess())
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  const [mode, setMode] = useState<'chess' | 'puzzle'>('chess')
  const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(null)
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0)
  const [puzzleScore, setPuzzleScore] = useState({ correct: 0, total: 0 })
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const [gameStatus, setGameStatus] = useState('⚔️ 执白先行')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([{
      id: Date.now(),
      sender: 'spirit',
      text: '欢迎来到孜孜国际象棋AI教练！我是炭治郎 🎌 你可以自由对局或挑战战术题，也可以随时问我问题！',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }])
    loadPuzzle(0)
  }, [])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  // AI 随机走一步
  const makeAIMove = () => {
    const moves = chess.moves()
    if (moves.length === 0) return
    const move = moves[Math.floor(Math.random() * moves.length)]
    chess.move(move)
    setFen(chess.fen())
    setMoveHistory(prev => [...prev, move])
    const nextColor = chess.turn() === 'w' ? '白' : '黑'
    if (chess.isCheckmate()) setGameStatus(`${nextColor}棋获胜！✨`)
    else if (chess.isCheck()) setGameStatus(`${nextColor}棋将军！`)
    else setGameStatus(`⚔️ ${nextColor}棋回合`)
    setIsAIThinking(false)
  }

  // 人类走棋后的处理
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (mode === 'chess') {
      try {
        const move = chess.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
        if (move) {
          setFen(chess.fen())
          const newHistory = [...moveHistory, move.san]
          setMoveHistory(newHistory)
          const nextColor = chess.turn() === 'w' ? '白' : '黑'
          if (chess.isCheckmate()) setGameStatus(move.color === 'w' ? '✨ 白棋获胜！' : '黑棋获胜！')
          else if (chess.isCheck()) setGameStatus(`${nextColor}棋将军！`)
          else setGameStatus(`⚔️ ${nextColor}棋回合`)
          // AI 自动走棋
          if (!chess.isGameOver()) {
            setIsAIThinking(true)
            setTimeout(() => makeAIMove(), 800)
          }
          return true
        }
      } catch { return false }
      return false
    } else if (mode === 'puzzle' && puzzleState?.step === 'try') {
      try {
        const move = chess.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
        if (move) {
          setFen(chess.fen())
          const isCorrect = puzzleState.puzzle.moves.includes(move.san)
          if (isCorrect) {
            setPuzzleState(prev => prev ? { ...prev, result: 'correct', step: 'result', userMove: move.san } : null)
            setPuzzleScore(prev => ({ ...prev, correct: prev.correct + 1, total: prev.total + 1 }))
            addSpiritMessage(`🎉 正确！「${move.san}」走得好！这道${puzzleState.puzzle.theme}题你解出来了！`)
          } else {
            setPuzzleState(prev => prev ? { ...prev, result: 'wrong', step: 'result', userMove: move.san } : null)
            setPuzzleScore(prev => ({ ...prev, total: prev.total + 1 }))
            addSpiritMessage(`💡 不对哦，你的「${move.san}」不是最佳走法。再想想？提示：${puzzleState.puzzle.hint}`)
          }
          return true
        }
      } catch { return false }
      return false
    }
    return false
  }

  const loadPuzzle = (index: number) => {
    const puzzle = SAMPLE_PUZZLES[index % SAMPLE_PUZZLES.length]
    chess.load(puzzle.fen)
    setFen(puzzle.fen)
    setPuzzleState({ puzzle, userMove: null, result: 'pending', step: 'view' })
  }

  const startPuzzle = () => {
    setMode('puzzle')
    loadPuzzle(currentPuzzleIndex)
    setPuzzleScore({ correct: 0, total: 0 })
    addSpiritMessage(`🎯 战术题库模式启动！ 当前题目：${puzzleState?.puzzle.theme}（难度${puzzleState?.puzzle.rating}）`)
  }

  const nextPuzzle = () => {
    const nextIndex = (currentPuzzleIndex + 1) % SAMPLE_PUZZLES.length
    setCurrentPuzzleIndex(nextIndex)
    loadPuzzle(nextIndex)
    setPuzzleState(prev => prev ? { ...prev, step: 'try', result: 'pending', userMove: null } : null)
    addSpiritMessage(`📖 第${nextIndex + 1}题：${SAMPLE_PUZZLES[nextIndex].hint}`)
  }

  const addSpiritMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now(), sender: 'spirit', text, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }])
  }

  const handleSend = async () => {
    if (!inputText.trim()) return
    const userMsg: ChatMessage = { id: Date.now(), sender: 'user', text: inputText.trim(), time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsAIThinking(true)
    const reply = await callAI(inputText)
    addSpiritMessage(reply)
    setIsAIThinking(false)
  }

  const resetGame = () => {
    chess.reset()
    setFen(chess.fen())
    setMoveHistory([])
    setGameStatus('⚔️ 执白先行')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <header className="flex items-center justify-center py-3 px-4 bg-black/20 backdrop-blur">
        <h1 className="text-2xl font-bold text-white tracking-wide">⚔️ 孜孜的国际象棋AI教练</h1>
      </header>

      <main className="flex-1 flex gap-0 p-4 min-h-0">
        {/* 棋盘区域 */}
        <section className="flex-[3] flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => { setMode('chess'); resetGame() }} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${mode === 'chess' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50'}`}>♟️ 自由对局</button>
            <button onClick={startPuzzle} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${mode === 'puzzle' ? 'bg-red-500/80 text-white' : 'bg-white/5 text-white/50'}`}>🎯 战术题库</button>
          </div>
          <div className="bg-black/30 backdrop-blur rounded-xl px-4 py-2 text-center">
            <span className="text-white/80 text-sm">{mode === 'puzzle' && puzzleState ? `🎯 ${puzzleState.puzzle.theme} · 难度 ${puzzleState.puzzle.rating}` : isAIThinking ? '🤔 炭治郎思考中...' : gameStatus}</span>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-2 ring-white/10">
            <Chessboard position={fen} onPieceDrop={onDrop} boardWidth={Math.min(500, window.innerWidth * 0.52)} boardOrientation="white" customDarkSquareStyle={{ backgroundColor: '#3d2b1f' }} customLightSquareStyle={{ backgroundColor: '#f0d9b5' }} />
          </div>
          <div className="flex gap-3">
            <button onClick={resetGame} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm backdrop-blur transition">🔄 重新开局</button>
            {mode === 'puzzle' && puzzleState?.result === 'correct' && <button onClick={nextPuzzle} className="px-5 py-2.5 bg-red-500/80 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition">📖 下一题</button>}
          </div>
          {mode === 'chess' && moveHistory.length > 0 && (
            <div className="bg-black/20 backdrop-blur rounded-xl p-3 max-w-md w-full">
              <h3 className="text-white/70 text-xs mb-2">📜 走法记录</h3>
              <div className="flex flex-wrap gap-1 text-xs">
                {moveHistory.map((move, i) => (<span key={i} className="bg-white/10 text-white/90 px-2 py-0.5 rounded">{Math.floor(i / 2) + 1}.{i % 2 === 0 ? '' : '..'}{move}</span>))}
              </div>
            </div>
          )}
        </section>

        {/* 中间栏 */}
        <section className="flex-[1.2] flex flex-col min-h-0 mx-4">
          <div className="bg-black/30 backdrop-blur rounded-2xl p-4 mb-3 flex-1 flex flex-col min-h-0">
            <h3 className="text-white/80 text-sm font-medium mb-3">📜 {mode === 'puzzle' ? '题目' : '走法记录'}</h3>
            {mode === 'puzzle' ? (
              <div className="flex-1">
                <div className="text-center py-4"><div className="text-3xl font-bold text-white mb-1">{puzzleScore.correct}/{puzzleScore.total}</div><p className="text-white/40 text-xs">正确/总计</p></div>
                {puzzleState && puzzleState.result !== 'pending' && (<div className={`mt-3 p-3 rounded-xl text-sm ${puzzleState.result === 'correct' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{puzzleState.result === 'correct' ? '✅ 正确！' : '❌ 再想想'}{puzzleState.userMove && <span className="ml-2">你的走法：{puzzleState.userMove}</span>}</div>)}
              </div>
            ) : moveHistory.length === 0 ? (<div className="flex-1 flex items-center justify-center"><p className="text-white/30 text-xs">开始下棋，走法会显示在这里</p></div>) : (
              <div className="flex-1 overflow-y-auto"><div className="grid grid-cols-2 gap-1">{moveHistory.map((move, i) => (<span key={i} className={`text-xs px-2 py-1 rounded ${i % 2 === 0 ? 'bg-white/5 text-white/60' : 'bg-white/10 text-white'}`}>{Math.floor(i / 2) + 1}.{move}</span>))}</div></div>
            )}
          </div>

          {/* 使用说明 */}
          <div className="bg-black/30 backdrop-blur rounded-2xl p-4 mb-3">
            <h3 className="text-white/80 text-sm font-medium mb-3">📖 使用说明</h3>
            <div className="space-y-2">{GUIDE_ITEMS.map((item, i) => (<div key={i} className="flex items-center gap-2.5"><span className="text-base">{item.icon}</span><div><span className="text-white/90 text-xs font-medium">{item.title}</span><span className="text-white/40 text-xs ml-1">{item.desc}</span></div></div>))}</div>
          </div>

          {/* 棋灵状态 */}
          <div className="bg-black/30 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-xl shadow-lg">{CHESS_SPIRIT.avatar}</div>
              <div><h2 className="text-white font-bold text-sm">炭治郎 <span className="text-xs text-red-300">♟️棋灵</span></h2><p className="text-white/40 text-xs">{mode === 'puzzle' ? `📊 ${puzzleScore.correct}/${puzzleScore.total}` : isAIThinking ? '🤔 思考中...' : gameStatus}</p></div>
            </div>
            <div className="mt-2 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
          </div>
        </section>

        {/* 右侧栏 - AI对话 */}
        <aside className="flex-[1] flex flex-col min-h-0">
          <div className="flex-1 flex flex-col bg-black/20 backdrop-blur rounded-2xl min-h-0">
            <div className="px-4 py-2.5 border-b border-white/5"><h3 className="text-white/80 text-sm font-medium">💬 与炭治郎对话</h3></div>
            <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
              {messages.map(msg => (<div key={msg.id} className={`flex ${msg.sender === 'spirit' ? 'justify-start' : 'justify-end'}`}><div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${msg.sender === 'spirit' ? 'bg-white/10 text-white/90' : 'bg-red-500/70 text-white'}`}><p className="leading-relaxed">{msg.text}</p><p className={`text-[10px] mt-1 ${msg.sender === 'spirit' ? 'text-white/40' : 'text-white/60'}`}>{msg.time}</p></div></div>))}
            </div>
            <div className="p-3 border-t border-white/5">
              <div className="flex gap-2">
                <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="问炭治郎任何问题..." className="flex-1 bg-white/10 text-white text-sm placeholder-white/30 rounded-xl px-3 py-2 outline-none" />
                <button onClick={handleSend} disabled={isAIThinking} className="px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white rounded-xl text-sm font-medium transition">发送</button>
              </div>
            </div>
          </div>
        </aside>
      </main>

      <footer className="text-center py-2 text-white/30 text-xs">⚔️ 孜孜国际象棋AI教练 · 鬼灭之刃主题 · 棋灵炭治郎</footer>
    </div>
  )
}

export default App
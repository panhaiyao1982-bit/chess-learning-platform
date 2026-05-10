import { Chess } from 'chess.js'
import { useState, useEffect, useRef } from 'react'
import { Chessboard } from 'react-chessboard'

const CHESS_SPIRIT = { name: '炭治郎', avatar: '👹' }
const GUIDE_ITEMS = [
  { icon: '♟️', title: '自由对局', desc: '与AI下棋练习，AI会自动回应' },
  { icon: '🎯', title: '战术题库', desc: '每天挑战战术题，提高棋艺' },
  { icon: '💬', title: 'AI对话', desc: '向炭治郎提问，获得指导' },
  { icon: '📊', title: '积分系统', desc: '答对获得金币，解锁功能' }
]
const SAMPLE_PUZZLES = [
  { id: 1, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', moves: ['Qf3'], theme: '双射', rating: 800, hint: '白棋先走，有什么战术？' },
  { id: 2, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', moves: ['Bxf7+'], theme: '将军', rating: 600, hint: '用象吃 f7 的兵！' }
]

interface PuzzleState { puzzle: typeof SAMPLE_PUZZLES[0]; userMove: string | null; result: 'pending' | 'correct' | 'wrong'; step: 'view' | 'try' | 'result' }
interface ChatMessage { id: number; sender: 'spirit' | 'user'; text: string; time: string }

// 直接调用大模型
async function directAI(modelMessage: string): Promise<string> {
  try {
    const response = await fetch('https://v2.aicodee.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_MINIMAX_API_KEY || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7-highspeed',
        messages: [{ role: 'user', content: modelMessage }]
      })
    })
    const data = await response.json()
    return data.choices?.[0]?.message?.content || ''
  } catch { return '' }
}

// 对话（炭治郎语气）
async function spiritChat(userMsg: string): Promise<string> {
  const prompt = `你是炭治郎，孜孜国际象棋AI教练（鬼灭之刃主题），活泼、鼓励、简短。用户说："${userMsg}"\n请用炭治郎的语气回复，30字以内，中文。`
  return directAI(prompt)
}

// 棋局分析（每一步实时评论）
async function analyzeMove(lastMove: string, moveCount: number, isCheck: boolean, isCapture: boolean, isGameOver: boolean): Promise<string> {
  const round = Math.ceil(moveCount / 2)

  if (isGameOver) {
    return [`🎉 太棒了！「${lastMove}」锁定胜局！🏆`, `🏆 胜利！最后一步「${lastMove}」完美！✨`, `✨ 赢啦！${lastMove}这一招绝了！🔥`][Math.floor(Math.random() * 3)]
  } else if (isCheck) {
    const responses = [
      `「${lastMove}」将军了！干得漂亮！🔥`,
      `将军！对面要头疼了 💥`,
      `太妙了！${lastMove}这一招将军！⚔️`,
      `「${lastMove}」！对面陷入危机！🎯`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  } else if (isCapture) {
    const responses = [
      `吃子！「${lastMove}」漂亮！🥳`,
      `好棋！${lastMove}吃回一子！`,
      `「${lastMove}」吃得好！继续加油 💪`,
      `赞！${lastMove}缴获一子！🏆`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  } else {
    const responses = [
      `「${lastMove}」，这步走得好！继续 👍`,
      `不错的步法！${lastMove}继续保持 🎌`,
      `第${round}回合，「${lastMove}」，稳扎稳打！✨`,
      `${lastMove}～思路清晰，继续进攻！⚔️`,
      `「${lastMove}」！这步有想法 😊`,
      `不错不错，${lastMove}，下一步更精彩！🌟`,
      `第${round}回合！${lastMove}，你的棋越来越强了！💪`,
      `「${lastMove}」～有潜力！继续探索 🔮`
    ]
    return responses[Math.floor(Math.random() * responses.length)]
  }
}
    return responses[Math.floor(Math.random() * responses.length)]
  }
}

function App() {
  const [chess] = useState(new Chess())
  const [chessFen, setChessFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  const [chessHistory, setChessHistory] = useState<string[]>([])
  const [chessStatus, setChessStatus] = useState('⚔️ 执白先行')
  const [puzzleState, setPuzzleState] = useState<PuzzleState | null>(null)
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [puzzleScore, setPuzzleScore] = useState({ correct: 0, total: 0 })
  const [mode, setMode] = useState<'chess' | 'puzzle'>('chess')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isAIThinking, setIsAIThinking] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMessages([{
      id: Date.now(),
      sender: 'spirit',
      text: '欢迎来到孜孜国际象棋AI教练！我是炭治郎 🎌 你每走一步，我都会给你实时的建议和鼓励哦！',
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }])
    loadPuzzle(0)
  }, [])

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  const addSpiritMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now(), sender: 'spirit', text, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }])
  }

  // AI 走棋（随机）
  const makeAIMove = () => {
    const moves = chess.moves()
    if (moves.length === 0) return
    const move = moves[Math.floor(Math.random() * moves.length)]
    chess.move(move)
    setChessFen(chess.fen())
    setChessHistory(prev => [...prev, move])
    const nextColor = chess.turn() === 'w' ? '白' : '黑'
    if (chess.isCheckmate()) {
      setChessStatus(`${nextColor}棋获胜！✨`)
      addSpiritMessage(`🏆 对局结束！${nextColor}棋获胜！你真棒！`)
    } else if (chess.isCheck()) {
      setChessStatus(`${nextColor}棋将军！`)
      addSpiritMessage(`⚠️ ${nextColor}棋正在将军！冷静应对！`)
    } else {
      setChessStatus(`⚔️ ${nextColor}棋回合`)
    }
    setIsAIThinking(false)
  }

  // 走棋处理
  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (mode === 'chess') {
      try {
        const move = chess.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
        if (move) {
          setChessFen(chess.fen())
          const newHistory = [...chessHistory, move.san]
          setChessHistory(newHistory)
          const nextColor = chess.turn() === 'w' ? '白' : '黑'
          const isCheck = chess.isCheck()
          const isCapture = move.captured !== undefined
          const isGameOver = chess.isCheckmate()

          if (isGameOver) {
            setChessStatus(move.color === 'w' ? '✨ 白棋获胜！' : '黑棋获胜！')
            addSpiritMessage(`🏆 太棒了！你赢了！这盘棋下得真精彩！`)
          } else if (isCheck) {
            setChessStatus(`${nextColor}棋将军！`)
            analyzeMove(move.san, newHistory.length, true, false, false).then(msg => addSpiritMessage(msg))
            if (!chess.isGameOver()) { setIsAIThinking(true); setTimeout(() => makeAIMove(), 800) }
          } else {
            setChessStatus(`⚔️ ${nextColor}棋回合`)
            analyzeMove(move.san, newHistory.length, false, isCapture, false).then(msg => addSpiritMessage(msg))
            if (!chess.isGameOver()) { setIsAIThinking(true); setTimeout(() => makeAIMove(), 800) }
          }
          return true
        }
      } catch { return false }
      return false
    } else if (mode === 'puzzle' && puzzleState?.step === 'try') {
      try {
        const move = chess.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
        if (move) {
          setChessFen(chess.fen())
          const isCorrect = puzzleState.puzzle.moves.includes(move.san)
          if (isCorrect) {
            setPuzzleState(prev => prev ? { ...prev, result: 'correct', step: 'result', userMove: move.san } : null)
            setPuzzleScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }))
            addSpiritMessage(`🎉 正确！「${move.san}」这道${puzzleState.puzzle.theme}题你解出来了！`)
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
    chess.reset()
    const puzzle = SAMPLE_PUZZLES[index % SAMPLE_PUZZLES.length]
    chess.load(puzzle.fen)
    setChessFen(puzzle.fen)
    setPuzzleState({ puzzle, userMove: null, result: 'pending', step: 'view' })
  }

  const goToChess = () => {
    if (mode === 'chess') return
    const lastSaved = localStorage.getItem('chessGameState')
    if (lastSaved) {
      try {
        const state = JSON.parse(lastSaved)
        chess.load(state.fen)
        setChessFen(state.fen)
        setChessHistory(state.history)
        setChessStatus(state.status)
      } catch { /* ignore */ }
    }
    setMode('chess')
  }

  const goToPuzzle = () => {
    if (mode === 'puzzle') return
    localStorage.setItem('chessGameState', JSON.stringify({ fen: chess.fen(), history: chessHistory, status: chessStatus }))
    setMode('puzzle')
    loadPuzzle(puzzleIndex)
    setPuzzleScore({ correct: 0, total: 0 })
    addSpiritMessage(`🎯 战术题库模式！ 当前题目：${SAMPLE_PUZZLES[puzzleIndex].theme}（难度${SAMPLE_PUZZLES[puzzleIndex].rating}）`)
  }

  const nextPuzzle = () => {
    const next = (puzzleIndex + 1) % SAMPLE_PUZZLES.length
    setPuzzleIndex(next)
    loadPuzzle(next)
    setPuzzleState(prev => prev ? { ...prev, step: 'try', result: 'pending', userMove: null } : null)
    addSpiritMessage(`📖 第${next + 1}题：${SAMPLE_PUZZLES[next].hint}`)
  }

  const handleSend = async () => {
    if (!inputText.trim()) return
    const userMsg: ChatMessage = { id: Date.now(), sender: 'user', text: inputText.trim(), time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }
    setMessages(prev => [...prev, userMsg])
    setInputText('')
    setIsAIThinking(true)
    const reply = await spiritChat(inputText)
    addSpiritMessage(reply || '让我想想...')
    setIsAIThinking(false)
  }

  const resetChess = () => {
    chess.reset()
    setChessFen(chess.fen())
    setChessHistory([])
    setChessStatus('⚔️ 执白先行')
    localStorage.removeItem('chessGameState')
    addSpiritMessage('🔄 对局已重新开始！加油！')
  }

  const currentStatus = mode === 'puzzle'
    ? (puzzleState ? `🎯 ${puzzleState.puzzle.theme} · ${puzzleState.puzzle.rating}` : '')
    : (isAIThinking ? '🤔 炭治郎思考中...' : chessStatus)

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
      <header className="flex items-center justify-center py-3 px-4 bg-black/20 backdrop-blur">
        <h1 className="text-2xl font-bold text-white tracking-wide">⚔️ 孜孜的国际象棋AI教练</h1>
      </header>

      <main className="flex-1 flex gap-0 p-4 min-h-0">
        {/* 棋盘区域 */}
        <section className="flex-[3] flex flex-col items-center justify-center gap-4">
          <div className="flex items-center gap-3">
            <button onClick={goToChess} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${mode === 'chess' ? 'bg-white/20 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>♟️ 自由对局</button>
            <button onClick={goToPuzzle} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${mode === 'puzzle' ? 'bg-red-500/80 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}>🎯 战术题库</button>
          </div>

          <div className="bg-black/30 backdrop-blur rounded-xl px-4 py-2 text-center">
            <span className="text-white/80 text-sm">{currentStatus}</span>
          </div>

          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-2 ring-white/10">
            <Chessboard position={chessFen} onPieceDrop={onDrop} boardWidth={Math.min(500, window.innerWidth * 0.52)} boardOrientation="white" customDarkSquareStyle={{ backgroundColor: '#3d2b1f' }} customLightSquareStyle={{ backgroundColor: '#f0d9b5' }} />
          </div>

          <div className="flex gap-3">
            {mode === 'chess' && <button onClick={resetChess} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm backdrop-blur transition">🔄 重新开局</button>}
            {mode === 'puzzle' && puzzleState?.result === 'correct' && <button onClick={nextPuzzle} className="px-5 py-2.5 bg-red-500/80 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition">📖 下一题</button>}
          </div>

          {mode === 'chess' && chessHistory.length > 0 && (
            <div className="bg-black/20 backdrop-blur rounded-xl p-3 max-w-md w-full">
              <h3 className="text-white/70 text-xs mb-2">📜 走法记录</h3>
              <div className="flex flex-wrap gap-1 text-xs">
                {chessHistory.map((move, i) => (<span key={i} className="bg-white/10 text-white/90 px-2 py-0.5 rounded">{Math.floor(i / 2) + 1}.{i % 2 === 0 ? '' : '..'}{move}</span>))}
              </div>
            </div>
          )}
        </section>

        {/* 中间栏 */}
        <section className="flex-[1.2] flex flex-col min-h-0 mx-4">
          <div className="bg-black/30 backdrop-blur rounded-2xl p-4 mb-3 flex-1 flex flex-col min-h-0">
            <h3 className="text-white/80 text-sm font-medium mb-3">{mode === 'puzzle' ? '📋 题目' : '📜 走法记录'}</h3>
            {mode === 'puzzle' ? (
              <div className="flex-1">
                <div className="text-center py-4"><div className="text-3xl font-bold text-white mb-1">{puzzleScore.correct}/{puzzleScore.total}</div><p className="text-white/40 text-xs">正确/总计</p></div>
                {puzzleState && puzzleState.result !== 'pending' && (<div className={`mt-3 p-3 rounded-xl text-sm ${puzzleState.result === 'correct' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>{puzzleState.result === 'correct' ? '✅ 正确！' : '❌ 再想想'}{puzzleState.userMove && <span className="ml-2">你的走法：{puzzleState.userMove}</span>}</div>)}
              </div>
            ) : chessHistory.length === 0 ? (<div className="flex-1 flex items-center justify-center"><p className="text-white/30 text-xs">开始下棋，我会给你实时指导！</p></div>) : (
              <div className="flex-1 overflow-y-auto"><div className="grid grid-cols-2 gap-1">{chessHistory.map((move, i) => (<span key={i} className={`text-xs px-2 py-1 rounded ${i % 2 === 0 ? 'bg-white/5 text-white/60' : 'bg-white/10 text-white'}`}>{Math.floor(i / 2) + 1}.{move}</span>))}</div></div>
            )}
          </div>

          <div className="bg-black/30 backdrop-blur rounded-2xl p-4 mb-3">
            <h3 className="text-white/80 text-sm font-medium mb-3">📖 使用说明</h3>
            <div className="space-y-2">{GUIDE_ITEMS.map((item, i) => (<div key={i} className="flex items-center gap-2.5"><span className="text-base">{item.icon}</span><div><span className="text-white/90 text-xs font-medium">{item.title}</span><span className="text-white/40 text-xs ml-1">{item.desc}</span></div></div>))}</div>
          </div>

          <div className="bg-black/30 backdrop-blur rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-xl shadow-lg">{CHESS_SPIRIT.avatar}</div>
              <div><h2 className="text-white font-bold text-sm">炭治郎 <span className="text-xs text-red-300">♟️棋灵</span></h2><p className="text-white/40 text-xs">{mode === 'puzzle' ? `📊 ${puzzleScore.correct}/${puzzleScore.total}` : isAIThinking ? '🤔 分析中...' : chessStatus}</p></div>
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
import { Chess } from 'chess.js'
import { useState, useEffect, useRef } from 'react'
import { Chessboard } from 'react-chessboard'

const SAMPLE_PUZZLES = [
  { id: 1, fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', moves: ['Qf3'], theme: '双射', rating: 800, hint: '白棋先走，有什么战术？' },
  { id: 2, fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4', moves: ['Bxf7+'], theme: '将军', rating: 600, hint: '用象吃 f7 的兵！' }
]

interface PuzzleState { puzzle: typeof SAMPLE_PUZZLES[0]; userMove: string | null; result: 'pending' | 'correct' | 'wrong'; step: 'view' | 'try' | 'result' }
interface ChatMessage { id: number; sender: 'spirit' | 'user'; text: string; time: string }

async function directAI(modelMessage: string): Promise<string> {
  try {
    const response = await fetch('https://v2.aicodee.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_MINIMAX_API_KEY || ''}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: 'MiniMax-M2.7-highspeed', messages: [{ role: 'user', content: modelMessage }] })
    })
    return response.json().then(d => d.choices?.[0]?.message?.content || '')
  } catch { return '' }
}

async function spiritChat(userMsg: string): Promise<string> {
  const prompt = `你是炭治郎，孜孜国际象棋AI教练（鬼灭之刃主题），活泼、鼓励、简短。用户说："${userMsg}"\n请用炭治郎的语气回复，30字以内，中文。`
  return directAI(prompt)
}

async function analyzeMove(lastMove: string, moveCount: number, isCheck: boolean, isCapture: boolean, isGameOver: boolean): Promise<string> {
  const round = Math.ceil(moveCount / 2)
  if (isGameOver) return [`🎉 太棒了！「${lastMove}」锁定胜局！🏆`, `🏆 胜利！最后一步「${lastMove}」完美！✨`, `✨ 赢啦！${lastMove}这一招绝了！🔥`][Math.floor(Math.random() * 3)]
  if (isCheck) { const r = [`「${lastMove}」将军了！干得漂亮！🔥`, `将军！对面要头疼了 💥`, `太妙了！${lastMove}这一招将军！⚔️`, `「${lastMove}」！对面陷入危机！🎯`]; return r[Math.floor(Math.random() * r.length)] }
  if (isCapture) { const r = [`吃子！「${lastMove}」漂亮！🥳`, `好棋！${lastMove}吃回一子！`, `「${lastMove}」吃得好！继续加油 💪`, `赞！${lastMove}缴获一子！🏆`]; return r[Math.floor(Math.random() * r.length)] }
  const responses = [`「${lastMove}」，这步走得好！继续 👍`, `不错的步法！${lastMove}继续保持 🎌`, `第${round}回合，「${lastMove}」，稳扎稳打！✨`, `${lastMove}～思路清晰，继续进攻！⚔️`, `「${lastMove}」！这步有想法 😊`, `不错不错，${lastMove}，下一步更精彩！🌟`, `第${round}回合！${lastMove}，你的棋越来越强了！💪`, `「${lastMove}」～有潜力！继续探索 🔮`]
  return responses[Math.floor(Math.random() * responses.length)]
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
  const boardWrapRef = useRef<HTMLDivElement>(null)
  const [boardAreaH, setBoardAreaH] = useState(400)

  useEffect(() => {
    setMessages([{ id: Date.now(), sender: 'spirit', text: '欢迎来到孜孜国际象棋AI教练！我是炭治郎 🎌 你每走一步，我都会给你实时的建议和鼓励哦！', time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }])
    loadPuzzle(0)
  }, [])

  useEffect(() => {
    const measure = () => { if (boardWrapRef.current) setBoardAreaH(boardWrapRef.current.offsetHeight) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight }, [messages])

  const addSpiritMessage = (text: string) => {
    setMessages(prev => [...prev, { id: Date.now(), sender: 'spirit', text, time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }])
  }

  const makeAIMove = () => {
    const moves = chess.moves()
    if (moves.length === 0) return
    const move = moves[Math.floor(Math.random() * moves.length)]
    chess.move(move)
    setChessFen(chess.fen())
    setChessHistory(prev => [...prev, move])
    const nextColor = chess.turn() === 'w' ? '白' : '黑'
    if (chess.isCheckmate()) { setChessStatus(`${nextColor}棋获胜！✨`); addSpiritMessage(`🏆 对局结束！${nextColor}棋获胜！你真棒！`) }
    else if (chess.isCheck()) { setChessStatus(`${nextColor}棋将军！`); addSpiritMessage(`⚠️ ${nextColor}棋正在将军！冷静应对！`) }
    else { setChessStatus(`⚔️ ${nextColor}棋回合`) }
    setIsAIThinking(false)
  }

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    if (mode === 'chess') {
      try {
        const move = chess.move({ from: sourceSquare, to: targetSquare, promotion: 'q' })
        if (move) {
          setChessFen(chess.fen())
          const newHistory = [...chessHistory, move.san]
          setChessHistory(newHistory)
          const nextColor = chess.turn() === 'w' ? '白' : '黑'
          const isCheck = chess.isCheck(); const isCapture = move.captured !== undefined; const isGameOver = chess.isCheckmate()
          if (isGameOver) { setChessStatus(move.color === 'w' ? '✨ 白棋获胜！' : '黑棋获胜！'); addSpiritMessage(`🏆 太棒了！你赢了！这盘棋下得真精彩！`) }
          else if (isCheck) { setChessStatus(`${nextColor}棋将军！`); analyzeMove(move.san, newHistory.length, true, false, false).then(msg => addSpiritMessage(msg)); if (!chess.isGameOver()) { setIsAIThinking(true); setTimeout(() => makeAIMove(), 800) } }
          else { setChessStatus(`⚔️ ${nextColor}棋回合`); analyzeMove(move.san, newHistory.length, false, isCapture, false).then(msg => addSpiritMessage(msg)); if (!chess.isGameOver()) { setIsAIThinking(true); setTimeout(() => makeAIMove(), 800) } }
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
          if (isCorrect) { setPuzzleState(prev => prev ? { ...prev, result: 'correct', step: 'result', userMove: move.san } : null); setPuzzleScore(prev => ({ correct: prev.correct + 1, total: prev.total + 1 })); addSpiritMessage(`🎉 正确！「${move.san}」这道${puzzleState.puzzle.theme}题你解出来了！`) }
          else { setPuzzleState(prev => prev ? { ...prev, result: 'wrong', step: 'result', userMove: move.san } : null); setPuzzleScore(prev => ({ ...prev, total: prev.total + 1 })); addSpiritMessage(`💡 不对哦，你的「${move.san}」不是最佳走法。再想想？提示：${puzzleState.puzzle.hint}`) }
          return true
        }
      } catch { return false }
      return false
    }
    return false
  }

  const loadPuzzle = (index: number) => { chess.reset(); const puzzle = SAMPLE_PUZZLES[index % SAMPLE_PUZZLES.length]; chess.load(puzzle.fen); setChessFen(puzzle.fen); setPuzzleState({ puzzle, userMove: null, result: 'pending', step: 'view' }) }
  const goToChess = () => { if (mode === 'chess') return; const lastSaved = localStorage.getItem('chessGameState'); if (lastSaved) { try { const state = JSON.parse(lastSaved); chess.load(state.fen); setChessFen(state.fen); setChessHistory(state.history); setChessStatus(state.status) } catch { /* ignore */ } }; setMode('chess') }
  const goToPuzzle = () => { if (mode === 'puzzle') return; localStorage.setItem('chessGameState', JSON.stringify({ fen: chess.fen(), history: chessHistory, status: chessStatus })); setMode('puzzle'); loadPuzzle(puzzleIndex); setPuzzleScore({ correct: 0, total: 0 }); addSpiritMessage(`🎯 战术题库模式！ 当前题目：${SAMPLE_PUZZLES[puzzleIndex].theme}（难度${SAMPLE_PUZZLES[puzzleIndex].rating}）`) }
  const nextPuzzle = () => { const next = (puzzleIndex + 1) % SAMPLE_PUZZLES.length; setPuzzleIndex(next); loadPuzzle(next); setPuzzleState(prev => prev ? { ...prev, step: 'try', result: 'pending', userMove: null } : null); addSpiritMessage(`📖 第${next + 1}题：${SAMPLE_PUZZLES[next].hint}`) }
  const handleSend = async () => { if (!inputText.trim()) return; const userMsg: ChatMessage = { id: Date.now(), sender: 'user', text: inputText.trim(), time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) }; setMessages(prev => [...prev, userMsg]); setInputText(''); setIsAIThinking(true); const reply = await spiritChat(inputText); addSpiritMessage(reply || '让我想想...'); setIsAIThinking(false) }
  const resetChess = () => { chess.reset(); setChessFen(chess.fen()); setChessHistory([]); setChessStatus('⚔️ 执白先行'); localStorage.removeItem('chessGameState'); addSpiritMessage('🔄 对局已重新开始！加油！') }

  const currentStatus = mode === 'puzzle' ? (puzzleState ? `🎯 ${puzzleState.puzzle.theme} · ${puzzleState.puzzle.rating}` : '') : (isAIThinking ? '🤔 炭治郎思考中...' : chessStatus)
  const boardW = typeof window !== 'undefined' ? Math.min(Math.max(window.innerWidth * 0.36, 220), 480) : 400

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">⚔️ 孜孜国际象棋AI教练</h1>
        <div className="nav-tabs">
          {mode === 'chess' && <button onClick={resetChess} className="nav-btn nav-reset">🔄 重新开局</button>}
          <button onClick={goToChess} className={`nav-btn ${mode === 'chess' ? 'nav-active' : ''}`}>♟️ 自由对局</button>
          <button onClick={goToPuzzle} className={`nav-btn ${mode === 'puzzle' ? 'nav-active' : ''}`}>🎯 战术题库</button>
          <span className="nav-status">{currentStatus}</span>
        </div>
      </header>

      <div className="app-body">
        {/* 左：棋盘 */}
        <div className="left-panel">
          <div className="board-wrap" ref={boardWrapRef}>
            <Chessboard position={chessFen} onPieceDrop={onDrop} boardWidth={boardW} boardOrientation="white" customDarkSquareStyle={{ backgroundColor: '#3d2b1f' }} customLightSquareStyle={{ backgroundColor: '#f0d9b5' }} />
          </div>
          {mode === 'puzzle' && puzzleState?.result === 'correct' && (
            <button onClick={nextPuzzle} className="btn-primary">📖 下一题</button>
          )}
        </div>

        {/* 中：AI对话（高度与棋盘等高） */}
        <div className="center-panel" style={{ height: boardAreaH }}>
          <div className="panel-header">💬 与炭治郎对话</div>
          <div className="chat-messages" ref={chatRef}>
            {messages.map(msg => (
              <div key={msg.id} className={`msg-wrap ${msg.sender === 'spirit' ? 'msg-left' : 'msg-right'}`}>
                <div className={`msg-bubble ${msg.sender === 'spirit' ? 'msg-spirit' : 'msg-user'}`}>
                  <p className="msg-text">{msg.text}</p>
                  <p className="msg-time">{msg.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="chat-input-bar">
            <input className="chat-input" type="text" value={inputText} onChange={e => setInputText(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="问炭治郎任何问题..." />
            <button className="send-btn" onClick={handleSend} disabled={isAIThinking}>发送</button>
          </div>
        </div>

        {/* 右：走法记录（高度与棋盘等高） */}
        <div className="right-panel" style={{ height: boardAreaH }}>
          <div className="panel-header">📜 走法记录</div>
          <div className="record-body">
            {mode === 'puzzle' ? (
              <div>
                <div className="puzzle-score"><div className="score-num">{puzzleScore.correct}/{puzzleScore.total}</div><div className="score-label">正确/总计</div></div>
                {puzzleState && puzzleState.result !== 'pending' && (
                  <div className={`result-badge ${puzzleState.result === 'correct' ? 'correct' : 'wrong'}`}>
                    {puzzleState.result === 'correct' ? '✅ 正确！' : '❌ 再想想'}
                    {puzzleState.userMove && <div className="user-move">你的：{puzzleState.userMove}</div>}
                  </div>
                )}
                {puzzleState && <div className="puzzle-hint">{puzzleState.puzzle.hint}</div>}
              </div>
            ) : chessHistory.length === 0 ? (
              <div className="record-empty">开始下棋<br />我会实时指导！</div>
            ) : (
              <div className="move-list">{chessHistory.map((move, i) => (
                <div key={i} className={`move-row ${i % 2 === 0 ? 'even' : 'odd'}`}>
                  <span className="move-num">{Math.floor(i / 2) + 1}.</span>
                  <span className="move-san">{move}</span>
                </div>
              ))}</div>
            )}
          </div>
        </div>
      </div>

      <footer className="app-footer">⚔️ 孜孜国际象棋AI教练 · 鬼灭之刃主题 · 棋灵炭治郎</footer>
    </div>
  )
}

export default App
import { Chess } from 'chess.js'
import { useState, useRef, useEffect } from 'react'
import { Chessboard } from 'react-chessboard'

// 棋灵角色配置
const CHESS_SPIRIT = {
  name: '炭治郎',
  title: '棋灵',
  description: '你的专属国际象棋AI教练，跟你一起学棋、练棋、讲题',
  avatar: '👹', // 暂时用emoji，后续换成鬼灭风格的图片
  greeting: '欢迎来到孜孜国际象棋AI教练！我是炭治郎，让我们开始有趣的国际象棋之旅吧！'
}

interface ChatMessage {
  id: number
  sender: 'spirit' | 'user'
  text: string
  time: string
}

function App() {
  const [chess] = useState(new Chess())
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [gameStatus, setGameStatus] = useState('执白先行')
  const [moveHistory, setMoveHistory] = useState<string[]>([])
  const chatRef = useRef<HTMLDivElement>(null)

  // 初始化棋灵问候
  useEffect(() => {
    setMessages([{
      id: Date.now(),
      sender: 'spirit',
      text: CHESS_SPIRIT.greeting,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }])
  }, [])

  // 自动滚动聊天
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  const onDrop = (sourceSquare: string, targetSquare: string) => {
    try {
      const move = chess.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      })
      if (move) {
        setFen(chess.fen())
        const newHistory = [...moveHistory, move.san]
        setMoveHistory(newHistory)

        // 更新游戏状态
        if (chess.isCheckmate()) {
          setGameStatus(move.color === 'w' ? '白棋获胜！✨' : '黑棋获胜！')
        } else if (chess.isCheck()) {
          setGameStatus(`${move.color === 'w' ? '白' : '黑'}棋将军！`)
        } else if (chess.isDraw()) {
          setGameStatus('和棋')
        } else {
          setGameStatus(move.color === 'w' ? '黑棋回合' : '白棋回合')
        }

        // 棋灵自动回应（简单演示）
        if (chess.isCheckmate()) {
          setTimeout(() => {
            addSpiritMessage('🎉 精彩！你赢了！这场对局真棒，让我们来复盘一下吧！')
          }, 500)
        } else if (chess.isCheck()) {
          setTimeout(() => {
            addSpiritMessage('💡 注意！对面正在将军，需要化解危机哦！')
          }, 300)
        }

        return true
      }
    } catch {
      return false
    }
    return false
  }

  const addSpiritMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'spirit',
      text,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }])
  }

  const handleSend = () => {
    if (!inputText.trim()) return

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputText.trim(),
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMsg])
    setInputText('')

    // 棋灵回复（演示用，实际接入大模型）
    setTimeout(() => {
      const replies = [
        '让我想想...这步棋很有意思！继续加油 💪',
        '你想了解哪个战术？我可以给你讲解双射、闪击、牵制等技巧！',
        '每盘棋都是一次学习的机会，输赢不重要，重要的是享受下棋的过程 🎌',
        '要不来一局AI陪练？我会调整到适合你的难度哦！',
        '记住口诀：中心控制、王前兵、出子快、占开放线！'
      ]
      const reply = replies[Math.floor(Math.random() * replies.length)]
      addSpiritMessage(reply)
    }, 800)
  }

  const resetGame = () => {
    chess.reset()
    setFen(chess.fen())
    setMoveHistory([])
    setGameStatus('执白先行')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">

      {/* 标题栏 */}
      <header className="flex items-center justify-center py-3 px-4 bg-black/20 backdrop-blur">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            ⚔️ 孜孜的国际象棋AI教练
          </h1>
          <p className="text-white/60 text-xs mt-0.5">鬼灭之刃主题 · 棋灵炭治郎陪你学棋</p>
        </div>
      </header>

      {/* 主区域：棋盘(3/4) + 侧边栏(1/4) */}
      <main className="flex-1 flex gap-0 p-4 min-h-0">

        {/* 棋盘区域 - 占3/4宽度 */}
        <section className="flex-[3] flex flex-col items-center justify-center gap-4">
          {/* 棋灵状态提示 */}
          <div className="bg-black/30 backdrop-blur rounded-xl px-4 py-2 text-center">
            <span className="text-white/80 text-sm">
              🔔 {gameStatus}
            </span>
          </div>

          {/* 棋盘 */}
          <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50 ring-2 ring-white/10">
            <Chessboard
              position={fen}
              onPieceDrop={onDrop}
              boardWidth={Math.min(560, window.innerWidth * 0.7)}
              boardOrientation="white"
              arePiecesDraggable={true}
              customBoardStyle={{
                borderRadius: '0'
              }}
              customDarkSquareStyle={{ backgroundColor: '#3d2b1f' }}
              customLightSquareStyle={{ backgroundColor: '#f0d9b5' }}
            />
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 mt-2">
            <button
              onClick={resetGame}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm backdrop-blur transition"
            >
              🔄 重新开局
            </button>
            <button
              onClick={() => addSpiritMessage('📖 国际象棋规则：白棋先走，双方轮流下棋。将死对方的王则获胜！')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm backdrop-blur transition"
            >
              📖 规则说明
            </button>
          </div>

          {/* 走法记录 */}
          {moveHistory.length > 0 && (
            <div className="bg-black/20 backdrop-blur rounded-xl p-3 max-w-md w-full">
              <h3 className="text-white/70 text-xs mb-2">📜 走法记录</h3>
              <div className="flex flex-wrap gap-1 text-xs">
                {moveHistory.map((move, i) => (
                  <span key={i} className="bg-white/10 text-white/90 px-2 py-0.5 rounded">
                    {Math.floor(i / 2) + 1}.{i % 2 === 0 ? '' : '..'}{move}
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* 侧边栏 - 占1/4宽度 */}
        <aside className="flex-[1] flex flex-col min-h-0 ml-4">

          {/* 棋灵卡片 */}
          <div className="bg-black/30 backdrop-blur rounded-2xl p-4 mb-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-400 flex items-center justify-center text-2xl shadow-lg">
                {CHESS_SPIRIT.avatar}
              </div>
              <div>
                <h2 className="text-white font-bold text-base">{CHESS_SPIRIT.name} <span className="text-xs text-red-300">♟️棋灵</span></h2>
                <p className="text-white/50 text-xs">{CHESS_SPIRIT.title}</p>
              </div>
            </div>
            <p className="text-white/60 text-xs leading-relaxed">{CHESS_SPIRIT.description}</p>

            {/* 鬼灭风格装饰线 */}
            <div className="mt-3 h-px bg-gradient-to-r from-transparent via-red-400/50 to-transparent" />
          </div>

          {/* 快速功能 */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { icon: '⚔️', label: 'AI陪练', action: () => addSpiritMessage('⚔️ AI陪练已开启！我会配合你的水平一起练习！') },
              { icon: '📚', label: '战术题库', action: () => addSpiritMessage('📚 战术题库准备中...让我们从双射开始学起！') },
              { icon: '🎯', label: '课程学习', action: () => addSpiritMessage('🎯 课程学习模式！你想从哪课开始？L1~L8任你选！') },
              { icon: '🔄', label: '复盘分析', action: () => addSpiritMessage('🔄 复盘分析中...这盘棋你的开局不错！') },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="bg-white/5 hover:bg-white/10 text-white rounded-xl p-2.5 text-center backdrop-blur transition"
              >
                <div className="text-lg mb-0.5">{item.icon}</div>
                <div className="text-xs text-white/70">{item.label}</div>
              </button>
            ))}
          </div>

          {/* AI对话区域 */}
          <div className="flex-1 flex flex-col bg-black/20 backdrop-blur rounded-2xl min-h-0">

            {/* 对话标题 */}
            <div className="px-4 py-2.5 border-b border-white/5">
              <h3 className="text-white/80 text-sm font-medium flex items-center gap-1.5">
                💬 与炭治郎对话
              </h3>
            </div>

            {/* 对话列表 */}
            <div ref={chatRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'spirit' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    msg.sender === 'spirit'
                      ? 'bg-white/10 text-white/90'
                      : 'bg-red-500/70 text-white'
                  }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'spirit' ? 'text-white/40' : 'text-white/60'}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 输入框 */}
            <div className="p-3 border-t border-white/5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="问炭治郎任何问题..."
                  className="flex-1 bg-white/10 text-white text-sm placeholder-white/30 rounded-xl px-3 py-2 outline-none focus:ring-1 ring-white/20"
                />
                <button
                  onClick={handleSend}
                  className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition"
                >
                  发送
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* 底部装饰 */}
      <footer className="text-center py-2 text-white/30 text-xs">
        ⚔️ 孜孜国际象棋AI教练 · 鬼灭之刃主题 · 棋灵炭治郎
      </footer>
    </div>
  )
}

export default App
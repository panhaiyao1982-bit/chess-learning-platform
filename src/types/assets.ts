/**
 * 棋灵炭治郎 - 孜孜国际象棋AI教练
 * 鬼灭之刃主题：灶门炭治郎担任AI棋灵角色
 * 
 * 素材路径：/vol2/1000/AI/ATA/素还真/chess-learning/public/images/
 */

export const CHESS_SPIRIT = {
  name: '炭治郎',
  title: '棋灵',
  description: '你的专属国际象棋AI教练，跟你一起学棋、练棋、讲题',
  theme: '鬼灭之刃',
  avatarEmoji: '👹'
} as const

export const ASSET_MANIFEST = {
  characters: {
    // 棋灵炭治郎（后续会用鬼灭风格的图片替换emoji）
    chess_spirit_tanjiro: {
      name: '炭治郎（棋灵）',
      url: '', // 等待生图Agent生成
      emoji: '👹',
      theme: '鬼灭之刃',
      states: ['happy', 'thinking', 'explaining', 'celebrating']
    },
    // 其他鬼灭角色棋子（后续生成）
    chess_spirit_nezuko: {
      name: '祢豆子',
      url: '',
      emoji: '👧',
      theme: '鬼灭之刃',
      states: ['sleeping', 'protecting', 'awakening']
    }
  },
  lessons: {
    lesson_L1_cover: { name: '认识国际象棋', url: '/images/lessons/lesson_L1_cover.png' },
    lesson_L2_cover: { name: '吃子与对杀', url: '/images/lessons/lesson_L2_cover.png' },
    lesson_L3_cover: { name: '基础杀法', url: '/images/lessons/lesson_L3_cover.png' },
    lesson_L4_cover: { name: '开局基础', url: '/images/lessons/lesson_L4_cover.png' },
    lesson_L5_cover: { name: '基础战术', url: '/images/lessons/lesson_L5_cover.png' },
    lesson_L6_cover: { name: '残局基础', url: '/images/lessons/lesson_L6_cover.png' },
    lesson_L7_cover: { name: '中局策略', url: '/images/lessons/lesson_L7_cover.png' },
    lesson_L8_cover: { name: '综合实战', url: '/images/lessons/lesson_L8_cover.png' }
  },
  pieces: {
    // 鬼灭主题棋子（黑白双方各6种）
    white_king: { name: '灶门炭治郎', url: '/images/pieces/white_king.png', emoji: '👹' },
    white_queen: { name: '灶门祢豆子', url: '/images/pieces/white_queen.png', emoji: '👧' },
    white_rook: { name: '我妻善逸', url: '/images/pieces/white_rook.png', emoji: '⚡' },
    white_bishop: { name: '嘴平伊之助', url: '/images/pieces/white_bishop.png', emoji: '🐗' },
    white_knight: { name: '富冈义勇', url: '/images/pieces/white_knight.png', emoji: '🌊' },
    white_pawn: { name: '灶门祢豆子（鬼化）', url: '/images/pieces/white_pawn.png', emoji: '👹' },
    black_king: { name: '鬼舞辻无惨', url: '/images/pieces/black_king.png', emoji: '🦇' },
    black_queen: { name: '半天狗', url: '/images/pieces/black_queen.png', emoji: '👹' },
    black_rook: { name: '妓夫太郎', url: '/images/pieces/black_rook.png', emoji: '⚔️' },
    black_bishop: { name: '玉壶', url: '/images/pieces/black_bishop.png', emoji: '壶' },
    black_knight: { name: '半天狗（空殁）', url: '/images/pieces/black_knight.png', emoji: '👻' },
    black_pawn: { name: '下弦鬼', url: '/images/pieces/black_pawn.png', emoji: '👹' }
  },
  tactics: {
    tactic_double_attack: { name: '双击', url: '/images/tactics/tactic_double_attack.png' },
    tactic_pin: { name: '牵制', url: '/images/tactics/tactic_pin.png' },
    tactic_fork: { name: '闪击', url: '/images/tactics/tactic_fork.png' },
    tactic_skewer: { name: '引离', url: '/images/tactics/tactic_skewer.png' },
    tactic_discovered: { name: '闪躲', url: '/images/tactics/tactic_discovered.png' }
  },
  badges: {
    badge_first_win: { name: '首胜', url: '/images/badges/badge_first_win.png' },
    badge_7day_streak: { name: '坚持7天', url: '/images/badges/badge_7day_streak.png' },
    badge_tactics_master: { name: '战术大师', url: '/images/badges/badge_tactics_master.png' },
    badge_first_lessons: { name: '完成第一课', url: '/images/badges/badge_first_lessons.png' },
    badge_chess_champion: { name: '象棋冠军', url: '/images/badges/badge_chess_champion.png' }
  }
} as const

export type CharacterId = keyof typeof ASSET_MANIFEST.characters
export type LessonId = keyof typeof ASSET_MANIFEST.lessons
export type PieceId = keyof typeof ASSET_MANIFEST.pieces
export type TacticId = keyof typeof ASSET_MANIFEST.tactics
export type BadgeId = keyof typeof ASSET_MANIFEST.badges
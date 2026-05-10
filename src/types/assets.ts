/**
 * 素材清单 - 由 Manifest 生成，代码直接引用
 * 所有图片路径均来自 /vol2/1000/AI/ATA/素还真/chess-learning/assets-manifest.json
 */

export const ASSET_MANIFEST = {
  characters: {
    mascot_queen: {
      name: '小女王琪雅',
      url: '/images/characters/mascot_queen.png',
      states: ['happy', 'thinking', 'explaining', 'celebrating']
    },
    mascot_knight: {
      name: '骑士阿塔',
      url: '/images/characters/mascot_knight.png',
      states: ['ready', 'protecting', 'proud']
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
    white_king: { name: '白国王', url: '/images/pieces/white_king.png' },
    white_queen: { name: '白皇后', url: '/images/pieces/white_queen.png' },
    white_rook: { name: '白车', url: '/images/pieces/white_rook.png' },
    white_bishop: { name: '白象', url: '/images/pieces/white_bishop.png' },
    white_knight: { name: '白马', url: '/images/pieces/white_knight.png' },
    white_pawn: { name: '白兵', url: '/images/pieces/white_pawn.png' },
    black_king: { name: '黑国王', url: '/images/pieces/black_king.png' },
    black_queen: { name: '黑皇后', url: '/images/pieces/black_queen.png' },
    black_rook: { name: '黑车', url: '/images/pieces/black_rook.png' },
    black_bishop: { name: '黑象', url: '/images/pieces/black_bishop.png' },
    black_knight: { name: '黑马', url: '/images/pieces/black_knight.png' },
    black_pawn: { name: '黑兵', url: '/images/pieces/black_pawn.png' }
  },
  tactics: {
    tactic_double_attack: { name: '双射', url: '/images/tactics/tactic_double_attack.png' },
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

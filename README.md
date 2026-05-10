# 琪雅学棋 - 儿童国际象棋教学平台

> 一款面向6~14岁少儿的国际象棋趣味学习平台，支持AI语音实时讲题、互动陪练、战术题库

## 🎯 项目状态

| 阶段 | 状态 | 说明 |
|------|------|------|
| 需求文档 | ✅ 完成 | `/vol1/@apphome/trim.openclaw/data/workspace/docs/chess-learning-platform-requirement.md` |
| 工作流方案 | ✅ 完成 | `/vol1/@apphome/trim.openclaw/data/workspace/docs/ai-workflow-for-chess-app.md` |
| 协作协议 | ✅ 完成 | `/vol1/@apphome/trim.openclaw/data/workspace/docs/agent-coordination-protocol.md` |
| 项目骨架 | ✅ 完成 | Git已初始化，素材清单已生成 |
| 素材生成 | ⏳ 待开始 | 共78个素材（pending状态） |
| 代码开发 | ⏳ 待开始 | 等待素材生成完毕 |
| 部署上线 | ⏳ 待开始 | GitHub Pages托管 |

## 📁 项目结构

```
chess-learning/                      # 项目根目录（共享目录）
├── assets-manifest.json             # ⭐ 核心：所有素材的清单（多Agent协作契约）
├── src/
│   ├── App.tsx                     # 主应用
│   ├── main.tsx                    # 入口
│   ├── index.css                   # 全局样式
│   ├── types/
│   │   └── assets.ts               # ⭐ 代码里引用图片的接口
│   ├── data/                       # 数据文件（待生成）
│   └── components/                 # React组件（待生成）
├── public/images/                  # ⭐ 图片资源目录（待生成）
│   ├── characters/                 # 吉祥物角色图
│   ├── lessons/                    # 课程封面
│   ├── pieces/                     # 卡通棋子图
│   ├── tactics/                    # 战术示意图
│   ├── badges/                     # 成就徽章
│   ├── backgrounds/               # 背景图
│   └── ui/                        # UI插图
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 🚀 本地运行

```bash
cd /vol2/1000/AI/ATA/素还真/chess-learning

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建（上传GitHub前）
npm run build
```

## 📋 待办事项

### 玄同需要做的事
1. **在 GitHub 上创建空仓库**：`https://github.com/new`
   - 仓库名：`chess-learning-platform`
   - 设为 Public（GitHub Pages需要Public）
   - 不要勾选 README/许可证（本地已有）

2. **推送代码到 GitHub**：
   ```bash
   cd /vol2/1000/AI/ATA/素还真/chess-learning
   git branch -M main
   git push -u origin main
   ```

3. **开启 GitHub Pages**：
   - 进入仓库 → Settings → Pages → Source: `gh-pages` branch

4. **开启 GitHub Actions 自动部署**（可选）：
   - 以后每次 push 代码到 main 分支，自动构建并发布

### 素还真（吾）需要做的事
1. ⏳ **生成78个素材图片**（调用生图API，逐个生成）
2. ⏳ **生成React组件代码**（读取已生成的图片，写完整组件）
3. ⏳ **配置GitHub Actions**（自动构建部署）

## 🎨 素材清单（78个）

| 分类 | 数量 | 说明 |
|------|------|------|
| characters | 2 | 小女王琪雅(4状态) + 骑士阿塔(3状态) |
| lessons | 8 | L1~L8 每课封面 |
| pieces | 12 | 黑白各6种棋子 |
| tactics | 5 | 5种战术示意图 |
| badges | 5 | 成就徽章 |
| ui | 3 | 空状态/加载中/错误提示 |
| backgrounds | 3 | 背景图 |
| **合计** | **78** | |

## 🔗 访问地址（上线后）

- GitHub Pages：`https://panhaiyao1982-bit.github.io/chess-learning-platform/`
- （玄同的GitHub用户名：panhaiyao1982-bit）

## 📝 提交记录

- `fa73442` - Initial: 项目骨架 + assets-manifest (78个素材清单)

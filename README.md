# 儒道双贤智慧咨询系统

一个基于React和Coze API的儒家、道家哲学咨询聊天前端应用，为用户提供孔孟仁义之道与老庄自然之学的双重智慧指导。

## ✨ 特性

- 🎯 **儒道并重** - 专注儒家、道家两大哲学流派
- 📚 **经典智慧** - 融合《论语》《道德经》等经典思想
- 💭 **双重视角** - 可从儒道两个角度分析同一问题
- 🎨 **古典设计** - 采用传统中国风配色和字体
- 💬 **智能对话** - 集成Coze API，提供专业的哲学咨询

*承孔孟仁义之道，续老庄自然之学* 🌸

## 🎨 设计风格

- **主色调**: 深绿色 (#2c5530) - 象征自然与智慧
- **辅助色**: 朱红色 (#dc143c) - 代表热情与活力  
- **背景色**: 米色渐变 - 营造温和雅致的氛围
- **字体**: Noto Serif SC - 优雅的中文衬线字体

## 🚀 快速开始

### 环境要求

- Node.js 16.0 或更高版本
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 配置API

在 `src/services/cozeApi.js` 中配置您的Coze API密钥：

```javascript
this.apiClient = new CozeAPI({
  token: '您的Coze API Token',
  baseURL: 'https://api.coze.cn'
});
```

### 启动项目

```bash
npm start
```

应用将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
```

## 📁 项目结构

```
AI国学比赛/
├── public/
│   └── index.html          # HTML模板
├── src/
│   ├── components/
│   │   ├── ChatInterface.js    # 聊天界面组件
│   │   └── ChatInterface.css   # 聊天界面样式
│   ├── services/
│   │   └── cozeApi.js          # Coze API服务
│   ├── App.js                  # 主应用组件
│   ├── App.css                 # 主样式文件
│   ├── index.js                # 应用入口
│   └── index.css               # 基础样式
├── package.json
└── README.md
```

## 🔧 主要功能

### 智能对话
- 基于Coze API的智能对话系统
- 支持流式响应，提供实时交互体验
- 自动处理错误和网络异常

### 用户界面
- 国学风格的聊天界面
- 消息气泡动画效果
- 打字指示器和加载状态
- 响应式设计，适配各种设备

### 快速咨询
- 预设常见哲学问题
- 一键发送快速咨询
- 智能问题推荐

## 🎯 使用指南

1. **开始对话**: 访问应用后，可以看到欢迎消息和快速咨询选项
2. **提出问题**: 在输入框中输入您的人生困惑或哲学问题
3. **获得智慧**: AI助手将以古圣先贤的智慧为您答疑解惑
4. **快速咨询**: 点击预设问题快速开始对话

## 🛠️ 技术栈

- **前端框架**: React 18
- **API集成**: @coze/api
- **样式**: 纯CSS（国学风格设计）
- **字体**: Google Fonts (Noto Serif SC)

## 📝 许可证

本项目仅供学习和研究使用。

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目。

---

*以古圣先贤之智慧，解现代人生之困惑* 🌸 
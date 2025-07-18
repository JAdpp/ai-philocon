import React from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import confuciusImg from './assets/confucius.png';
import laoziImg from './assets/laozi.png';
import headerVideo from './assets/bg.mp4'; // 1. 导入视频
import mobileHeaderBg from './assets/bg.png'; // 1. 导入移动端背景图

function App() {
  return (
    <div className="App">
      {/* 2. 通过style属性传递图片路径给CSS */}
      <header className="app-header" style={{'--mobile-header-bg': `url(${mobileHeaderBg})`}}>
        {/* 2. 添加video元素作为背景 */}
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          className="header-video"
        >
          <source src={headerVideo} type="video/mp4" />
        </video>

        <div className="header-content">
          <h1 className="app-title">
            <span className="title-main">儒道心斋</span>
            <span className="title-sub">哲学咨询</span>
          </h1>
          <p className="app-subtitle">承孔孟仁义之道，续老庄自然之学</p>
        </div>
        <div className="decoration-line"></div>
      </header>
      
      <main className="app-main">
        {/* 左侧孔子画像 */}
        <img 
          src={confuciusImg} 
          alt="孔子画像" 
          className="sage-portrait confucius"
          title="孔子 - 儒家圣贤"
        />
        
        {/* 中间聊天界面 */}
        <div className="chat-interface-wrapper">
          <ChatInterface />
        </div>
        
        {/* 右侧老子画像 */}
        <img 
          src={laoziImg} 
          alt="老子画像" 
          className="sage-portrait laozi"
          title="老子 - 道家圣贤"
        />
      </main>
      
      <footer className="app-footer">
        <p>© 2025 儒道心斋哲学咨询系统 | 儒家修身，道家养心</p>
      </footer>
    </div>
  );
}

export default App; 
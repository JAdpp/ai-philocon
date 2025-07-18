import React, { useState, useRef, useEffect } from 'react';
import cozeService from '../services/cozeApi';
import './ChatInterface.css';
// 导入图片
import confuciusImg from '../assets/confucius.png';
import laoziImg from '../assets/laozi.png';

// 新增：去除流式响应中的重叠部分
function removeOverlap(prev, next) {
  if (!prev) return next;
  // 增加最大重叠检测长度以处理较长的重复
  const maxOverlap = 50; 
  for (let len = Math.min(prev.length, next.length, maxOverlap); len > 3; len--) {
    if (prev.endsWith(next.substring(0, len))) {
      return next.substring(len);
    }
  }
  return next;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: '欢迎来到儒道心斋哲学咨询！我将为您提供儒家和道家两大传统哲学流派的智慧指导。儒家重修身齐家👨‍🏫，道家崇自然无为🍃。请问您希望从哪个角度探讨人生困惑🧭？',
      timestamp: new Date(),
      school: 'ai' // 新增
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  // 1. currentSchool 默认 'mix'
  const [currentSchool, setCurrentSchool] = useState('mix');
  const botIds = {
    mix: '7527231310520418323',
    dao: '7523528610469298195',
    ru: '7527206653071015970'
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 2. handleSendMessage 默认 school = 'dao'
  const handleSendMessage = async (school = 'dao', isSwitch = false, msgContent = null) => {
    cozeService.setBotId(botIds[school]);
    const contentToSend = msgContent !== null ? msgContent : inputValue.trim();
    if (!contentToSend || isLoading) return;

    let userMessage;
    if (!isSwitch) {
      userMessage = {
        id: Date.now(),
        type: 'user',
        content: contentToSend,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
    } else {
      userMessage = {
        id: Date.now(),
        type: 'user',
        content: contentToSend,
        timestamp: new Date()
      };
    }
    setIsLoading(true);

    try {
      const stream = await cozeService.sendMessage(userMessage.content);
      
      // 创建一个空的助手消息
      const assistantMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: '',
        timestamp: new Date(),
        school: school // 新增school
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // 🔑 关键修复：立即设置loading为false，避免显示加载指示器
      setIsLoading(false);
      
      setIsStreaming(true);
      
      // 实现流式显示
      let fullResponse = '';
      let currentMessageId = assistantMessage.id;
      
      for await (const chunk of stream) {
        console.log('=== 详细数据块分析 ===');
        console.log('chunk类型:', typeof chunk);
        console.log('chunk内容:', chunk);
        console.log('chunk.data:', chunk?.data);
        console.log('chunk.data类型:', typeof chunk?.data);
        
        let chunkStr = '';
        
        // 更全面的数据提取逻辑
        if (typeof chunk === 'string') {
          chunkStr = chunk;
          console.log('从字符串提取:', chunkStr);
        } else if (chunk && chunk.data) {
          if (typeof chunk.data === 'string') {
            chunkStr = chunk.data;
            console.log('从chunk.data字符串提取:', chunkStr);
          } else if (chunk.data.content) {
            chunkStr = chunk.data.content;
            console.log('从chunk.data.content提取:', chunkStr);
          } else if (chunk.data.message) {
            chunkStr = chunk.data.message;
            console.log('从chunk.data.message提取:', chunkStr);
          } else {
            console.log('chunk.data的所有属性:', Object.keys(chunk.data));
          }
        } else if (chunk && chunk.content) {
          chunkStr = chunk.content;
          console.log('从chunk.content提取:', chunkStr);
        } else if (chunk && chunk.message) {
          chunkStr = chunk.message;
          console.log('从chunk.message提取:', chunkStr);
        }
        
        console.log('最终提取的chunkStr:', chunkStr);
        
        // 检查是否是结束标记
        if (chunkStr === '[DONE]') {
          console.log('检测到结束标记，停止处理');
          break;
        }
        
        // 过滤控制信息，但保留有用内容
        if (chunkStr && !chunkStr.includes('{"msg_type"') && chunkStr !== '[DONE]') {
          const nonOverlappingChunk = removeOverlap(fullResponse, chunkStr);
          fullResponse += nonOverlappingChunk;
          
          console.log('添加到响应:', nonOverlappingChunk);
          console.log('当前完整响应:', fullResponse);
          
          let displayResponse = fullResponse;
          if (school === 'mix') {
            displayResponse = fullResponse.replace(/^[012]\s*/, '');
          }
          
          // 实时更新消息内容
          setMessages(prev => prev.map(msg => 
            msg.id === currentMessageId 
              ? { ...msg, content: displayResponse }
              : msg
          ));
          
          // 添加延迟以实现打字效果
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }
      
      console.log('流式处理完成，最终响应:', fullResponse);
      
      // 如果没有内容，可能需要使用processStreamResponse备用方法
      if (!fullResponse.trim()) {
        console.log('流式处理没有获得内容，尝试备用方法');
        const stream2 = await cozeService.sendMessage(userMessage.content);
        const response = await cozeService.processStreamResponse(stream2);
        fullResponse = response;
      }
      
      let finalContent = fullResponse;
      let finalSchool = school;

      if (school === 'mix' && fullResponse.trim()) {
        const match = fullResponse.match(/^([012])([\s\S]*)/s);
        if (match) {
            const schoolCode = match[1];
            finalContent = match[2].trim();

            // 升级版修复逻辑：查找重复块的起点并裁剪
            const firstSentenceEndIndex = finalContent.search(/[。！？]/);
            if (firstSentenceEndIndex !== -1) {
              const firstSentence = finalContent.substring(0, firstSentenceEndIndex + 1);
              const buggyPatternStart = schoolCode + firstSentence;
              
              const buggyIndex = finalContent.lastIndexOf(buggyPatternStart);

              // 如果在内容中间或尾部发现了重复模式的起点，则裁剪掉
              if (buggyIndex > 0) {
                finalContent = finalContent.substring(0, buggyIndex).trim();
              }
            }

            if (schoolCode === '1') {
                finalSchool = 'ru';  // 儒家
                setCurrentSchool('ru');
            } else if (schoolCode === '2') {
                finalSchool = 'dao'; // 道家
                setCurrentSchool('dao');
            } else { // '0'
                finalSchool = 'ai';
                // currentSchool remains 'mix' for next query
            }
        } else {
            finalSchool = 'ai'; // No prefix, treat as general AI
        }
      }
        
      // 清理重复内容
      const cleanResponse = finalContent.trim() ? 
        (cozeService.cleanDuplicateContent ? cozeService.cleanDuplicateContent(finalContent) : finalContent) :
        '抱歉，我暂时无法理解您的问题，请换个方式提问。';
        
      setMessages(prev => prev.map(msg => 
        msg.id === currentMessageId 
          ? { ...msg, content: cleanResponse, school: finalSchool } // 新增school
          : msg
      ));
      
      setIsStreaming(false);
      
      // 切换流派后，自动滚动到底部
      scrollToBottom();
    } catch (error) {
      console.error('流式处理出错:', error);
      setIsLoading(false); // 🔑 确保在error情况下也要设置loading为false
      setIsStreaming(false);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'assistant',
        content: '抱歉，智慧咨询服务暂时不可用。古人云："山重水复疑无路，柳暗花明又一村。"请稍后再试。',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } 
    // 🚨 移除这里原来的 finally 块中的 setIsLoading(false)，因为我们已经提前设置了
  };

  // 3. 用户输入时，始终用 currentSchool（初始为 'dao'）
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(currentSchool);
    }
  };

  const handleSendButton = () => {
    handleSendMessage(currentSchool);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // 更新快速问题，体现儒道两家特色
  const quickQuestions = [
    "儒家如何看待修身养性？",
    "道家的无为而治是什么意思？", 
    "如何在入世与出世间找到平衡？",
  ];

  const handleQuickQuestion = (question) => {
    setInputValue(question);
    inputRef.current?.focus();
  };

  // 切换流派按钮
  const handleSwitchSchool = async (newSchool) => {
    setCurrentSchool(newSchool);
    // 取最后一条用户消息内容，重新请求
    const lastUserMsg = [...messages].reverse().find(m => m.type === 'user');
    if (lastUserMsg) {
      await handleSendMessage(newSchool, true, lastUserMsg.content);
    }
  };

  const lastMessage = messages[messages.length - 1];
  let schoolToSwitch = null;
  let schoolToSwitchText = '';
  if (lastMessage && lastMessage.type === 'assistant') {
    if (lastMessage.school === 'dao') {
      schoolToSwitch = 'ru';
      schoolToSwitchText = '儒家';
    } else if (lastMessage.school === 'ru') {
      schoolToSwitch = 'dao';
      schoolToSwitchText = '道家';
    }
  }

  return (
    <div className="chat-interface">
      <div className="chat-container" style={{
        '--confucius-bg': `url(${confuciusImg})`,
        '--laozi-bg': `url(${laoziImg})`
      }}>
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-avatar">
                {message.type === 'user'
                  ? '问'
                  : message.school === 'ru'
                    ? '儒'
                    : message.school === 'dao'
                      ? '道'
                      : 'AI'}
              </div>
              <div className="message-content">
                {message.type === 'assistant' && !message.content ? (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <>
                    <div className="message-text">{message.content}</div>
                    <div className="message-time">{formatTime(message.timestamp)}</div>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {messages.length > 1 &&
            lastMessage.type === 'assistant' &&
            !isStreaming && schoolToSwitch && (
              <div style={{ textAlign: 'center', margin: '10px 0' }}>
                <button onClick={() => handleSwitchSchool(schoolToSwitch)} className="switch-school-btn">
                  看看{schoolToSwitchText}咨询师怎么说🤔
                </button>
              </div>
            )}
          
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <div className="quick-questions">
            <p className="quick-title">常见咨询：</p>
            <div className="quick-buttons">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  className="quick-button"
                  onClick={() => handleQuickQuestion(question)}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="请输入您的人生困惑或哲学问题..."
              className="message-input"
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={handleSendButton}
              disabled={!inputValue.trim() || isLoading}
              className="send-button"
            >
              {isLoading ? '思考中...' : '咨询'}
            </button>
          </div>
          <div className="input-hint">
            按 Enter 发送，Shift + Enter 换行
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface; 
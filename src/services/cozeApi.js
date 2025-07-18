import { CozeAPI } from '@coze/api';

class CozeService {
  constructor() {
    this.apiClient = new CozeAPI({
      token: 'Your Access Token',
      baseURL: 'https://api.coze.cn'
    });
    
    // 默认道家
    this.botId = '7523528610469298195';
    this.userId = this.generateUserId();
  }

  generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  setBotId(botId) {
    this.botId = botId;
  }

  async sendMessage(message) {
    try {
      console.log('发送消息:', message);
      
      const response = await this.apiClient.chat.stream({
        bot_id: this.botId,
        user_id: this.userId,
        additional_messages: [{
          content: message,
          content_type: "text",
          role: "user",
          type: "question"
        }]
      });

      return response;
    } catch (error) {
      console.error('Coze API 调用失败:', error);
      throw new Error('智慧咨询服务暂时不可用，请稍后再试');
    }
  }

  async processStreamResponse(stream) {
    let fullResponse = '';
    let isFinished = false;
    
    try {
      console.log('开始处理流式响应...');
      
      for await (const chunk of stream) {
        console.log('收到数据块:', chunk);
        
        // 检查是否是字符串格式的数据
        let chunkStr = '';
        if (typeof chunk === 'string') {
          chunkStr = chunk;
        } else if (chunk && chunk.data) {
          if (typeof chunk.data === 'string') {
            chunkStr = chunk.data;
          } else if (chunk.data.content) {
            chunkStr = chunk.data.content;
          }
        }
        
        // 如果有数据，尝试解析
        if (chunkStr) {
          // 过滤掉控制信息（JSON格式的元数据）
          if (chunkStr.includes('{"msg_type"')) {
            console.log('检测到控制信息，跳过:', chunkStr);
            
            // 检查是否是结束信号
            if (chunkStr.includes('"msg_type":"generate_answer_finish"')) {
              isFinished = true;
              break;
            }
            continue;
          }
          
          // 新增去重拼接
          if (chunkStr && !chunkStr.includes('{"msg_type"') && chunkStr !== '[DONE]') {
            chunkStr = removeOverlap(fullResponse, chunkStr);
            fullResponse += chunkStr;
          }
        }
      }
      
      console.log('完整响应:', fullResponse);
      console.log('是否完成:', isFinished);
      
      // 清理可能的重复内容
      const cleanResponse = this.cleanDuplicateContent(fullResponse);
      
      return cleanResponse || '抱歉，我暂时无法理解您的问题，请换个方式提问。';
    } catch (error) {
      console.error('处理流式响应失败:', error);
      throw new Error('响应处理失败');
    }
  }
  
  // 清理重复内容的辅助方法
  cleanDuplicateContent(text) {
    if (!text) return text;
    // 先按句号、问号、感叹号分割
    const sentences = text.split(/(?<=[。！？])/).filter(s => s.trim());
    const uniqueSentences = [];
    sentences.forEach(s => {
      if (!uniqueSentences.includes(s)) {
        uniqueSentences.push(s);
      }
    });
    return uniqueSentences.join('');
  }

  async sendMessageNonStream(message) {
    try {
      console.log('使用非流式方法发送消息:', message);
      
      const response = await this.apiClient.chat.create({
        bot_id: this.botId,
        user_id: this.userId,
        additional_messages: [{
          content: message,
          content_type: "text",
          role: "user",
          type: "question"
        }]
      });

      console.log('非流式响应:', response);
      
      // 提取响应内容
      if (response && response.data) {
        if (response.data.content) {
          return response.data.content;
        } else if (response.data.message) {
          return response.data.message;
        } else if (response.data.messages && response.data.messages.length > 0) {
          const lastMessage = response.data.messages[response.data.messages.length - 1];
          return lastMessage.content || lastMessage.message;
        }
      }
      
      return '抱歉，我暂时无法理解您的问题，请换个方式提问。';
    } catch (error) {
      console.error('非流式API调用失败:', error);
      throw error;
    }
  }
}

// 新增：去除末尾和新chunk的重叠
function removeOverlap(prev, next) {
  const maxOverlap = 20;
  for (let len = maxOverlap; len > 0; len--) {
    if (
      prev.slice(-len) === next.slice(0, len) &&
      len > 3
    ) {
      return next.slice(len);
    }
  }
  return next;
}

export default new CozeService(); 
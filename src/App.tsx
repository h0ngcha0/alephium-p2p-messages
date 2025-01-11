import React, { useState } from 'react';
import styled from 'styled-components';
import Peer from './components/Peer';
import Message from './components/Message';

const AppContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100vh;
  padding: 0 100px;
  background-color: #f0f0f0;
`;

interface MessageType {
  id: number;
  from: 'sender' | 'receiver';
  progress: number;
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [messageCount, setMessageCount] = useState<number>(0);

  const sendMessage = (from: 'sender' | 'receiver'): void => {
    const newMessage: MessageType = {
      id: messageCount,
      from,
      progress: 0
    };
    setMessages([...messages, newMessage]);
    setMessageCount(messageCount + 1);

    // Remove message after animation completes
    setTimeout(() => {
      setMessages(messages => messages.filter(m => m.id !== newMessage.id));
    }, 2000);
  };

  return (
    <AppContainer>
      <Peer type="sender" onSend={() => sendMessage('sender')} />
      {messages.map(message => (
        <Message key={message.id} from={message.from} />
      ))}
      <Peer type="receiver" onSend={() => sendMessage('receiver')} />
    </AppContainer>
  );
};

export default App;
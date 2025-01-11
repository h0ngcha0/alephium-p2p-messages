import React from 'react';
import styled, { keyframes } from 'styled-components';

const moveRight = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(calc(100vw - 300px));
  }
`;

const moveLeft = keyframes`
  from {
    transform: translateX(calc(100vw - 300px));
  }
  to {
    transform: translateX(0);
  }
`;

interface MessageDotProps {
  from: 'sender' | 'receiver';
}

const MessageDot = styled.div<MessageDotProps>`
  width: 20px;
  height: 20px;
  background-color: ${props => props.from === 'sender' ? '#4CAF50' : '#2196F3'};
  border-radius: 50%;
  position: absolute;
  left: ${props => props.from === 'sender' ? '150px' : 'auto'};
  right: ${props => props.from === 'receiver' ? '150px' : 'auto'};
  animation: ${props => props.from === 'sender' ? moveRight : moveLeft} 2s linear;
`;

interface MessageProps {
  from: 'sender' | 'receiver';
}

const Message: React.FC<MessageProps> = ({ from }) => {
  return <MessageDot from={from} />;
};

export default Message;
import React, { useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const moveRight = keyframes`
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const moveLeft = keyframes`
  from {
    transform: translateX(20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

interface StyledProps {
  from: 'sender' | 'receiver';
  ip: string;
  getColorForIp: (ip: string) => string;
}

const ConnectionLine = styled.div<{ isResponse: boolean }>`
  position: absolute;
  left: ${props => props.isResponse ? '-20px' : 'auto'};
  right: ${props => !props.isResponse ? '-20px' : 'auto'};
  top: 50%;
  width: 20px;
  height: 2px;
  background: #00E676;
  opacity: 0.6;
`;

const MessageContainer = styled.div<StyledProps>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.from === 'sender' ? 'flex-start' : 'flex-end'};
  margin: 4px 0;
  width: 100%;
  position: relative;
`;

const ArrowLine = styled.svg<{ isResponse: boolean }>`
  position: absolute;
  ${props => props.isResponse ? 'left: -40px' : 'right: -40px'};
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 20px;
  pointer-events: none;
`;

const MessageBubble = styled.div<StyledProps>`
  background-color: ${props => props.from === 'sender' ? '#242424' : '#2D2D2D'};
  color: #B4B4B4;
  padding: 10px;
  border-radius: 4px;
  max-width: 80%;
  font-family: 'Roboto Mono', monospace;
  animation: ${props => props.from === 'sender' ? moveRight : moveLeft} 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 1px solid ${props => props.getColorForIp(props.ip)};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  will-change: transform, opacity;
`;

const MessageType = styled.div<StyledProps>`
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin: 4px 0;
  padding: 4px 0;
  border-top: 1px solid #404040;
  border-bottom: 1px solid #404040;
  color: ${props => props.getColorForIp(props.ip)};
  letter-spacing: 0.5px;
`;

const MessageHeader = styled.div<StyledProps>`
  font-size: 10px;
  color: ${props => props.getColorForIp(props.ip)};
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.7;
`;

const IpContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const Arrow = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 0 2px;
  transform: translateY(-1px);
`;

const MessageContent = styled.div<StyledProps>`
  font-size: 12px;
  margin: 4px 0;
  color: ${props => props.getColorForIp(props.ip)};
  word-break: break-word;
  background-color: rgba(0, 0, 0, 0.15);
  padding: 6px 8px;
  border-radius: 4px;
  font-family: 'Roboto Mono', monospace;
  letter-spacing: 0.5px;
`;

const MessageDetails = styled.div`
  font-size: 10px;
  color: #808080;
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
`;

const RequestIdTag = styled.span`
  color: #00E676;
  opacity: 0.8;
  margin-left: 8px;
`;

interface MessageProps {
  id: number;
  from: string;
  targetIp: string;
  timestamp: string;
  messageType: string;
  content: string;
  protocol: string;
  requestId?: number;
  isResponse?: boolean;
  connectTo?: number;
  payloadSize?: number;
  onElementLoad?: (id: number, element: HTMLElement) => void;
  getColorForIp: (ip: string) => string;
}

const Message: React.FC<MessageProps> = ({
  id,
  from,
  targetIp,
  timestamp,
  messageType,
  content,
  protocol,
  requestId,
  isResponse,
  connectTo,
  payloadSize,
  onElementLoad,
  getColorForIp
}) => {
  const messageRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bubbleRef.current && onElementLoad) {
      onElementLoad(id, bubbleRef.current);
    }
  }, [id, onElementLoad]);

  const getMessageType = (fromIp: string, targetIp: string): 'sender' | 'receiver' => {
    // If message is from sender (outgoing)
    if (fromIp === '0.0.0.0') {
      return 'sender';
    }
    // If message is to sender (incoming)
    if (targetIp === '0.0.0.0') {
      return 'receiver';
    }
    // Fallback
    return 'receiver';
  };

  return (
    <MessageContainer ref={messageRef} from={getMessageType(from, targetIp)} ip={from} getColorForIp={getColorForIp}>
      <MessageBubble ref={bubbleRef} from={getMessageType(from, targetIp)} ip={from} getColorForIp={getColorForIp}>
        <MessageHeader from={getMessageType(from, targetIp)} ip={from} getColorForIp={getColorForIp}>
          <span>{protocol}</span>
          <IpContainer>
            {getMessageType(from, targetIp) === 'sender' ? (
              <>
                <span>{from}</span>
                <Arrow>→</Arrow>
                <span>{targetIp}</span>
              </>
            ) : (
              <span>{from}</span>
            )}
          </IpContainer>
        </MessageHeader>
        <MessageType from={getMessageType(from, targetIp)} ip={from} getColorForIp={getColorForIp}>
          {messageType.replace('Request', ' Request').replace('Response', ' Response')}
        </MessageType>
        <MessageContent from={getMessageType(from, targetIp)} ip={from} getColorForIp={getColorForIp}>
          {content}
        </MessageContent>
        <MessageDetails>
          <span>
            {`${new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })}.${new Date(timestamp).getMilliseconds().toString().padStart(3, '0')}`}
          </span>
        </MessageDetails>
      </MessageBubble>
    </MessageContainer>
  );
};

export default Message;
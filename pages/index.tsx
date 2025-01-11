import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import Peer from '../src/components/Peer';
import Message from '../src/components/Message';
import { websocketClient, P2PMessage } from '../src/services/websocketClient';
import { AlephiumLogo } from '../src/images/Alephium';
import { useColorService, SENDER_IP } from '../src/hooks/useColorService';

const AppContainer = styled.div`
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: auto 1fr;
  gap: 20px;
  height: 100vh;
  padding: 16px;
  background-color: #121212;
  box-sizing: border-box;
`;

const AppTitle = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  color: #00E676;
  font-family: 'Roboto Mono', monospace;
  margin-bottom: 8px;
`;

const SenderContainer = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 0 8px;
`;

const ChatContainer = styled.div`
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1B1B1B;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid #333333;

  /* Add background logo */
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 500px;
    background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(`
      <svg width="100%" height="100%" viewBox="0 0 1000 1000" version="1.1" xmlns="http://www.w3.org/2000/svg">
        <g transform="matrix(1,0,0,1,-3372,0)">
          <g transform="matrix(0.714286,0,0,0.4876,2336.29,0)">
            <g transform="matrix(2.15145,0,0,3.06273,1741.93,-13470.9)">
              <g transform="matrix(0.46324,0,0,0.476693,59.5258,4506.4)">
                <path d="M187.296,627.61C187.296,615.272 177.581,606.969 165.616,609.078L21.68,634.454C9.715,636.564 -0,648.293 -0,660.63L-0,932.485C-0,944.822 9.715,953.126 21.68,951.016L165.616,925.64C177.581,923.531 187.296,911.802 187.296,899.464L187.296,627.61Z" fill="rgba(255,255,255,0.06)"/>
              </g>
              <g transform="matrix(0.46324,0,0,0.476693,59.5258,4506.4)">
                <path d="M561.888,18.859C561.888,6.522 552.173,-1.782 540.207,0.327L396.272,25.704C384.306,27.813 374.592,39.542 374.592,51.88L374.592,323.734C374.592,336.072 384.306,344.375 396.272,342.266L540.207,316.89C552.173,314.78 561.888,303.051 561.888,290.714L561.888,18.859Z" fill="rgba(255,255,255,0.06)"/>
              </g>
              <g transform="matrix(0.46324,0,0,0.476693,59.5258,4506.4)">
                <path d="M210.743,82.363C205.186,70.124 190.266,62.023 177.446,64.283L23.229,91.472C10.408,93.732 4.512,105.503 10.069,117.742L351.145,868.949C356.702,881.188 371.622,889.29 384.442,887.029L538.659,859.841C551.479,857.581 557.376,845.809 551.819,833.57L210.743,82.363Z" fill="rgba(255,255,255,0.06)"/>
              </g>
            </g>
          </g>
        </g>
      </svg>
    `)}');
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    pointer-events: none;
    z-index: 0;
    opacity: 0.15;  // Increased from 0.1 to 0.15
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  position: relative;
  scrollbar-width: thin;
  scrollbar-color: #2D2D2D #1B1B1B;

  /* Add this to ensure proper positioning context */
  transform: translateZ(0);

  &::-webkit-scrollbar {
    width: 10px;
    background: #1B1B1B;
  }

  &::-webkit-scrollbar-track {
    background: #1B1B1B;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #2D2D2D;
    border: 2px solid #1B1B1B;
    border-radius: 10px;

    &:hover {
      background: #363636;
    }
  }

  /* Ensure messages are above the background */
  & > * {
    position: relative;
    z-index: 1;
  }
`;

const ReceiversContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 8px;
  overflow-y: auto;
  max-height: 100%;
  scrollbar-width: thin;
  scrollbar-color: #2D2D2D #121212;

  &::-webkit-scrollbar {
    width: 10px;
    background: #121212;
  }

  &::-webkit-scrollbar-track {
    background: #121212;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #2D2D2D;
    border: 2px solid #121212;
    border-radius: 10px;

    &:hover {
      background: #363636;
    }
  }
`;

const ConnectionsContainer = styled.svg`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
  z-index: 1;
`;

const MainTitle = styled.h1`
  font-size: 24px;
  font-weight: 500;
  margin: 0;
  padding: 0;
  letter-spacing: 1px;
`;

const Subtitle = styled.div`
  font-size: 14px;
  color: #808080;
  margin-top: 5px;
  letter-spacing: 0.5px;
`;

const PauseButtonContainer = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  padding: 4px;
  background: rgba(27, 27, 27, 0.8);
  border-radius: 4px;
  backdrop-filter: blur(4px);
`;

const PauseButton = styled.button<{ $paused: boolean }>`
  background: ${props => props.$paused ? 'rgba(230, 115, 0, 0.1)' : 'rgba(0, 230, 118, 0.1)'};
  border: 1px solid ${props => props.$paused ? '#E67300' : '#00E676'};
  border-radius: 4px;
  padding: 6px 10px;
  color: ${props => props.$paused ? '#E67300' : '#00E676'};
  font-family: 'Roboto Mono', monospace;
  font-size: 11px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: ${props => props.$paused ? 'rgba(230, 115, 0, 0.2)' : 'rgba(0, 230, 118, 0.2)'};
    transform: translateY(-1px);
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const Home: React.FC = () => {
  const [messages, setMessages] = useState<P2PMessage[]>([]);
  const [messageElements, setMessageElements] = useState<Map<number, HTMLElement>>(new Map());
  const [receiverIps, setReceiverIps] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollVersion, setScrollVersion] = useState(0);
  const { getColorForIp } = useColorService(receiverIps);
  const [isPaused, setIsPaused] = useState(false);
  const messageQueue = useRef<P2PMessage[]>([]);
  const isProcessing = useRef(false);
  const DISPLAY_INTERVAL = 200;

  // Add a ref to track if user is manually scrolling
  const isUserScrolling = useRef(false);
  const isScrolledToBottom = useRef(true);
  const ticking = useRef(false);

  // Track unique receiver IPs
  useEffect(() => {
    const newIps = new Set<string>();
    messages.forEach(message => {
      // Add targetIp if it's not the sender IP
      if (message.targetIp !== SENDER_IP) {
        newIps.add(message.targetIp);
      }
      // Add from IP if it's not the sender IP
      if (message.from !== SENDER_IP) {
        newIps.add(message.from);
      }
    });
    setReceiverIps(newIps);
  }, [messages]);

  // Update scroll to bottom when new messages arrive
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Always scroll to bottom for new messages
    const scrollToBottom = () => {
      const targetScroll = container.scrollHeight;

      container.scrollTo({
        top: targetScroll,
        behavior: 'smooth'
      });

      // Update scroll position tracker for future reference
      isScrolledToBottom.current = true;
    };

    // Schedule the scroll after the DOM has updated
    requestAnimationFrame(() => {
      scrollToBottom();
    });
  }, [messages]);

  // Remove the scroll handling for manual scrolling since we want to always focus on latest messages
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setScrollVersion(v => v + 1);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMessageElementLoad = useCallback((id: number, element: HTMLElement) => {
    setMessageElements(prev => {
      const newMap = new Map(prev);
      newMap.set(id, element);
      return newMap;
    });
    requestAnimationFrame(() => setScrollVersion(v => v + 1));
  }, []);

  const renderConnections = useCallback(() => {
    const connections: JSX.Element[] = [];
    const containerRect = containerRef.current?.getBoundingClientRect();

    if (!containerRect) {
      console.log('No container rect');
      return connections;
    }

    // Group messages by requestId
    const messagesByRequestId = new Map<number, P2PMessage[]>();
    messages.forEach(message => {
      if (message.requestId) {
        const msgs = messagesByRequestId.get(message.requestId) || [];
        msgs.push(message);
        messagesByRequestId.set(message.requestId, msgs);
      }
    });

    console.log('Messages by requestId:', messagesByRequestId);

    messagesByRequestId.forEach((relatedMessages, requestId) => {
      if (relatedMessages.length === 2) {
        const sortedMessages = [...relatedMessages].sort((a, b) =>
          a.from === SENDER_IP ? -1 : b.from === SENDER_IP ? 1 : 0
        );
        const [senderMsg, receiverMsg] = sortedMessages;

        const senderElem = messageElements.get(senderMsg.id);
        const receiverElem = messageElements.get(receiverMsg.id);

        console.log('Found pair:', {
          requestId,
          senderMsg,
          receiverMsg,
          senderElem: !!senderElem,
          receiverElem: !!receiverElem
        });

        if (senderElem && receiverElem && senderElem.isConnected && receiverElem.isConnected) {
          const senderRect = senderElem.getBoundingClientRect();
          const receiverRect = receiverElem.getBoundingClientRect();

          if (senderRect.height > 0 && receiverRect.height > 0) {
            const scrollTop = containerRef.current?.scrollTop ?? 0;

            // Determine if this is a response to sender
            const isResponseToSender = receiverMsg.isResponse && receiverMsg.targetIp === SENDER_IP;

            // Swap start and end points for responses to sender
            const startX = isResponseToSender ? receiverRect.left - containerRect.left : senderRect.right - containerRect.left;
            const endX = isResponseToSender ? senderRect.right - containerRect.left : receiverRect.left - containerRect.left;
            const startY = isResponseToSender ? receiverRect.top + scrollTop - containerRect.top + (receiverRect.height / 2)
                                            : senderRect.top + scrollTop - containerRect.top + (senderRect.height / 2);
            const endY = isResponseToSender ? senderRect.top + scrollTop - containerRect.top + (senderRect.height / 2)
                                          : receiverRect.top + scrollTop - containerRect.top + (receiverRect.height / 2);

            // Calculate control points for curve
            const midX = (startX + endX) / 2;
            const curveOffset = 30;

            const path = `
              M ${startX} ${startY}
              C ${midX + curveOffset} ${startY},
                ${midX - curveOffset} ${endY},
                ${endX} ${endY}
            `;

            const lineColor = getColorForIp(receiverMsg.from);

            connections.push(
              <g key={`connection-${requestId}`}>
                <defs>
                  <marker
                    id={`arrowhead-${requestId}`}
                    markerWidth="14"
                    markerHeight="10"
                    refX="12"
                    refY="5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 14 5, 0 10"
                      fill={lineColor}
                      opacity="0.8"
                    />
                  </marker>
                </defs>
                <path
                  d={path}
                  stroke={lineColor}
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.4"
                  markerEnd={`url(#arrowhead-${requestId})`}
                  strokeDasharray="4,3"
                />
              </g>
            );
          }
        }
      }
    });

    return connections;
  }, [messages, messageElements, scrollVersion]);

  // Process messages one at a time with delay
  const processMessageQueue = useCallback(() => {
    if (messageQueue.current.length === 0 || isPaused) {
      isProcessing.current = false;
      return;
    }

    isProcessing.current = true;
    const message = messageQueue.current.shift()!;

    // Use requestAnimationFrame to ensure smooth updates
    requestAnimationFrame(() => {
      setMessages(prev => [...prev, message]);

      // Schedule next message after the current one is processed
      setTimeout(() => {
        requestAnimationFrame(() => {
          processMessageQueue();
        });
      }, DISPLAY_INTERVAL);
    });
  }, [isPaused]);

  // Move useEffect for websocket connection to top level
  useEffect(() => {
    const messageHandler = (message: P2PMessage) => {
      if (!isPaused) {  // Only queue messages if not paused
        messageQueue.current.push(message);

        if (!isProcessing.current) {
          processMessageQueue();
        }
      }
    };

    websocketClient.connect();
    websocketClient.on('message', messageHandler);

    return () => {
      websocketClient.removeListener('message', messageHandler);
      websocketClient.disconnect();
    };
  }, [isPaused, processMessageQueue]); // Add isPaused to dependencies

  const handlePauseToggle = () => {
    const newPausedState = !isPaused;

    if (newPausedState) {
      websocketClient.pause();
      // Clear the queue and stop processing
      messageQueue.current = [];
      isProcessing.current = false;
    } else {
      websocketClient.resume();
    }

    setIsPaused(newPausedState);
  };

  return (
    <AppContainer>
      <AppTitle>
        <MainTitle>P2P Messages</MainTitle>
        <Subtitle>in Alephium Network</Subtitle>
      </AppTitle>
      <SenderContainer>
        <Peer
          type="sender"
          ip={SENDER_IP}
          getColorForIp={getColorForIp}
        />
      </SenderContainer>
      <ChatContainer>
        <PauseButtonContainer>
          <PauseButton
            onClick={handlePauseToggle}
            $paused={isPaused}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                Resume
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                </svg>
                Pause
              </>
            )}
          </PauseButton>
        </PauseButtonContainer>
        <MessagesContainer
          id="messages-container"
          ref={containerRef}
        >
          <ConnectionsContainer>
            {renderConnections()}
          </ConnectionsContainer>
          {messages.map(message => (
            <Message
              key={message.id}
              {...message}
              onElementLoad={handleMessageElementLoad}
              getColorForIp={getColorForIp}
            />
          ))}
        </MessagesContainer>
      </ChatContainer>
      <ReceiversContainer>
        {Array.from(receiverIps).map(ip => (
          <Peer
            key={ip}
            type="receiver"
            ip={ip}
            getColorForIp={getColorForIp}
          />
        ))}
      </ReceiversContainer>
    </AppContainer>
  );
};

export default Home;
import React from 'react';
import styled from 'styled-components';

const PeerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const PeerCircle = styled.div<PeerProps>`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: ${props => props.type === 'sender' ? '#4CAF50' : '#2196F3'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const SendButton = styled.button`
  padding: 8px 16px;
  background-color: #333;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:hover {
    background-color: #444;
  }
`;

interface PeerProps {
  type: 'sender' | 'receiver';
  onSend: () => void;
}

const Peer: React.FC<PeerProps> = ({ type, onSend }) => {
  return (
    <PeerContainer>
      <PeerCircle type={type} onSend={onSend}>
        {type === 'sender' ? 'Sender' : 'Receiver'}
      </PeerCircle>
      <SendButton onClick={onSend}>
        Send Message
      </SendButton>
    </PeerContainer>
  );
};

export default Peer;
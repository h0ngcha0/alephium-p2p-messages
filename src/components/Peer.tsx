import React from 'react';
import styled, { keyframes } from 'styled-components';
import { AlephiumLogo as AlephiumSvg } from '../images/Alephium';

// Create a function that returns the pulse animation with the correct color
const createPulseAnimation = (color: string) => keyframes`
  0% {
    box-shadow: 0 0 0 0 ${color}66;
  }
  70% {
    box-shadow: 0 0 0 10px ${color}00;
  }
  100% {
    box-shadow: 0 0 0 0 ${color}00;
  }
`;

interface StyledProps {
  $type: 'sender' | 'receiver';
  $ip: string;
  $isSelected?: boolean;
  $getColorForIp: (ip: string) => string;
}

const PeerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 12px;
  min-width: 180px;

  @media (max-width: 768px) {
    min-width: 80px;
    padding: 4px;
  }
`;

const PeerTitle = styled.div`
  font-size: 12px;
  color: #808080;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 10px;
    margin-bottom: 6px;
  }
`;

const PeerIp = styled.div<{ color: string }>`
  font-family: 'Roboto Mono', monospace;
  font-size: 14px;
  color: ${props => props.color};
  word-break: break-all;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const NodeCircle = styled.div<StyledProps>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #1B1B1B;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  animation: ${props => createPulseAnimation(props.$getColorForIp(props.$ip))} 2s infinite;
  border: 2px solid ${props => props.$isSelected ? props.$getColorForIp(props.$ip) : '#404040'};
  cursor: ${props => props.$type === 'receiver' ? 'pointer' : 'default'};
  transition: transform 0.2s ease;
  margin: 0 auto;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    border-width: 1.5px;
  }

  &:hover {
    transform: ${props => props.$type === 'receiver' ? 'scale(1.05)' : 'none'};
  }

  &::after {
    content: '';
    position: absolute;
    width: 15px;
    height: 15px;
    background-color: ${props => props.$getColorForIp(props.$ip)};
    border-radius: 50%;
    top: 10px;
    right: 10px;

    @media (max-width: 768px) {
      width: 6px;
      height: 6px;
      top: 4px;
      right: 4px;
    }
  }
`;

const LogoWrapper = styled.div<StyledProps>`
  width: 60%;
  height: 60%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$getColorForIp(props.$ip)};
  opacity: 0.9;

  @media (max-width: 768px) {
    width: 70%;
    height: 70%;
  }
`;

const IpAddress = styled.div<StyledProps>`
  color: ${props => props.$getColorForIp(props.$ip)};
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  margin-top: 12px;
  opacity: 0.8;
  letter-spacing: 0.5px;
  text-align: center;

  @media (max-width: 768px) {
    display: none;
  }
`;

interface PeerProps {
  type: 'sender' | 'receiver';
  ip: string;
  isSelected?: boolean;
  onSelect?: () => void;
  getColorForIp: (ip: string) => string;
}

const Peer: React.FC<PeerProps> = ({ type, ip, isSelected, onSelect, getColorForIp }) => {
  const handleClick = type === 'receiver' ? onSelect : undefined;

  return (
    <PeerContainer onClick={handleClick}>
      <NodeCircle
        $type={type}
        $ip={ip}
        $isSelected={isSelected}
        $getColorForIp={getColorForIp}
      >
        <LogoWrapper
          $type={type}
          $ip={ip}
          $getColorForIp={getColorForIp}
        >
          <AlephiumSvg />
        </LogoWrapper>
      </NodeCircle>
      <IpAddress
        $type={type}
        $ip={ip}
        $getColorForIp={getColorForIp}
      >
        {ip}
      </IpAddress>
    </PeerContainer>
  );
};

export default Peer;
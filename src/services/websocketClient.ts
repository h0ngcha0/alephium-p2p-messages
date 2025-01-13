import { EventEmitter } from 'events';


export interface Ping {
  type: 'Ping';
  requestId: number;
}

export interface Pong {
  type: 'Pong';
  requestId: number;
}

export interface BlocksRequest {
  type: 'BlocksRequest';
  requestId: number;
  locators: string[];
}

export interface BlocksResponse {
  type: 'BlocksResponse';
  requestId: number;
  blocks?: string[];
  blocksBytes?: string[];
}

export interface HeaderRequest {
  type: 'HeaderRequest';
  requestId: number;
  locators: string[];
}

export interface HeaderResponse {
  type: 'HeaderResponse';
  requestId: number;
  headers: string[];
}

export interface InvRequest {
  type: 'InvRequest';
  requestId: number;
  locators: string[][];
}

export interface InvResponse {
  type: 'InvResponse';
  requestId: number;
  hashes: string[][];
}

export interface NewBlock {
  type: 'NewBlock';
  blockHash?: string;
  blockBytes?: string;
}

export interface NewHeader {
  type: 'NewHeader';
  blockHash: string;
}

export interface NewInv {
  type: 'NewInv';
  hashes: string[][];
}

export interface NewBlockHash {
  type: 'NewBlockHash';
  blockHash: string;
}

export interface NewTxHashes {
  type: 'NewTxHashes';
  hashes: [number, number, string[]][];
}

export interface TxsRequest {
  type: 'TxsRequest';
  requestId: number;
  hashes: [number, number, string[]][];
}

export interface TxsResponse {
  type: 'TxsResponse';
  requestId: number;
  responses: string[];
}

export type P2PPayload =
  | Ping
  | Pong
  | BlocksRequest
  | BlocksResponse
  | HeaderRequest
  | HeaderResponse
  | InvRequest
  | InvResponse
  | NewBlock
  | NewHeader
  | NewInv
  | NewBlockHash
  | NewTxHashes
  | TxsRequest
  | TxsResponse;

export interface P2PMessage {
  id: number;
  from: string;
  targetIp: string;
  timestamp: string;
  messageType: string;
  content: string;
  protocol: string;
  requestId?: number;
  ip: string;
  isResponse?: boolean;
  connectTo?: number;
  payloadSize?: number;
}

interface WebSocketMessage {
  method: string;
  params: {
    from: string;
    to: string;
    timestamp: number;
    payload: P2PPayload;
  };
  jsonrpc: string;
}

class WebSocketClient extends EventEmitter {
  private static instance: WebSocketClient;
  private ws: WebSocket | null = null;
  private messageCounter = 0;
  private isConnected = false;
  private isPaused = false;

  private constructor() {
    super();
  }

  static getInstance(): WebSocketClient {
    if (!WebSocketClient.instance) {
      WebSocketClient.instance = new WebSocketClient();
    }
    return WebSocketClient.instance;
  }

  connect() {
    if (this.isConnected || this.isPaused) return;

    this.ws = new WebSocket('wss://alephium-d13e6g.alephium.org/events');

    this.ws.onopen = () => {
      this.isConnected = true;
      console.log('Connected to P2P WebSocket');
    };

    this.ws.onclose = () => {
      this.isConnected = false;
      console.log('Disconnected from P2P WebSocket');
      // Try to reconnect after 5 seconds
      setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.ws.onmessage = (event) => {
      try {
        // Don't process messages if paused
        if (this.isPaused) return;

        const wsMessage: WebSocketMessage = JSON.parse(event.data);

        if (wsMessage.method === 'p2p_notify') {
          const { from, to, timestamp, payload } = wsMessage.params;

          const message: P2PMessage = {
            id: this.messageCounter++,
            from: from,
            targetIp: to,
            ip: from,
            timestamp: new Date(timestamp).toISOString(),
            messageType: payload.type,
            content: this.formatPayloadContent(payload),
            protocol: 'P2P/1.0',
            requestId: ('requestId' in payload) ? payload.requestId : undefined,
            payloadSize: JSON.stringify(payload).length,
            isResponse: payload.type.includes('Response') || payload.type === 'Pong'
          };

          console.log('Created message:', message);
          this.emit('message', message);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  disconnect() {
    if (this.ws) {
      this.isConnected = false;
      this.ws.close();
      this.ws = null;
    }
  }

  private formatPayloadContent(payload: P2PPayload): string {
    // Create a clean object based on payload type
    const cleanPayload: Record<string, unknown> = {};

    // Copy all fields except type, requestId, and *Bytes fields
    Object.entries(payload).forEach(([key, value]) => {
      if (key !== 'type' &&
          key !== 'requestId' &&
          !key.toLowerCase().includes('bytes')) {
        cleanPayload[key] = value;
      }
    });

    // For empty objects (like Ping/Pong), return empty string
    if (Object.keys(cleanPayload).length === 0) {
      return '';
    }

    // Format the JSON with 2 spaces indentation
    return JSON.stringify(cleanPayload, null, 2)
      // Optional: Shorten long hashes
      .replace(/(0x[a-f0-9]{8})[a-f0-9]+/gi, '$1...');
  }

  pause() {
    this.isPaused = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  resume() {
    this.isPaused = false;
    if (!this.isConnected) {
      this.connect();
    }
  }
}

export const websocketClient = WebSocketClient.getInstance();
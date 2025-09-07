import { useEffect, useRef } from 'react';

export interface TranscriptMessage {
  id: string;
  role: 'user' | 'replica';
  speech: string;
  timestamp: Date;
}

interface TranscriptProps {
  messages: TranscriptMessage[];
}

export default function Transcript({ messages }: TranscriptProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <div className="border-b border-gray-200 pb-2 mb-4">
          <h3 className="text-lg font-medium text-gray-900">Live Transcript</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <p>Conversation transcript will appear here...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 pb-2 mb-4">
        <h3 className="text-lg font-medium text-gray-900">Live Transcript</h3>
        <p className="text-sm text-gray-600">{messages.length} messages</p>
      </div>
      
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2"
        style={{ maxHeight: 'calc(100% - 60px)' }}
      >
        {messages.map((message) => (
          <div 
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium opacity-75">
                  {message.role === 'user' ? '👤 You' : '🤖 Avatar'}
                </span>
                <span className="text-xs opacity-60">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{message.speech}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

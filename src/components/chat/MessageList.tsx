import { useEffect, useRef } from "react";
import { Message } from "@/lib/supabase";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export default function MessageList({
  messages,
  currentUserId,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesRef = useRef(0);

  useEffect(() => {
    if (prevMessagesRef.current < messages.length) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      prevMessagesRef.current = messages.length;
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
    prevMessagesRef.current = messages.length;
  }, []);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md mx-auto">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `rgb(var(--bg-tertiary))` }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: `rgb(var(--text-muted))` }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-3.5-.71L6 21l1.71-3.5A8.955 8.955 0 013 12a8 8 0 018-8 8 8 0 018 8z"
              />
            </svg>
          </div>
          <h3
            className="text-lg font-medium mb-2"
            style={{ color: `rgb(var(--text-primary))` }}
          >
            대화를 시작해보세요
          </h3>
          <p
            className="text-sm"
            style={{ color: `rgb(var(--text-secondary))` }}
          >
            첫 번째 메시지를 보내서 채팅을 시작해보세요!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-6 py-4">
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => {
            const isCurrentUser = message.user_name === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${
                  isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex max-w-xs lg:max-w-md items-end ${
                    isCurrentUser
                      ? "flex-row-reverse space-x-reverse space-x-3"
                      : "flex-row space-x-3"
                  }`}
                >
                  {/* 아바타 */}
                  <div className="flex-shrink-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                      style={{
                        backgroundColor: isCurrentUser
                          ? "rgb(59, 130, 246)"
                          : `rgb(var(--bg-tertiary))`,
                        color: isCurrentUser
                          ? "white"
                          : `rgb(var(--text-secondary))`,
                      }}
                    >
                      {isCurrentUser
                        ? "나"
                        : message.user_name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  {/* 메시지 내용 */}
                  <div className="flex-1 min-w-0">
                    <div
                      className={`flex items-center space-x-2 mb-1 ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span
                        className="text-sm font-medium"
                        style={{ color: `rgb(var(--text-secondary))` }}
                      >
                        {isCurrentUser ? "나" : message.user_name}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: `rgb(var(--text-muted))` }}
                      >
                        {new Date(message.created_at).toLocaleTimeString(
                          "ko-KR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl whitespace-pre-wrap break-words ${
                        isCurrentUser ? "rounded-br-sm" : "rounded-bl-sm"
                      }`}
                      style={{
                        backgroundColor: isCurrentUser
                          ? `rgb(var(--message-own-bg))`
                          : `rgb(var(--message-bg))`,
                        color: isCurrentUser
                          ? `rgb(var(--message-own-text))`
                          : `rgb(var(--text-primary))`,
                      }}
                    >
                      {message.content}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

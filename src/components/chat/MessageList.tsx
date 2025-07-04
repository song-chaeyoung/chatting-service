import { useEffect, useRef } from "react";
import { Message } from "@/lib/supabase";
import { parseTextWithLinks } from "@/lib/link-utils";
import LinkPreview from "@/components/LinkPreview";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

// 이모지만 있는지 확인하는 함수
const isEmojiOnly = (text: string): boolean => {
  const trimmed = text.trim();

  const emojiRegex =
    /^[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F018}-\u{1F270}\u{238C}\u{2934}\u{2935}\u{25AA}-\u{25AB}\u{25B6}\u{25C0}\u{25FB}-\u{25FE}\u{2B05}-\u{2B07}\u{2B1B}-\u{2B1C}\u{2B50}\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}\u{FE0F}\u{200D}]+$/u;
  return emojiRegex.test(trimmed) && trimmed.length <= 10; // 최대 10개 문자 (이모지 + 수식어)
};

export default function MessageList({
  messages,
  currentUserId,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesRef = useRef(0);

  // 디버깅: 메시지 데이터 확인
  console.log("=== FRONTEND DEBUG START ===");
  console.log("Total messages:", messages.length);
  console.log(
    "Messages with links:",
    messages.filter((m) => m.links && m.links.length > 0)
  );
  console.log("Sample message:", messages[0]);
  console.log("=== FRONTEND DEBUG END ===");

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
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M20 13C20 12.4477 19.5523 12 19 12H13C12.4477 12 12 12.4477 12 13V16.3916C12.0002 16.9437 12.4478 17.3916 13 17.3916H16.1631L16.2617 17.3965C16.4907 17.4192 16.706 17.5204 16.8701 17.6846L17.7715 18.5859V18.3916C17.7715 17.8394 18.2193 17.3917 18.7715 17.3916H19C19.5522 17.3916 19.9998 16.9438 20 16.3916V13ZM18 6C18 5.44772 17.5523 5 17 5H5C4.44772 5 4 5.44772 4 6V13.8262C4.00005 14.3784 4.44774 14.8262 5 14.8262H6.56543C7.11762 14.8263 7.56543 15.274 7.56543 15.8262V17.5859L10 15.1514V13C10 11.3431 11.3431 10 13 10H18V6ZM20 10.1738C21.1647 10.5859 22 11.6941 22 13V16.3916C21.9999 17.7812 21.0539 18.9463 19.7715 19.2871V21C19.7715 21.4045 19.528 21.769 19.1543 21.9238C18.7806 22.0786 18.3504 21.993 18.0645 21.707L15.749 19.3916H13C11.8063 19.3916 10.778 18.6929 10.2949 17.6836L7.27246 20.707C6.98648 20.993 6.55628 21.0786 6.18262 20.9238C5.80894 20.769 5.56543 20.4045 5.56543 20V16.8262H5C3.34317 16.8262 2.00005 15.483 2 13.8262V6C2 4.34315 3.34315 3 5 3H17C18.6569 3 20 4.34315 20 6V10.1738Z" />
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
            const emojiOnly = isEmojiOnly(message.content);

            if (emojiOnly) {
              return (
                <div
                  key={message.id}
                  className={`flex ${
                    isCurrentUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`flex items-end space-x-2 ${
                      isCurrentUser
                        ? "flex-row-reverse space-x-reverse"
                        : "flex-row"
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

                    {/* 이모지 메시지 */}
                    <div className="flex flex-col items-center">
                      <div
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
                      </div>
                      <div className="text-[40px] select-none">
                        {message.content.trim()}
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // 일반 텍스트 메시지 렌더링
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
                      ? "flex-row-reverse space-x-reverse space-x-3 items-end"
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
                  <div
                    className={`flex-1 min-w-0 ${
                      isCurrentUser ? "flex flex-col justify-end items-end" : ""
                    }`}
                  >
                    <div
                      className={`flex items-center mb-1 gap-2 h-[20px] ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <span
                        className="text-sm font-medium "
                        style={{ color: `rgb(var(--text-secondary))` }}
                      >
                        {isCurrentUser ? "" : message.user_name}
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
                      className={`px-4 py-2 rounded-2xl whitespace-pre-wrap break-words w-fit ${
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
                      {parseTextWithLinks(message.content).map(
                        (part, index) => {
                          if (
                            typeof part === "object" &&
                            part.type === "link"
                          ) {
                            return (
                              <a
                                key={index}
                                href={part.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline hover:opacity-80 transition-opacity"
                                style={{
                                  color: isCurrentUser
                                    ? `rgb(var(--message-own-text))`
                                    : `rgb(var(--text-primary))`,
                                }}
                              >
                                {part.text}
                              </a>
                            );
                          }
                          return <span key={index}>{String(part)}</span>;
                        }
                      )}
                    </div>

                    {/* 링크 미리보기 */}
                    {message.links && message.links.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {message.links.map((link) => (
                          <LinkPreview
                            key={link.id}
                            link={link}
                            isCurrentUser={isCurrentUser}
                          />
                        ))}
                      </div>
                    )}
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

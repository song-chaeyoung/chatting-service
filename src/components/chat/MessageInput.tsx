import { useState, useRef, useEffect } from "react";

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isSending: boolean;
}

// 자주 사용하는 이모지 목록
const POPULAR_EMOJIS = [
  "😀",
  "😂",
  "🥰",
  "😍",
  "🤔",
  "😭",
  "😱",
  "😴",
  "👍",
  "👎",
  "👏",
  "🙏",
  "❤️",
  "💔",
  "🔥",
  "⭐",
];

export default function MessageInput({
  onSendMessage,
  isSending,
}: MessageInputProps) {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = scrollHeight + "px";
    }
  }, [newMessage]);

  // 이모지 피커 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    await onSendMessage(newMessage.trim());
    setNewMessage("");
    setShowEmojiPicker(false);

    // 메시지 전송 후 텍스트 영역에 다시 포커스
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
  };

  const handleEmojiClick = (emoji: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const cursorPosition = textarea.selectionStart;
      const textBefore = newMessage.substring(0, cursorPosition);
      const textAfter = newMessage.substring(cursorPosition);
      const newText = textBefore + emoji + textAfter;

      setNewMessage(newText);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd =
          cursorPosition + emoji.length;
        textarea.focus();
      }, 0);
    }
  };

  return (
    <div
      className="relative"
      style={{
        borderTop: `1px solid rgb(var(--border-color))`,
        backgroundColor: `rgb(var(--bg-primary))`,
      }}
    >
      <div className="px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="w-full px-4 py-3 pr-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm transition-all duration-200 placeholder-opacity-60 scrollbar-none placeholder:text-currentColor"
              style={{
                backgroundColor: `rgb(var(--input-bg))`,
                color: `rgb(var(--text-primary))`,
                border: `1px solid rgb(var(--input-border))`,
                minHeight: "48px",
                maxHeight: "200px",
              }}
              rows={1}
              disabled={isSending}
            />

            {/* 이모지 버튼 */}
            <div
              className="absolute right-12 bottom-[14px]"
              ref={emojiButtonRef}
            >
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center cursor-pointer"
                type="button"
              >
                😀
              </button>

              {/* 이모지 피커 */}
              {showEmojiPicker && (
                <div
                  className="absolute bottom-full -right-2 mb-2 z-50"
                  ref={emojiPickerRef}
                >
                  <div
                    className="relative p-4 rounded-xl shadow-lg border"
                    style={{
                      backgroundColor: `rgb(var(--bg-primary))`,
                      borderColor: `rgb(var(--border-color))`,
                      minWidth: "280px",
                    }}
                  >
                    {/* 말풍선 꼬리 */}
                    <div
                      className="absolute -bottom-2 right-4 w-4 h-4 rotate-45 border-r border-b"
                      style={{
                        backgroundColor: `rgb(var(--bg-primary))`,
                        borderColor: `rgb(var(--border-color))`,
                      }}
                    />

                    <div className="grid grid-cols-8 gap-2">
                      {POPULAR_EMOJIS.map((emoji, index) => (
                        <button
                          key={index}
                          onClick={() => handleEmojiClick(emoji)}
                          className="w-8 h-8 flex items-center justify-center text-lg rounded transition-colors duration-200"
                          style={{
                            backgroundColor: "transparent",
                            color: `rgb(var(--text-primary))`,
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = `rgb(var(--bg-tertiary))`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 전송 버튼 */}
            <button
              onClick={handleSend}
              disabled={!newMessage.trim() || isSending}
              className="absolute right-2 bottom-[14px] w-8 h-8 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center cursor-pointer"
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              )}
            </button>
          </div>
          <div
            className="mt-2 text-xs text-center"
            style={{ color: `rgb(var(--text-muted))` }}
          >
            Enter로 전송, Shift+Enter로 줄바꿈 • 😀 버튼으로 이모지 추가
          </div>
        </div>
      </div>
    </div>
  );
}

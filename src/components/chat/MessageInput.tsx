import { useState, useRef, useEffect } from "react";

interface MessageInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isSending: boolean;
}

export default function MessageInput({
  onSendMessage,
  isSending,
}: MessageInputProps) {
  const [newMessage, setNewMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = scrollHeight + "px";
    }
  }, [newMessage]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    await onSendMessage(newMessage.trim());
    setNewMessage("");

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

  return (
    <div
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
              className="w-full px-4 py-3 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none shadow-sm transition-all duration-200 placeholder-opacity-60 scrollbar-none"
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
            Enter로 전송, Shift+Enter로 줄바꿈
          </div>
        </div>
      </div>
    </div>
  );
}

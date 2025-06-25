import { useState } from "react";

interface PasswordModalProps {
  roomName: string;
  onSubmit: (password: string) => Promise<void>;
  onCancel: () => void;
}

export default function PasswordModal({
  roomName,
  onSubmit,
  onCancel,
}: PasswordModalProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      setIsLoading(true);
      try {
        await onSubmit(password.trim());
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClose = () => {
    setPassword("");
    onCancel();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="rounded-2xl p-8 max-w-md w-full mx-4 shadow-xl"
        style={{ backgroundColor: `rgb(var(--bg-secondary))` }}
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-orange-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h2
            className="text-xl font-semibold mb-2"
            style={{ color: `rgb(var(--text-primary))` }}
          >
            비공개 채팅방
          </h2>
          <p style={{ color: `rgb(var(--text-secondary))` }}>
            <span className="font-medium">{roomName}</span>에 입장하려면
            비밀번호가 필요합니다.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              style={{
                backgroundColor: `rgb(var(--input-bg))`,
                color: `rgb(var(--text-primary))`,
                border: `1px solid rgb(var(--input-border))`,
              }}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              style={{
                color: `rgb(var(--text-secondary))`,
                border: `1px solid rgb(var(--border-color))`,
                backgroundColor: "transparent",
              }}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="flex-1 px-4 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {isLoading ? "확인 중..." : "입장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

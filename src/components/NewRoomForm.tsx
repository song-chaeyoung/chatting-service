import { useState } from "react";

interface NewRoomFormProps {
  onCreateRoom: (
    roomName: string,
    isPrivate: boolean,
    password?: string
  ) => Promise<void>;
  onCancel: () => void;
}

export default function NewRoomForm({
  onCreateRoom,
  onCancel,
}: NewRoomFormProps) {
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!roomName.trim()) {
      alert("방 이름을 입력해주세요!");
      return;
    }

    if (isPrivate && !password.trim()) {
      alert("비공개 방은 비밀번호가 필요합니다!");
      return;
    }

    setIsLoading(true);
    try {
      await onCreateRoom(
        roomName.trim(),
        isPrivate,
        isPrivate ? password.trim() : undefined
      );
      setRoomName("");
      setPassword("");
      setIsPrivate(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
        style={{
          backgroundColor: `rgb(var(--bg-secondary))`,
          border: `1px solid rgb(var(--border-color))`,
        }}
      >
        <h2
          className="text-xl font-semibold mb-6"
          style={{ color: `rgb(var(--text-primary))` }}
        >
          새 채팅방 만들기
        </h2>

        <div className="space-y-4">
          <div className="flex space-x-3">
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="채팅방 이름을 입력하세요"
              className="flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-opacity-60"
              style={{
                backgroundColor: `rgb(var(--input-bg))`,
                color: `rgb(var(--text-primary))`,
                border: `1px solid rgb(var(--input-border))`,
              }}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                style={{
                  backgroundColor: `rgb(var(--input-bg))`,
                  borderColor: `rgb(var(--input-border))`,
                }}
                disabled={isLoading}
              />
              <span style={{ color: `rgb(var(--text-secondary))` }}>
                비공개 채팅방
              </span>
            </label>
          </div>

          {isPrivate && (
            <div className="flex space-x-3">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="flex-1 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-opacity-60"
                style={{
                  backgroundColor: `rgb(var(--input-bg))`,
                  color: `rgb(var(--text-primary))`,
                  border: `1px solid rgb(var(--input-border))`,
                }}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-xl hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              style={{
                color: `rgb(var(--text-secondary))`,
                border: `1px solid rgb(var(--border-color))`,
                backgroundColor: "transparent",
              }}
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                isLoading || !roomName.trim() || (isPrivate && !password.trim())
              }
              className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
            >
              {isLoading ? "생성 중..." : "만들기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

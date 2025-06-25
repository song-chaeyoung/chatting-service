import { useState } from "react";

interface WelcomeScreenProps {
  onUserNameSet: (userName: string) => void;
}

export default function WelcomeScreen({ onUserNameSet }: WelcomeScreenProps) {
  const [inputName, setInputName] = useState("");
  const [inputPassword, setInputPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = inputName.trim();
    const trimmedPassword = inputPassword.trim();

    if (!trimmedName || !trimmedPassword) {
      setError("사용자 이름과 비밀번호를 모두 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 로그인 시도
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userName: trimmedName,
          password: trimmedPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("chatUserName", trimmedName);
        onUserNameSet(trimmedName);
      } else {
        setError(data.error || "로그인에 실패했습니다.");
      }
    } catch (error) {
      console.log(error);
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: `rgb(var(--bg-primary))` }}
    >
      <div
        className="max-w-md w-full p-8 rounded-2xl shadow-xl"
        style={{
          backgroundColor: `rgb(var(--bg-secondary))`,
          border: `1px solid rgb(var(--border-color))`,
        }}
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h1
            className="text-2xl font-bold mb-2"
            style={{ color: `rgb(var(--text-primary))` }}
          >
            채팅 서비스에 오신 것을 환영합니다!
          </h1>
          <p
            className="text-sm"
            style={{ color: `rgb(var(--text-secondary))` }}
          >
            시작하려면 사용자 이름을 입력해주세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div>
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="사용자 이름을 입력하세요"
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              style={{
                backgroundColor: `rgb(var(--input-bg))`,
                color: `rgb(var(--text-primary))`,
                border: `1px solid rgb(var(--input-border))`,
              }}
              autoFocus
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <input
              type="password"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              style={{
                backgroundColor: `rgb(var(--input-bg))`,
                color: `rgb(var(--text-primary))`,
                border: `1px solid rgb(var(--input-border))`,
              }}
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!inputName.trim() || !inputPassword.trim() || isLoading}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 font-medium cursor-pointer"
          >
            {isLoading ? "로그인 중..." : "로그인 / 회원가입"}
          </button>
        </form>
      </div>
    </div>
  );
}

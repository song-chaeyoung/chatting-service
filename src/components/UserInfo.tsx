interface UserInfoProps {
  userName: string;
  onUserNameChange: (userName: string) => void;
}

export default function UserInfo({
  userName,
  onUserNameChange,
}: UserInfoProps) {
  const handleChangeUser = () => {
    localStorage.removeItem("chatUserName");
    onUserNameChange("");
  };

  return (
    <div
      className="rounded-2xl shadow-sm p-8 mb-8"
      style={{
        backgroundColor: `rgb(var(--bg-secondary))`,
        border: `1px solid rgb(var(--border-color))`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div>
            <h2
              className="text-lg font-semibold"
              style={{ color: `rgb(var(--text-primary))` }}
            >
              안녕하세요, {userName}님!
            </h2>
            <p
              className="text-sm"
              style={{ color: `rgb(var(--text-secondary))` }}
            >
              채팅방을 선택하거나 새로운 방을 만들어보세요
            </p>
          </div>
        </div>
        <button
          onClick={handleChangeUser}
          className="px-4 py-2 rounded-lg hover:opacity-80 transition-all duration-200 text-sm font-medium"
          style={{
            color: `rgb(var(--text-secondary))`,
            border: `1px solid rgb(var(--border-color))`,
            backgroundColor: "transparent",
          }}
        >
          사용자 변경
        </button>
      </div>
    </div>
  );
}

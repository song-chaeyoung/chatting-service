interface ChatHeaderProps {
  roomName: string;
  userName: string;
  connectionStatus?: "connecting" | "connected" | "disconnected";
  onExit: () => void;
  onGoHome?: () => void;
  onToggleDrawer?: () => void;
}

export default function ChatHeader({
  roomName,
  userName,
  onExit,
  onGoHome,
  onToggleDrawer,
}: ChatHeaderProps) {
  // const getStatusColor = () => {
  //   switch (connectionStatus) {
  //     case "connected":
  //       return "bg-green-500";
  //     case "connecting":
  //       return "bg-yellow-500";
  //     default:
  //       return "bg-red-500";
  //   }
  // };

  // const getStatusText = () => {
  //   switch (connectionStatus) {
  //     case "connected":
  //       return "실시간 연결됨";
  //     case "connecting":
  //       return "연결 중...";
  //     default:
  //       return "연결 끊김";
  //   }
  // };

  return (
    <div
      className="px-4 md:px-6 py-4"
      style={{
        backgroundColor: `rgb(var(--bg-primary))`,
        borderBottom: `1px solid rgb(var(--border-color))`,
      }}
    >
      <div className="flex items-center justify-between">
        {/* 모바일: 홈 버튼 + 방 이름 */}
        <div className="flex items-center space-x-3 md:space-x-0">
          {/* 홈 버튼 - 모바일에만 표시 */}
          <button
            onClick={onGoHome}
            className="md:hidden p-2 hover:opacity-70 transition-opacity"
            style={{ color: `rgb(var(--text-primary))` }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <h1
            className="text-lg md:text-xl font-semibold"
            style={{ color: `rgb(var(--text-primary))` }}
          >
            {roomName}
          </h1>
        </div>

        {/* 우측 버튼들 */}
        <div className="flex items-center space-x-3 md:space-x-4">
          <span
            className="text-sm hidden md:block"
            style={{ color: `rgb(var(--text-secondary))` }}
          >
            {userName}
          </span>

          {/* 드로어 버튼 - 모바일에만 표시 */}
          <button
            onClick={onToggleDrawer}
            className="md:hidden p-2 hover:opacity-70 transition-opacity"
            style={{ color: `rgb(var(--text-primary))` }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* X 버튼 - 데스크톱에만 표시 */}
          <button
            onClick={onExit}
            className="hidden md:block hover:opacity-70 transition-colors cursor-pointer"
            style={{ color: `rgb(var(--text-muted))` }}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

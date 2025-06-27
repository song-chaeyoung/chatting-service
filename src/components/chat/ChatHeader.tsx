interface ChatHeaderProps {
  roomName: string;
  userName: string;
  connectionStatus?: "connecting" | "connected" | "disconnected";
  onExit: () => void;
}

export default function ChatHeader({
  roomName,
  userName,
  onExit,
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
      className="px-6 py-4"
      style={{
        backgroundColor: `rgb(var(--bg-primary))`,
        borderBottom: `1px solid rgb(var(--border-color))`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1
            className="text-xl font-semibold"
            style={{ color: `rgb(var(--text-primary))` }}
          >
            {roomName}
          </h1>
          {/* <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
            <span
              className="text-sm"
              style={{ color: `rgb(var(--text-secondary))` }}
            >
              {getStatusText()}
            </span>
          </div> */}
        </div>

        <div className="flex items-center space-x-4">
          <span
            className="text-sm"
            style={{ color: `rgb(var(--text-secondary))` }}
          >
            {userName}
          </span>
          <button
            onClick={onExit}
            className="hover:opacity-70 transition-colors cursor-pointer"
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

interface MobileUserSectionProps {
  userName: string;
  onUserNameChange?: (name: string) => void;
}

export default function MobileUserSection({
  userName,
}: MobileUserSectionProps) {
  return (
    <div
      className="flex items-center space-x-3 p-3 rounded-lg"
      style={{ backgroundColor: `rgb(var(--bg-secondary))` }}
    >
      {/* 아바타 */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
        style={{
          backgroundColor: "rgb(59, 130, 246)",
          color: "white",
        }}
      >
        {userName.charAt(0).toUpperCase()}
      </div>

      {/* 사용자 정보 */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium truncate"
          style={{ color: `rgb(var(--text-primary))` }}
        >
          {userName}
        </p>
        <p
          className="text-xs truncate"
          style={{ color: `rgb(var(--text-secondary))` }}
        >
          온라인
        </p>
      </div>

      {/* 온라인 상태 표시 */}
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
    </div>
  );
}

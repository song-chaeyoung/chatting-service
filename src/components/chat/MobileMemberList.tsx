import { useMemberSubscription } from "@/hooks/useMemberSubscription";

interface MobileMemberListProps {
  roomId: string;
  currentUserName: string;
}

export default function MobileMemberList({
  roomId,
  currentUserName,
}: MobileMemberListProps) {
  const { members, onlineUsers, isLoading } = useMemberSubscription(
    roomId,
    currentUserName
  );

  const getLastSeenText = (lastAccessedAt: string) => {
    const now = new Date();
    const lastSeen = new Date(lastAccessedAt);
    const diffInMinutes = Math.floor(
      (now.getTime() - lastSeen.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "방금 전";
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  if (isLoading) {
    return (
      <div className="p-3 text-center">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-xs" style={{ color: `rgb(var(--text-secondary))` }}>
          로딩 중...
        </p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="p-3 text-center">
        <p className="text-xs" style={{ color: `rgb(var(--text-secondary))` }}>
          참여자가 없습니다
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3
        className="text-sm font-medium mb-3"
        style={{ color: `rgb(var(--text-secondary))` }}
      >
        👥 현재 방 멤버 ({currentUserName && roomId ? members.length : "0"})
      </h3>
      {members
        .sort((a, b) => {
          if (a.name === currentUserName) return -1;
          if (b.name === currentUserName) return 1;

          const aOnline = onlineUsers.some((user) => user.user_name === a.name);
          const bOnline = onlineUsers.some((user) => user.user_name === b.name);

          if (aOnline && !bOnline) return -1;
          if (!aOnline && bOnline) return 1;

          return a.name.localeCompare(b.name);
        })
        .map((member) => {
          const isCurrentUser = member.name === currentUserName;
          const isOnline = onlineUsers.some(
            (user) => user.user_name === member.name
          );

          return (
            <div
              key={member.id}
              className={`flex items-center space-x-3 p-3 rounded-lg ${
                isCurrentUser ? "bg-blue-50" : ""
              }`}
              style={{
                backgroundColor: isCurrentUser
                  ? "rgba(59, 130, 246, 0.1)"
                  : "transparent",
              }}
            >
              {/* 아바타 */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                style={{
                  backgroundColor: isCurrentUser
                    ? "rgb(59, 130, 246)"
                    : `rgb(var(--bg-tertiary))`,
                  color: isCurrentUser ? "white" : `rgb(var(--text-secondary))`,
                }}
              >
                {member.name.charAt(0).toUpperCase()}
              </div>
              {/* 멤버 정보 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p
                    className="text-sm font-medium truncate"
                    style={{
                      color: isCurrentUser
                        ? "rgb(59, 130, 246)"
                        : `rgb(var(--text-primary))`,
                    }}
                  >
                    {member.name}
                    {isCurrentUser && (
                      <span className="text-xs ml-1 text-blue-500">(나)</span>
                    )}
                  </p>
                </div>
                <p
                  className="text-xs truncate"
                  style={{ color: `rgb(var(--text-muted))` }}
                >
                  {isOnline ? "온라인" : getLastSeenText(member.lastAccessedAt)}
                </p>
              </div>
              {/* 온라인 상태 */}
              <div className="flex-shrink-0">
                {isOnline ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                ) : (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: `rgb(var(--text-muted))` }}
                  ></div>
                )}
              </div>
            </div>
          );
        })}
    </div>
  );
}

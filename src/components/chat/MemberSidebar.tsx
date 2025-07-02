import { useMemberSubscription } from "@/hooks/useMemberSubscription";

interface MemberSidebarProps {
  roomId: string;
  currentUserName: string;
}

export default function MemberSidebar({
  roomId,
  currentUserName,
}: MemberSidebarProps) {
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

  return (
    <div
      className="w-64 h-full border-l flex flex-col"
      style={{
        backgroundColor: `rgb(var(--bg-secondary))`,
        borderColor: `rgb(var(--border-color))`,
      }}
    >
      <div
        className="p-4 border-b"
        style={{ borderColor: `rgb(var(--border-color))` }}
      >
        <h3
          className="font-semibold text-lg"
          style={{ color: `rgb(var(--text-primary))` }}
        >
          참여자 ({members.length})
        </h3>
        <p
          className="text-xs mt-1"
          style={{ color: `rgb(var(--text-secondary))` }}
        >
          온라인: {onlineUsers.length}명
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p
              className="text-sm"
              style={{ color: `rgb(var(--text-secondary))` }}
            >
              로딩 중...
            </p>
          </div>
        ) : members.length === 0 ? (
          <div className="p-4 text-center">
            <p
              className="text-sm"
              style={{ color: `rgb(var(--text-secondary))` }}
            >
              참여자가 없습니다
            </p>
          </div>
        ) : (
          <div className="p-2">
            {members
              .sort((a, b) => {
                if (a.name === currentUserName) return -1;
                if (b.name === currentUserName) return 1;

                const aOnline = onlineUsers.some(
                  (user) => user.user_name === a.name
                );
                const bOnline = onlineUsers.some(
                  (user) => user.user_name === b.name
                );

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
                    className={`flex items-center space-x-3 p-3 rounded-lg mb-2 ${
                      isCurrentUser ? "bg-blue-50" : ""
                    }`}
                    style={{
                      backgroundColor: isCurrentUser
                        ? "rgba(59, 130, 246, 0.1)"
                        : "transparent",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0"
                      style={{
                        backgroundColor: isCurrentUser
                          ? "rgb(59, 130, 246)"
                          : `rgb(var(--bg-tertiary))`,
                        color: isCurrentUser
                          ? "white"
                          : `rgb(var(--text-secondary))`,
                      }}
                    >
                      {member.name.charAt(0).toUpperCase()}
                    </div>

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
                            <span className="text-xs ml-1 text-blue-500">
                              (나)
                            </span>
                          )}
                        </p>
                      </div>
                      <p
                        className="text-xs truncate"
                        style={{ color: `rgb(var(--text-muted))` }}
                      >
                        {isOnline
                          ? "온라인"
                          : getLastSeenText(member.lastAccessedAt)}
                      </p>
                    </div>

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
        )}
      </div>
    </div>
  );
}

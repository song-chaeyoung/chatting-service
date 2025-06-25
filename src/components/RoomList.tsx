import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";

interface Room {
  id: string;
  name: string;
  created_at: string;
  is_private: boolean;
}

interface RoomListProps {
  rooms: Room[];
  isLoading: boolean;
  onJoinPrivateRoom: (roomId: string, roomName: string) => void;
}

export default function RoomList({
  rooms,
  isLoading,
  onJoinPrivateRoom,
}: RoomListProps) {
  useTheme();

  const handleRoomClick = (e: React.MouseEvent, room: Room) => {
    if (room.is_private) {
      e.preventDefault();
      onJoinPrivateRoom(room.id, room.name);
    }
  };

  if (isLoading) {
    return (
      <div
        className="rounded-2xl shadow-sm p-8"
        style={{
          backgroundColor: `rgb(var(--bg-secondary))`,
          border: `1px solid rgb(var(--border-color))`,
        }}
      >
        <h2
          className="text-xl font-semibold mb-6"
          style={{ color: `rgb(var(--text-primary))` }}
        >
          채팅방 목록
        </h2>
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2" style={{ color: `rgb(var(--text-secondary))` }}>
            채팅방을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl shadow-sm p-8"
      style={{
        backgroundColor: `rgb(var(--bg-secondary))`,
        border: `1px solid rgb(var(--border-color))`,
      }}
    >
      <h2
        className="text-xl font-semibold mb-6"
        style={{ color: `rgb(var(--text-primary))` }}
      >
        채팅방 목록
      </h2>

      {rooms.length === 0 ? (
        <div className="text-center py-8">
          <div
            className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
            style={{ backgroundColor: `rgb(var(--bg-tertiary))` }}
          >
            <svg
              className="w-8 h-8"
              style={{ color: `rgb(var(--text-muted))` }}
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
          <p style={{ color: `rgb(var(--text-secondary))` }}>
            아직 생성된 채팅방이 없습니다.
          </p>
          <p
            className="text-sm mt-1"
            style={{ color: `rgb(var(--text-muted))` }}
          >
            위에서 새 채팅방을 만들어보세요!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.map((room) => (
            <Link
              key={room.id}
              href={room.is_private ? "#" : `/room/${room.id}`}
              onClick={(e) => handleRoomClick(e, room)}
              className="block p-4 rounded-xl hover:opacity-80 transition-all duration-200 group"
              style={{
                border: `1px solid rgb(var(--border-color))`,
                backgroundColor: `rgb(var(--bg-primary))`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200"
                    style={{
                      backgroundColor: room.is_private
                        ? "rgba(251, 146, 60, 0.1)"
                        : "rgba(59, 130, 246, 0.1)",
                    }}
                  >
                    {room.is_private ? (
                      <svg
                        className="w-5 h-5 text-orange-500"
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
                    ) : (
                      <svg
                        className="w-5 h-5 text-blue-500"
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
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3
                        className="font-medium transition-colors duration-200"
                        style={{
                          color: room.is_private
                            ? "#ea580c"
                            : `rgb(var(--text-primary))`,
                        }}
                      >
                        {room.name}
                      </h3>
                      {room.is_private && (
                        <span className="px-2 py-1 text-xs bg-orange-100 text-orange-600 rounded-full">
                          비공개
                        </span>
                      )}
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: `rgb(var(--text-secondary))` }}
                    >
                      {new Date(room.created_at).toLocaleDateString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 transition-colors duration-200"
                  style={{ color: `rgb(var(--text-muted))` }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PasswordModal from "../PasswordModal";

interface Room {
  id: string;
  name: string;
  created_at: string;
  is_private: boolean;
}

interface MobileChatListProps {
  userName: string;
  currentRoomId?: string;
}

export default function MobileChatList({
  userName,
  currentRoomId,
}: MobileChatListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 비밀번호 모달 상태
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    roomId: "",
    roomName: "",
    isLoading: false,
  });

  const fetchRooms = useCallback(async () => {
    if (!userName) return;

    try {
      const response = await fetch(
        `/api/users/${encodeURIComponent(userName)}/rooms`
      );
      const data = await response.json();

      if (response.ok) {
        setRooms(data.rooms || []);
      } else {
        console.error("사용자 채팅방을 불러오는 중 오류가 발생했습니다.");
      }
    } catch {
      console.error("사용자 채팅방을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [userName]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // 비공개 채팅방 클릭 처리
  const handleRoomClick = (e: React.MouseEvent, room: Room) => {
    if (room.is_private) {
      e.preventDefault();
      setPasswordModal({
        isOpen: true,
        roomId: room.id,
        roomName: room.name,
        isLoading: false,
      });
    }
  };

  // 비밀번호 확인 및 입장
  const handlePasswordSubmit = async (password: string) => {
    setPasswordModal((prev) => ({ ...prev, isLoading: true }));

    try {
      // API를 통해 비밀번호 확인
      const response = await fetch(
        `/api/rooms/${passwordModal.roomId}/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
            userName,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // 비밀번호가 맞으면 세션에 접근 권한과 비밀번호 저장 후 채팅방으로 이동
        sessionStorage.setItem(`room_access_${passwordModal.roomId}`, "true");
        sessionStorage.setItem(
          `room_password_${passwordModal.roomId}`,
          password
        );
        router.push(`/room/${passwordModal.roomId}`);
        setPasswordModal({
          isOpen: false,
          roomId: "",
          roomName: "",
          isLoading: false,
        });
      } else {
        alert(data.error || "비밀번호가 틀렸습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("네트워크 오류가 발생했습니다.");
    } finally {
      setPasswordModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  // 비밀번호 모달 닫기
  const handlePasswordModalClose = () => {
    setPasswordModal({
      isOpen: false,
      roomId: "",
      roomName: "",
      isLoading: false,
    });
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

  if (rooms.length === 0) {
    return (
      <div className="p-3 text-center">
        <p className="text-xs" style={{ color: `rgb(var(--text-secondary))` }}>
          참여한 채팅방이 없습니다
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-1">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={room.is_private ? "#" : `/room/${room.id}`}
            onClick={(e) => handleRoomClick(e, room)}
            className={`block p-3 rounded-lg transition-colors hover:opacity-80 ${
              currentRoomId === room.id ? "opacity-80" : ""
            }`}
            style={{
              backgroundColor:
                currentRoomId === room.id
                  ? `rgba(59, 130, 246, 0.1)`
                  : "transparent",
            }}
          >
            <div className="flex items-center space-x-3">
              {/* 방 아이콘 */}
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium flex-shrink-0"
                style={{
                  backgroundColor: room.is_private
                    ? "rgba(251, 146, 60, 0.2)"
                    : `rgb(var(--bg-tertiary))`,
                  color: room.is_private
                    ? "rgb(251, 146, 60)"
                    : `rgb(var(--text-secondary))`,
                }}
              >
                {room.is_private ? (
                  "🔒"
                ) : (
                  <svg
                    className="w-5 h-5"
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
                )}
              </div>

              {/* 방 정보 */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{
                    color:
                      currentRoomId === room.id
                        ? "rgb(59, 130, 246)"
                        : `rgb(var(--text-primary))`,
                  }}
                >
                  {room.is_private ? "비공개방" : room.name}
                </p>
                <p
                  className="text-xs truncate"
                  style={{ color: `rgb(var(--text-muted))` }}
                >
                  {new Date(room.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* 현재 방 표시 */}
              {currentRoomId === room.id && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* 비밀번호 입력 모달 */}
      {passwordModal.isOpen && (
        <PasswordModal
          onCancel={handlePasswordModalClose}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </>
  );
}

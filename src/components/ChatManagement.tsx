"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import RoomList from "./RoomList";
import NewRoomForm from "./NewRoomForm";
import PasswordModal from "./PasswordModal";
import UserInfo from "./UserInfo";
import ChatSidebar from "./chat/ChatSidebar";

interface Room {
  id: string;
  name: string;
  created_at: string;
  is_private: boolean;
}

interface ChatManagementProps {
  userName: string;
  onUserNameChange: (name: string) => void;
}

export default function ChatManagement({
  userName,
  onUserNameChange,
}: ChatManagementProps) {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRoomForm, setShowNewRoomForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<{
    id: string;
    name: string;
  } | null>(null);

  useTheme();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      const data = await response.json();

      if (response.ok) {
        setRooms(data.rooms);
      } else {
        console.error("Error fetching rooms:", data.error);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRoom = async (
    name: string,
    isPrivate: boolean,
    password?: string
  ) => {
    if (!userName) {
      alert("사용자 이름을 먼저 설정해주세요!");
      return;
    }

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          userName,
          isPrivate,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowNewRoomForm(false);
        await fetchRooms();

        // 비공개 방이면 세션에 접근 권한과 비밀번호 저장
        if (isPrivate && password) {
          sessionStorage.setItem(`room_access_${data.room.id}`, "true");
          sessionStorage.setItem(`room_password_${data.room.id}`, password);
        }

        // 생성된 채팅방으로 이동
        router.push(`/room/${data.room.id}`);
      } else {
        alert(data.error || "채팅방 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error creating room:", error);
      alert("채팅방 생성 중 오류가 발생했습니다.");
    }
  };

  const handleJoinPrivateRoom = (roomId: string, roomName: string) => {
    setSelectedRoom({ id: roomId, name: roomName });
    setShowPasswordModal(true);
  };

  const handlePasswordSubmit = async (password: string) => {
    if (!selectedRoom || !userName) return;

    try {
      const response = await fetch(`/api/rooms/${selectedRoom.id}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          userName,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 접근 권한과 비밀번호를 세션에 저장
        sessionStorage.setItem(`room_access_${selectedRoom.id}`, "true");
        sessionStorage.setItem(`room_password_${selectedRoom.id}`, password);

        // 채팅방으로 이동
        window.location.href = `/room/${selectedRoom.id}`;
      } else {
        alert(data.error || "비밀번호가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("Error verifying password:", error);
      alert("비밀번호 확인 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <ChatSidebar userName={userName} />
      <div
        className="min-h-screen p-6 flex-1"
        style={{ backgroundColor: `rgb(var(--bg-primary))` }}
      >
        <div className="max-w-4xl mx-auto w-full">
          <UserInfo userName={userName} onUserNameChange={onUserNameChange} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-4">
                <h2
                  className="text-xl font-semibold"
                  style={{ color: `rgb(var(--text-primary))` }}
                >
                  채팅방 목록
                </h2>
                <button
                  onClick={() => setShowNewRoomForm(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  새 채팅방 만들기
                </button>
              </div>
              <RoomList
                rooms={rooms}
                isLoading={isLoading}
                onJoinPrivateRoom={handleJoinPrivateRoom}
              />
            </div>

            {/* <div className="space-y-6">
              <div
                className="p-4 rounded-lg"
                style={{ backgroundColor: `rgb(var(--bg-secondary))` }}
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: `rgb(var(--text-primary))` }}
                >
                  사용법
                </h3>
                <ul
                  className="text-sm space-y-1"
                  style={{ color: `rgb(var(--text-secondary))` }}
                >
                  <li>• 채팅방을 클릭하면 입장할 수 있습니다</li>
                  <li>• 🔒 표시가 있는 방은 비공개 채팅방입니다</li>
                  <li>• 새 채팅방을 만들어 친구들과 대화하세요</li>
                </ul>
              </div>
            </div> */}
          </div>
        </div>

        {showNewRoomForm && (
          <NewRoomForm
            onCreateRoom={handleCreateRoom}
            onCancel={() => setShowNewRoomForm(false)}
          />
        )}

        {showPasswordModal && selectedRoom && (
          <PasswordModal
            onSubmit={handlePasswordSubmit}
            onCancel={() => {
              setShowPasswordModal(false);
              setSelectedRoom(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

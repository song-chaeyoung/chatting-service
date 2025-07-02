"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import RoomList from "./RoomList";
import NewRoomForm from "./NewRoomForm";
import PasswordModal from "./PasswordModal";
import UserInfo from "./UserInfo";
import ChatSidebar from "./chat/ChatSidebar";
import MobileDrawer from "./chat/MobileDrawer";

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

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

  const handleToggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* 데스크톱 좌측 사이드바 */}
      <div className="hidden md:block">
        <ChatSidebar userName={userName} />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div
        className="min-h-screen p-4 md:p-6 flex-1"
        style={{ backgroundColor: `rgb(var(--bg-primary))` }}
      >
        {/* 모바일 헤더 */}
        <div className="md:hidden flex items-center justify-between mb-6">
          <h1
            className="text-xl font-bold"
            style={{ color: `rgb(var(--text-primary))` }}
          >
            Chat It!
          </h1>
          <button
            onClick={handleToggleDrawer}
            className="p-2 hover:opacity-70 transition-opacity"
            style={{ color: `rgb(var(--text-primary))` }}
          >
            <svg
              className="w-6 h-6"
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
        </div>

        <div className="max-w-4xl mx-auto w-full">
          {/* 데스크톱 사용자 정보 */}
          <div className="hidden md:block">
            <UserInfo userName={userName} onUserNameChange={onUserNameChange} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
              <div className="flex justify-between items-center mb-4">
                <h2
                  className="text-lg md:text-xl font-semibold"
                  style={{ color: `rgb(var(--text-primary))` }}
                >
                  채팅방 목록
                </h2>
                <button
                  onClick={() => setShowNewRoomForm(true)}
                  className="px-3 py-2 md:px-4 md:py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm md:text-base"
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

      {/* 모바일 드로어 */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        type="home"
        userName={userName}
        onUserNameChange={onUserNameChange}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
}

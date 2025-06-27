"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, Room } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import PasswordModal from "../PasswordModal";

interface ChatSidebarProps {
  currentRoomId?: string;
  userName: string;
}

export default function ChatSidebar({
  currentRoomId,
  userName,
}: ChatSidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newRoomName, setNewRoomName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showNewRoomInput, setShowNewRoomInput] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
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

  const createRoom = async () => {
    if (!newRoomName.trim() || !userName.trim()) {
      alert("방 이름을 입력해주세요!");
      return;
    }

    if (isPrivate && !password.trim()) {
      alert("비공개 방은 비밀번호가 필요합니다!");
      return;
    }

    setIsCreating(true);

    try {
      // 먼저 사용자 찾기 또는 생성
      let userData;
      const { data: existingUser, error: userFindError } = await supabase
        .from("users")
        .select("*")
        .eq("name", userName)
        .single();

      if (userFindError) {
        const { data: newUser, error: userCreateError } = await supabase
          .from("users")
          .insert([{ name: userName }])
          .select()
          .single();

        if (userCreateError) throw userCreateError;
        userData = newUser;
      } else {
        userData = existingUser;
      }

      // 방 생성
      const roomData = {
        name: newRoomName,
        created_by: userData.id,
        is_private: isPrivate,
        ...(isPrivate && password && { password }),
      };

      const { data: createdRoom, error: roomError } = await supabase
        .from("rooms")
        .insert([roomData])
        .select()
        .single();

      if (roomError) throw roomError;

      // room_members 테이블에 방 생성자 추가
      await supabase.from("room_members").insert({
        room_id: createdRoom.id,
        user_id: userData.id,
        joined_at: new Date().toISOString(),
        last_accessed_at: new Date().toISOString(),
      });

      setNewRoomName("");
      setPassword("");
      setIsPrivate(false);
      setShowNewRoomInput(false);
      fetchRooms();

      // 비공개 방이면 세션에 접근 권한 저장
      if (isPrivate) {
        sessionStorage.setItem(`room_access_${createdRoom.id}`, "true");
      }

      // 새로 생성된 방으로 이동
      router.push(`/room/${createdRoom.id}`);
    } catch (error) {
      console.error("Error creating room:", error);
      alert("방 생성 중 오류가 발생했습니다.");
    } finally {
      setIsCreating(false);
    }
  };

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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      createRoom();
    }
    if (e.key === "Escape") {
      setShowNewRoomInput(false);
      setNewRoomName("");
      setPassword("");
      setIsPrivate(false);
    }
  };

  return (
    <div
      className="w-80 flex flex-col h-full"
      style={{
        backgroundColor: `rgb(var(--sidebar-bg))`,
        color: `rgb(var(--sidebar-text))`,
      }}
    >
      {/* 헤더 */}
      <div
        className="p-4"
        style={{ borderBottom: `1px solid rgb(var(--border-color))` }}
      >
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <h2 className="text-lg font-semibold">Chat It!</h2>
          </Link>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors hover:opacity-80 duration-200 cursor-pointer"
              title={theme === "dark" ? "라이트 모드" : "다크 모드"}
            >
              {theme === "dark" ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              )}
            </button>
            <button
              onClick={() => setShowNewRoomInput(true)}
              className="p-2 rounded-lg transition-colors hover:opacity-80 duration-200 cursor-pointer"
              title="새 채팅방"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 새 채팅방 입력 */}
        {showNewRoomInput && (
          <div className="mb-4 space-y-3">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="채팅방 이름..."
              className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-opacity-60"
              style={{
                backgroundColor: `rgb(var(--input-bg))`,
                color: `rgb(var(--text-primary))`,
                border: `1px solid rgb(var(--input-border))`,
              }}
              autoFocus
            />

            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500  focus:ring-1"
                />
                <span>비공개</span>
              </label>
            </div>

            {isPrivate && (
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="비밀번호..."
                className="w-full px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-opacity-60"
                style={{
                  backgroundColor: `rgb(var(--input-bg))`,
                  color: `rgb(var(--text-primary))`,
                  border: `1px solid rgb(var(--input-border))`,
                }}
              />
            )}

            <div className="flex space-x-2">
              <button
                onClick={createRoom}
                disabled={
                  isCreating ||
                  !newRoomName.trim() ||
                  (isPrivate && !password.trim())
                }
                className="flex-1 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-gray-600 transition-colors cursor-pointer"
              >
                {isCreating ? "생성 중..." : "생성"}
              </button>
              <button
                onClick={() => {
                  setShowNewRoomInput(false);
                  setNewRoomName("");
                  setPassword("");
                  setIsPrivate(false);
                }}
                className="px-3 py-1 rounded text-sm transition-colors cursor-pointer"
                style={{
                  backgroundColor: `rgb(var(--bg-tertiary))`,
                  color: `rgb(var(--text-secondary))`,
                }}
              >
                취소
              </button>
            </div>
          </div>
        )}

        <div className="text-xs" style={{ color: `rgb(var(--text-muted))` }}>
          {userName}님으로 로그인됨
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center">
            <p className="text-sm" style={{ color: `rgb(var(--text-muted))` }}>
              채팅방을 불러오는 중...
            </p>
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm" style={{ color: `rgb(var(--text-muted))` }}>
              채팅방이 없습니다
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: `rgb(var(--text-muted))` }}
            >
              새 채팅방을 만들어보세요
            </p>
          </div>
        ) : (
          <div className="p-2">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={room.is_private ? "#" : `/room/${room.id}`}
                onClick={(e) => handleRoomClick(e, room)}
                className={`block p-3 rounded-lg mb-1 transition-colors hover:opacity-80 ${
                  currentRoomId === room.id ? "opacity-80" : ""
                }`}
                style={{
                  backgroundColor:
                    currentRoomId === room.id
                      ? `rgb(var(--sidebar-hover))`
                      : "transparent",
                }}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      room.is_private ? "bg-orange-500 bg-opacity-20" : ""
                    }`}
                    style={{
                      backgroundColor: room.is_private
                        ? "rgb(251 146 60 / 0.2)"
                        : `rgb(var(--bg-tertiary))`,
                    }}
                  >
                    {room.is_private ? (
                      <svg
                        className="w-4 h-4 text-orange-500"
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
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20 13C20 12.4477 19.5523 12 19 12H13C12.4477 12 12 12.4477 12 13V16.3916C12.0002 16.9437 12.4478 17.3916 13 17.3916H16.1631L16.2617 17.3965C16.4907 17.4192 16.706 17.5204 16.8701 17.6846L17.7715 18.5859V18.3916C17.7715 17.8394 18.2193 17.3917 18.7715 17.3916H19C19.5522 17.3916 19.9998 16.9438 20 16.3916V13ZM18 6C18 5.44772 17.5523 5 17 5H5C4.44772 5 4 5.44772 4 6V13.8262C4.00005 14.3784 4.44774 14.8262 5 14.8262H6.56543C7.11762 14.8263 7.56543 15.274 7.56543 15.8262V17.5859L10 15.1514V13C10 11.3431 11.3431 10 13 10H18V6ZM20 10.1738C21.1647 10.5859 22 11.6941 22 13V16.3916C21.9999 17.7812 21.0539 18.9463 19.7715 19.2871V21C19.7715 21.4045 19.528 21.769 19.1543 21.9238C18.7806 22.0786 18.3504 21.993 18.0645 21.707L15.749 19.3916H13C11.8063 19.3916 10.778 18.6929 10.2949 17.6836L7.27246 20.707C6.98648 20.993 6.55628 21.0786 6.18262 20.9238C5.80894 20.769 5.56543 20.4045 5.56543 20V16.8262H5C3.34317 16.8262 2.00005 15.483 2 13.8262V6C2 4.34315 3.34315 3 5 3H17C18.6569 3 20 4.34315 20 6V10.1738Z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p
                        className={`text-sm font-medium truncate ${
                          room.is_private ? "text-orange-400" : ""
                        }`}
                        style={{
                          color: room.is_private
                            ? "rgb(251 146 60)"
                            : `rgb(var(--text-primary))`,
                        }}
                      >
                        {room.is_private ? "비공개" : room.name}
                      </p>
                      {room.is_private && (
                        <span className="px-1.5 py-0.5 text-xs bg-orange-500 bg-opacity-20 text-white rounded">
                          비공개
                        </span>
                      )}
                    </div>
                    <p
                      className="text-xs truncate"
                      style={{ color: `rgb(var(--text-muted))` }}
                    >
                      {new Date(room.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div
        className="p-4"
        style={{ borderTop: `1px solid rgb(var(--border-color))` }}
      >
        <Link
          href="/"
          className="flex items-center space-x-2 p-2 rounded-lg transition-colors hover:opacity-80"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="text-sm">메인으로 돌아가기</span>
        </Link>
      </div>

      {/* 비밀번호 입력 모달 */}
      {passwordModal.isOpen && (
        <PasswordModal
          onCancel={handlePasswordModalClose}
          onSubmit={handlePasswordSubmit}
        />
      )}
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRealtimeChat } from "@/hooks/useRealtimeChat";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatSidebar from "@/components/chat/ChatSidebar";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import MemberSidebar from "@/components/chat/MemberSidebar";
import NotificationPermission from "@/components/NotificationPermission";

export default function ChatRoom() {
  const params = useParams();
  const router = useRouter();

  const roomId = params.id as string;
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const { messages, connectionStatus } = useRealtimeChat({
    roomId,
    userName,
  });

  useEffect(() => {
    // 로컬 스토리지에서 사용자 이름 가져오기
    const savedUserName = localStorage.getItem("chatUserName");

    if (!savedUserName) {
      alert("사용자 이름이 필요합니다!");
      router.push("/");
      return;
    }

    setUserName(savedUserName);
  }, [router]);

  const initializeChat = useCallback(async () => {
    try {
      const savedPassword =
        sessionStorage.getItem(`room_password_${roomId}`) || "";

      const response = await fetch(`/api/rooms/${roomId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: savedPassword, // 저장된 비밀번호 사용 (공개방은 빈 문자열)
          userName,
        }),
      });

      if (!response.ok) {
        alert("이 채팅방에 접근할 권한이 없습니다.");
        router.push("/");
        return;
      }
    } catch {
      alert("채팅방을 불러오는 중 오류가 발생했습니다.");
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  }, [roomId, userName, router]);

  useEffect(() => {
    if (userName && roomId) {
      initializeChat();
    }
  }, [roomId, userName, initializeChat]);

  const handleSendMessage = async (message: string) => {
    if (!userName) return;

    setIsSending(true);

    try {
      const response = await fetch(`/api/rooms/${roomId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: message,
          userName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.error || "메시지 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("메시지 전송 중 오류가 발생했습니다.");
    } finally {
      setIsSending(false);
    }
  };

  const handleExit = () => {
    router.push("/");
  };

  if (isLoading) {
    return (
      <div
        className="h-screen flex items-center justify-center"
        style={{ backgroundColor: `rgb(var(--bg-primary))` }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p style={{ color: `rgb(var(--text-secondary))` }}>
            채팅방을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ backgroundColor: `rgb(var(--bg-secondary))` }}
    >
      <ChatSidebar currentRoomId={roomId} userName={userName} />

      <div
        className="flex-1 flex flex-col"
        style={{ backgroundColor: `rgb(var(--bg-primary))` }}
      >
        <div className="flex-shrink-0">
          <ChatHeader
            roomName="채팅방"
            userName={userName}
            connectionStatus={connectionStatus}
            onExit={handleExit}
          />
        </div>

        <div className="flex-1 flex min-h-0">
          <div className="flex-1 flex flex-col">
            <div className="flex-shrink-0 px-6 pt-4">
              <NotificationPermission />
            </div>
            <MessageList messages={messages} currentUserId={userName} />
            <div className="flex-shrink-0">
              <MessageInput
                onSendMessage={handleSendMessage}
                isSending={isSending}
              />
            </div>
          </div>
          <MemberSidebar roomId={roomId} currentUserName={userName} />
        </div>
      </div>
    </div>
  );
}

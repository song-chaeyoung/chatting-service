import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, Message } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useNotifications } from "./useNotifications";

interface UseRealtimeChatProps {
  roomId: string;
  userName: string;
}

export function useRealtimeChat({ roomId, userName }: UseRealtimeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected"
  >("connecting");

  const channelRef = useRef<RealtimeChannel | null>(null);
  const { showNotification } = useNotifications();

  // 초기 메시지 로드 (한 번만)
  const loadInitialMessages = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("messages")
        .select(
          `
          *,
          users!messages_user_id_fkey(name)
        `
        )
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (data) {
        const formattedMessages = data.map((msg) => ({
          ...msg,
          user_name: msg.users?.name || "알 수 없는 사용자",
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("초기 메시지 로드 실패:", error);
      setConnectionStatus("disconnected");
    }
  }, [roomId]);

  const setupRealtimeSubscription = useCallback(() => {
    try {
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      console.log(`🔄 실시간 연결 시도: room ${roomId}`);
      console.log("채널 이름 ", `messages-${roomId}`);
      console.log("필터 ", `room_id=eq.${roomId}`);

      const channel = supabase
        .channel(`messages-${roomId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `room_id=eq.${roomId}`,
          },
          async (payload) => {
            console.log("📨 새 메시지 수신:", payload.new);

            // 사용자 정보 가져오기
            const { data: userData } = await supabase
              .from("users")
              .select("name")
              .eq("id", payload.new.user_id)
              .single();

            const formattedMessage = {
              id: payload.new.id,
              room_id: payload.new.room_id,
              user_id: payload.new.user_id,
              content: payload.new.content,
              created_at: payload.new.created_at,
              user_name: userData?.name || "알 수 없는 사용자",
            };

            setMessages((prev) => {
              // 중복 메시지 방지
              if (prev.some((msg) => msg.id === formattedMessage.id)) {
                return prev;
              }

              // 다른 사용자의 메시지인 경우에만 알림 표시
              if (formattedMessage.user_name !== userName) {
                showNotification({
                  title: `새 메시지 - ${formattedMessage.user_name}`,
                  body:
                    formattedMessage.content.length > 50
                      ? `${formattedMessage.content.substring(0, 50)}...`
                      : formattedMessage.content,
                  tag: `message-${roomId}`,
                });
              }

              return [...prev, formattedMessage];
            });
          }
        )
        .subscribe((status) => {
          console.log(`🔗 연결 상태 변경: ${status}`);

          if (status === "SUBSCRIBED") {
            setConnectionStatus("connected");
            channelRef.current = channel;
            console.log("✅ 실시간 연결 성공");
          } else if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED"
          ) {
            setConnectionStatus("disconnected");
            console.log("❌ 실시간 연결 실패");
          }
        });
    } catch (error) {
      console.error("실시간 구독 설정 실패:", error);
      setConnectionStatus("disconnected");
    }
  }, [roomId, userName, showNotification]);

  useEffect(() => {
    console.log(`🚀 채팅 초기화: room ${roomId}, user ${userName}`);

    // 초기 메시지 로드
    loadInitialMessages();

    // 실시간 구독 설정
    setupRealtimeSubscription();

    return () => {
      console.log(`🧹 채팅 정리: room ${roomId}`);

      // 채널 정리
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
        } catch (error) {
          console.error("채널 구독 해제 실패:", error);
        }
        channelRef.current = null;
      }
    };
  }, [roomId, userName]);

  return {
    messages,
    connectionStatus,
    // 수동 새로고침용 (필요시)
    refreshMessages: loadInitialMessages,
  };
}

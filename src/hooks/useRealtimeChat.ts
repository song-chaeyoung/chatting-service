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
        .channel(`messages-${roomId}`, {
          config: {
            broadcast: { self: true }, // 자신의 broadcast도 받도록 설정
          },
        })
        .on("broadcast", { event: "message" }, (payload) => {
          console.log("📨 broadcast 메시지 수신:", payload.payload);

          const formattedMessage = {
            id: payload.payload.id,
            room_id: payload.payload.room_id,
            user_id: payload.payload.user_id,
            content: payload.payload.content,
            created_at: payload.payload.created_at,
            user_name: payload.payload.user_name,
          };

          setMessages((prev) => {
            // 중복 메시지 방지
            if (prev.some((msg) => msg.id === formattedMessage.id)) {
              return prev;
            }

            // 다른 사용자의 메시지인 경우에만 알림 표시 (내 메시지는 알림 X)
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
        })
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

  // broadcast 메시지 전송 함수 추가
  const sendBroadcastMessage = useCallback((message: any) => {
    if (channelRef.current) {
      console.log("📤 broadcast 메시지 전송:", message);
      channelRef.current.send({
        type: "broadcast",
        event: "message",
        payload: message,
      });
    }
  }, []);

  // 로컬 메시지 즉시 추가 함수
  const addLocalMessage = useCallback((message: Message) => {
    setMessages((prev) => {
      // 중복 메시지 방지
      if (prev.some((msg) => msg.id === message.id)) {
        return prev;
      }
      return [...prev, message];
    });
  }, []);

  return {
    messages,
    connectionStatus,
    sendBroadcastMessage,
    // 수동 새로고침용 (필요시)
    refreshMessages: loadInitialMessages,
  };
}

import { useState, useEffect, useRef, useCallback } from "react";
import { supabase, Message } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface UseRealtimeChatProps {
  roomId: string;
  userName: string;
}

export function useRealtimeChat({ roomId, userName }: UseRealtimeChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "disconnected" | "polling"
  >("connecting");

  const channelRef = useRef<RealtimeChannel | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = useCallback(async () => {
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
  }, [roomId]);

  const startPollingMode = useCallback(() => {
    // 기존 폴링 정리
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // 즉시 한 번 실행
    fetchMessages();

    // 1초마다 모든 메시지 다시 가져오기
    pollingIntervalRef.current = setInterval(async () => {
      await fetchMessages();
    }, 1000);
  }, [fetchMessages]);

  const setupRealtimeSubscription = useCallback(() => {
    try {
      // 기존 채널 정리
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      // 가장 기본적인 형태: 단순한 채널명, filter 없음
      const channel = supabase
        .channel("messages")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          async (payload) => {
            // 해당 방의 메시지인지 확인
            if (payload.new.room_id !== roomId) {
              return;
            }

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
              return [...prev, formattedMessage];
            });
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setConnectionStatus("connected");
            channelRef.current = channel;
          } else if (status === "CHANNEL_ERROR") {
            setConnectionStatus("polling");
            startPollingMode();
          }
        });
    } catch {
      setConnectionStatus("polling");
      startPollingMode();
    }
  }, [roomId, startPollingMode]);

  useEffect(() => {
    // 일단 폴링 모드로 바로 시작
    setConnectionStatus("polling");
    startPollingMode();

    // Realtime도 시도해보기
    setupRealtimeSubscription();

    return () => {
      // 정리
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
        } catch {
          // 무시
        }
      }

      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [roomId, userName, setupRealtimeSubscription, startPollingMode]);

  return {
    messages,
    connectionStatus,
    fetchMessages,
  };
}

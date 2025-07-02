import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { RealtimeChannel } from "@supabase/supabase-js";

interface Member {
  id: string;
  name: string;
  joinedAt: string;
  lastAccessedAt: string;
}

interface OnlineUser {
  user_id: string;
  user_name: string;
  joined_at: string;
}

interface Subscriber {
  setMembers: (members: Member[]) => void;
  setOnlineUsers: (users: OnlineUser[]) => void;
  setIsLoading: (loading: boolean) => void;
}

// 전역 상태로 관리하여 여러 컴포넌트에서 같은 데이터 공유
interface SubscriptionData {
  members: Member[];
  onlineUsers: OnlineUser[];
  subscribers: Set<Subscriber>;
  subscription: RealtimeChannel | null;
}

const memberSubscriptions = new Map<string, SubscriptionData>();

export function useMemberSubscription(roomId: string, currentUserName: string) {
  const [members, setMembers] = useState<Member[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!roomId || !currentUserName) return;

    const subscriptionKey = `room_members_${roomId}`;

    // 이미 해당 방에 대한 구독이 있는지 확인
    if (memberSubscriptions.has(subscriptionKey)) {
      const existingSubscription = memberSubscriptions.get(subscriptionKey);

      if (existingSubscription) {
        // 기존 구독의 상태를 현재 컴포넌트로 동기화
        setMembers(existingSubscription.members);
        setOnlineUsers(existingSubscription.onlineUsers);
        setIsLoading(false);

        // 현재 컴포넌트를 구독자로 등록
        const subscriber: Subscriber = {
          setMembers,
          setOnlineUsers,
          setIsLoading,
        };
        existingSubscription.subscribers.add(subscriber);

        return () => {
          // 컴포넌트 언마운트 시 구독자에서 제거
          existingSubscription.subscribers.delete(subscriber);
        };
      }
    }

    // 새로운 구독 생성
    const subscriptionData: SubscriptionData = {
      members: [],
      onlineUsers: [],
      subscribers: new Set([{ setMembers, setOnlineUsers, setIsLoading }]),
      subscription: null,
    };

    memberSubscriptions.set(subscriptionKey, subscriptionData);

    const fetchMembers = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/members`);
        const data = await response.json();

        if (response.ok) {
          const newMembers = data.members;
          subscriptionData.members = newMembers;

          // 모든 구독자에게 업데이트 전파
          subscriptionData.subscribers.forEach((subscriber: Subscriber) => {
            subscriber.setMembers(newMembers);
            subscriber.setIsLoading(false);
          });
        } else {
          console.error("❌ Error fetching members:", data.error);
        }
      } catch (error) {
        console.error("❌ Error fetching members:", error);
      } finally {
        subscriptionData.subscribers.forEach((subscriber: Subscriber) => {
          subscriber.setIsLoading(false);
        });
      }
    };

    fetchMembers();

    console.log("roomId", roomId);

    const subscription = supabase
      .channel(subscriptionKey)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_members",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          console.log("테이블 변경 감지");
          fetchMembers();
        }
      )
      .on("presence", { event: "sync" }, () => {
        const state = subscription.presenceState();

        console.log("state", state);

        const onlineList: OnlineUser[] = [];
        Object.keys(state).forEach((userId) => {
          const presences = state[userId];
          if (presences && presences.length > 0) {
            const presence = presences[0] as {
              presence_ref: string;
            } & OnlineUser;
            if (presence.user_id && presence.user_name) {
              onlineList.push({
                user_id: presence.user_id,
                user_name: presence.user_name,
                joined_at: presence.joined_at,
              });
            }
          }
        });

        subscriptionData.onlineUsers = onlineList;

        // 모든 구독자에게 온라인 사용자 업데이트 전파
        subscriptionData.subscribers.forEach((subscriber: Subscriber) => {
          subscriber.setOnlineUsers(onlineList);
        });
      })
      .subscribe(async (status) => {
        console.log("status", status);
        if (status === "SUBSCRIBED") {
          const presencePayload = {
            user_id: currentUserName,
            user_name: currentUserName,
            joined_at: new Date().toISOString(),
          };

          console.log("presencePayload", presencePayload);

          await subscription.track(presencePayload);
        }
      });

    subscriptionData.subscription = subscription;

    return () => {
      const subscriber: Subscriber = {
        setMembers,
        setOnlineUsers,
        setIsLoading,
      };
      subscriptionData.subscribers.delete(subscriber);

      // 마지막 구독자가 제거되면 구독 해제
      if (subscriptionData.subscribers.size === 0) {
        subscription.unsubscribe();
        memberSubscriptions.delete(subscriptionKey);
      }
    };
  }, [roomId, currentUserName]);

  return {
    members,
    onlineUsers,
    isLoading,
  };
}

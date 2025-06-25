import { useEffect, useState } from "react";

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

export function useNotifications() {
  const [permission, setPermission] =
    useState<NotificationPermission>("default");
  const [isTabVisible, setIsTabVisible] = useState(true);

  // 권한 요청
  const requestPermission = async (): Promise<NotificationPermission> => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return "denied";
  };

  // 알림 표시
  const showNotification = (options: NotificationOptions) => {
    // 브라우저가 Notification API를 지원하지 않으면 리턴
    if (!("Notification" in window)) return;

    // 권한이 허용되지 않았으면 알림 표시하지 않음
    if (permission !== "granted") return;

    // 탭이 활성화되어 있으면 알림 표시하지 않음
    if (isTabVisible) return;

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || "/favicon.ico",
      tag: options.tag,
      requireInteraction: false,
      silent: false,
    });

    // 알림 클릭 시 탭으로 포커스 이동
    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // 3초 후 자동으로 알림 닫기
    setTimeout(() => {
      notification.close();
    }, 1000);

    return notification;
  };

  // 탭 활성화 상태 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(!document.hidden);
    };

    // 초기 상태 설정
    setIsTabVisible(!document.hidden);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // 초기 권한 상태 확인
  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  return {
    permission,
    isTabVisible,
    requestPermission,
    showNotification,
    isSupported: "Notification" in window,
  };
}

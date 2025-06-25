import { useNotifications } from "@/hooks/useNotifications";

export default function NotificationPermission() {
  const { permission, requestPermission, isSupported } = useNotifications();

  // 권한이 이미 허용된 경우 간단한 상태 표시
  if (permission === "granted") {
    return;
  }

  // 브라우저가 지원하지 않는 경우
  if (!isSupported) {
    return null;
  }

  // 사용자가 거부한 경우
  if (permission === "denied") {
    return (
      <div
        className="px-4 py-3 mb-4 rounded-lg border"
        style={{
          backgroundColor: `rgb(var(--bg-secondary))`,
          borderColor: `rgb(var(--border-color))`,
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-medium"
              style={{ color: `rgb(var(--text-primary))` }}
            >
              알림이 차단되었습니다
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: `rgb(var(--text-secondary))` }}
            >
              브라우저 설정에서 알림을 허용해주세요
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 권한 요청 필요
  return (
    <div
      className="px-4 py-3 mb-4 rounded-lg border"
      style={{
        backgroundColor: `rgb(var(--bg-secondary))`,
        borderColor: `rgb(var(--border-color))`,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-5 5v-5zM4 5h16a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <p
              className="text-sm font-medium"
              style={{ color: `rgb(var(--text-primary))` }}
            >
              새 메시지 알림
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: `rgb(var(--text-secondary))` }}
            >
              새 메시지가 도착하면 알림을 받으세요
            </p>
          </div>
        </div>
        <button
          onClick={requestPermission}
          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
        >
          허용하기
        </button>
      </div>
    </div>
  );
}

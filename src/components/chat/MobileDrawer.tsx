import MobileUserSection from "./MobileUserSection";
import MobileChatList from "./MobileChatList";
import MobileMemberList from "./MobileMemberList";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: "chat" | "home";
  userName: string;
  // 채팅방용 props
  roomId?: string;
  // 홈용 props
  onUserNameChange?: (name: string) => void;
  onCreateRoom?: (name: string, isPrivate: boolean, password?: string) => void;
}

// 홈 드로어 내용 컴포넌트
function HomeDrawerContent({
  userName,
  onUserNameChange,
}: {
  userName: string;
  onUserNameChange?: (name: string) => void;
}) {
  return (
    <>
      {/* 사용자 정보 섹션 */}
      <div className="p-4">
        <h3
          className="text-sm font-medium mb-3"
          style={{ color: `rgb(var(--text-secondary))` }}
        >
          👤 사용자 정보
        </h3>
        <MobileUserSection
          userName={userName}
          onUserNameChange={onUserNameChange}
        />
      </div>

      {/* 구분선 */}
      <div
        className="mx-4 border-t"
        style={{ borderColor: `rgb(var(--border-color))` }}
      />

      {/* 내 채팅방 목록 섹션 */}
      <div className="p-4">
        <h3
          className="text-sm font-medium mb-3"
          style={{ color: `rgb(var(--text-secondary))` }}
        >
          🏠 내 채팅방
        </h3>
        <MobileChatList userName={userName} />
      </div>
    </>
  );
}

// 채팅방 드로어 내용 컴포넌트
function ChatDrawerContent({
  roomId,
  userName,
}: {
  roomId: string;
  userName: string;
}) {
  return (
    <>
      {/* 채팅방 목록 섹션 */}
      <div className="p-4">
        <h3
          className="text-sm font-medium mb-3"
          style={{ color: `rgb(var(--text-secondary))` }}
        >
          🏠 내 채팅방 목록
        </h3>
        <MobileChatList currentRoomId={roomId} userName={userName} />
      </div>

      {/* 구분선 */}
      <div
        className="mx-4 border-t"
        style={{ borderColor: `rgb(var(--border-color))` }}
      />

      {/* 현재 방 멤버 섹션 */}
      <div className="p-4">
        <MobileMemberList roomId={roomId} currentUserName={userName} />
      </div>
    </>
  );
}

export default function MobileDrawer({
  isOpen,
  onClose,
  type,
  userName,
  roomId,
  onUserNameChange,
}: MobileDrawerProps) {
  return (
    <>
      {/* 드로어 오버레이 */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onClose}
        />
      )}

      {/* 드로어 */}
      <div
        className={`md:hidden fixed top-0 right-0 h-full w-80 max-w-[85vw] transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ backgroundColor: `rgb(var(--bg-primary))` }}
      >
        <div className="h-full flex flex-col">
          {/* 드로어 헤더 */}
          <div
            className="flex items-center justify-between p-4 border-b"
            style={{ borderColor: `rgb(var(--border-color))` }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: `rgb(var(--text-primary))` }}
            >
              메뉴
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:opacity-70 transition-opacity"
              style={{ color: `rgb(var(--text-muted))` }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* 드로어 내용 - 타입에 따른 분기 처리 */}
          <div className="flex-1 overflow-y-auto">
            {type === "home" ? (
              <HomeDrawerContent
                userName={userName}
                onUserNameChange={onUserNameChange}
              />
            ) : (
              <ChatDrawerContent roomId={roomId!} userName={userName} />
            )}
          </div>

          {/* 드로어 하단 */}
          <div
            className="p-4 border-t"
            style={{ borderColor: `rgb(var(--border-color))` }}
          >
            <div
              className="text-sm"
              style={{ color: `rgb(var(--text-secondary))` }}
            >
              {userName}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

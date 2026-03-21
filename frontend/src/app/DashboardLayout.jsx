// ─────────────────────────────────────────────────────────────
// DashboardLayout  —  src/app/DashboardLayout.jsx
// Master shell. The old layout sidebar was deleted, so we now
// delegate layout to ChatbotPage which contains the new universal
// sliding ChatSidebar.
// ─────────────────────────────────────────────────────────────
import ChatbotPage from '../features/chatbot/page';

export default function DashboardLayout() {
  return (
    // Crucial: h-screen + overflow-hidden = page NEVER scrolls globally
    <div className="h-screen w-full flex overflow-hidden">
      <ChatbotPage />
    </div>
  );
}

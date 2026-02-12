import SwiftUI

struct MainTabView: View {
    let user: User
    let onLogout: () -> Void
    @State private var unreadMessageCount = 0
    @State private var pollTimer: Timer?
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView(user: user, onLogout: onLogout)
                .tabItem {
                    Label("Anasayfa", systemImage: "house.fill")
                }
                .tag(0)

            ConversationsView(currentUserId: user.id)
                .tabItem {
                    Label("Sohbet", systemImage: "bubble.left.and.bubble.right.fill")
                }
                .tag(1)
                .badge(unreadMessageCount)
        }
        .tint(Color(red: 0.2, green: 0.7, blue: 0.5))
        .task {
            await fetchUnreadCount()
        }
        .onAppear {
            pollTimer = Timer.scheduledTimer(withTimeInterval: 10, repeats: true) { _ in
                Task { await fetchUnreadCount() }
            }
        }
        .onDisappear {
            pollTimer?.invalidate()
            pollTimer = nil
        }
        .onChange(of: selectedTab) { _, newTab in
            if newTab == 1 {
                unreadMessageCount = 0
            }
        }
    }

    private func fetchUnreadCount() async {
        guard selectedTab != 1 else { return }
        do {
            let count = try await MessageService.getUnreadCount()
            await MainActor.run { unreadMessageCount = count }
        } catch {}
    }
}

import SwiftUI
import UIKit

struct MainTabView: View {
    let user: User
    let onLogout: () -> Void
    @State private var unreadMessageCount = 0
    @State private var pollTimer: Timer?
    @State private var selectedTab = 0

    init(user: User, onLogout: @escaping () -> Void) {
        self.user = user
        self.onLogout = onLogout

        // Global tab bar appearance
        let tabAppearance = UITabBarAppearance()
        tabAppearance.configureWithTransparentBackground()
        tabAppearance.backgroundColor = UIColor(white: 1, alpha: 0.05)
        let normalAttrs: [NSAttributedString.Key: Any] = [.foregroundColor: UIColor.white.withAlphaComponent(0.5)]
        let selectedAttrs: [NSAttributedString.Key: Any] = [.foregroundColor: UIColor(AppTheme.accent)]
        tabAppearance.stackedLayoutAppearance.normal.iconColor = .white.withAlphaComponent(0.5)
        tabAppearance.stackedLayoutAppearance.normal.titleTextAttributes = normalAttrs
        tabAppearance.stackedLayoutAppearance.selected.iconColor = UIColor(AppTheme.accent)
        tabAppearance.stackedLayoutAppearance.selected.titleTextAttributes = selectedAttrs
        UITabBar.appearance().standardAppearance = tabAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabAppearance

        // Global navigation bar appearance
        let navAppearance = UINavigationBarAppearance()
        navAppearance.configureWithTransparentBackground()
        navAppearance.titleTextAttributes = [.foregroundColor: UIColor.white]
        navAppearance.largeTitleTextAttributes = [.foregroundColor: UIColor.white]
        UINavigationBar.appearance().standardAppearance = navAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navAppearance
        UINavigationBar.appearance().compactAppearance = navAppearance
        UINavigationBar.appearance().tintColor = .white
    }

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
        .tint(AppTheme.accent)
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

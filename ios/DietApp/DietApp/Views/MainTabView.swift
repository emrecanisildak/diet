import SwiftUI

struct MainTabView: View {
    let user: User
    let onLogout: () -> Void

    var body: some View {
        TabView {
            HomeView(user: user, onLogout: onLogout)
                .tabItem {
                    Label("Anasayfa", systemImage: "house.fill")
                }

            ConversationsView(currentUserId: user.id)
                .tabItem {
                    Label("Sohbet", systemImage: "bubble.left.and.bubble.right.fill")
                }

            NotificationsView()
                .tabItem {
                    Label("Bildirimler", systemImage: "bell.fill")
                }
        }
        .tint(Color(red: 0.2, green: 0.7, blue: 0.5))
    }
}

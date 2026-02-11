import SwiftUI

struct MainTabView: View {
    let user: User
    let onLogout: () -> Void

    var body: some View {
        TabView {
            ProfileView(user: user)
                .tabItem {
                    Label("Profil", systemImage: "person.fill")
                }

            ConversationsView(currentUserId: user.id)
                .tabItem {
                    Label("Sohbet", systemImage: "bubble.left.and.bubble.right.fill")
                }

            NotificationsView()
                .tabItem {
                    Label("Bildirimler", systemImage: "bell.fill")
                }

            settingsView
                .tabItem {
                    Label("Ayarlar", systemImage: "gearshape.fill")
                }
        }
        .tint(Color(red: 0.2, green: 0.7, blue: 0.5))
    }

    private var settingsView: some View {
        NavigationStack {
            List {
                Section {
                    HStack {
                        Image(systemName: "person.circle.fill")
                            .font(.title)
                            .foregroundStyle(Color(red: 0.2, green: 0.7, blue: 0.5))
                        VStack(alignment: .leading) {
                            Text(user.fullName)
                                .font(.headline)
                            Text(user.email)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }

                Section {
                    if let phone = user.phone {
                        Label(phone, systemImage: "phone.fill")
                    }
                    Label(user.role == "client" ? "Danışan" : "Diyetisyen", systemImage: "tag.fill")
                }

                Section {
                    Button(role: .destructive) {
                        onLogout()
                    } label: {
                        Label("Çıkış Yap", systemImage: "rectangle.portrait.and.arrow.right")
                    }
                }
            }
            .navigationTitle("Ayarlar")
        }
    }
}

import SwiftUI

struct ProfileDetailView: View {
    let user: User
    let onLogout: () -> Void
    @State private var viewModel = ProfileViewModel()

    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Avatar section
                VStack(spacing: 12) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 64))
                        .foregroundStyle(.white)
                        .background(
                            Circle()
                                .stroke(
                                    LinearGradient(colors: [AppTheme.accent, AppTheme.accentDark], startPoint: .topLeading, endPoint: .bottomTrailing),
                                    lineWidth: 3
                                )
                                .frame(width: 80, height: 80)
                        )

                    Text(user.fullName)
                        .font(.title2.bold())
                        .foregroundStyle(.white)

                    if let weight = viewModel.currentWeight {
                        HStack(spacing: 4) {
                            Image(systemName: "scalemass.fill")
                                .foregroundStyle(.white.opacity(0.7))
                            Text("\(weight, specifier: "%.1f") kg")
                                .font(.title3.bold())
                                .foregroundStyle(AppTheme.accent)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(AppTheme.accent.opacity(0.15))
                        .clipShape(Capsule())
                        .overlay(Capsule().stroke(.white.opacity(0.1), lineWidth: 1))
                    }

                    if let plan = viewModel.activePlan {
                        Text(plan.title)
                            .font(.subheadline)
                            .foregroundStyle(.white.opacity(0.7))
                    }
                }
                .padding(.vertical, 8)

                // Info card
                VStack(spacing: 16) {
                    ProfileInfoRow(icon: "envelope.fill", text: user.email)
                    if let phone = user.phone {
                        Divider().overlay(.white.opacity(0.1))
                        ProfileInfoRow(icon: "phone.fill", text: phone)
                    }
                    Divider().overlay(.white.opacity(0.1))
                    ProfileInfoRow(icon: "tag.fill", text: user.role == "client" ? "Danışan" : "Diyetisyen")
                }
                .padding()
                .glassCard()

                // Logout button
                Button(role: .destructive) {
                    onLogout()
                } label: {
                    HStack {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                        Text("Çıkış Yap")
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(.red.opacity(0.15))
                    .foregroundStyle(.red)
                    .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadius))
                    .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadius).stroke(.red.opacity(0.3), lineWidth: 1))
                }
            }
            .padding()
        }
        .background(AppTheme.backgroundGradient.ignoresSafeArea())
        .navigationTitle("Profil")
        .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
        .task {
            await viewModel.loadData()
        }
    }
}

struct ProfileInfoRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(AppTheme.accent)
                .frame(width: 24)
            Text(text)
                .foregroundStyle(.white)
            Spacer()
        }
    }
}

import SwiftUI

struct ProfileDetailView: View {
    let user: User
    let onLogout: () -> Void
    @State private var viewModel = ProfileViewModel()

    var body: some View {
        List {
            Section {
                VStack(spacing: 12) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 64))
                        .foregroundStyle(Color(red: 0.2, green: 0.7, blue: 0.5))

                    Text(user.fullName)
                        .font(.title2.bold())

                    if let weight = viewModel.currentWeight {
                        HStack(spacing: 4) {
                            Image(systemName: "scalemass.fill")
                                .foregroundStyle(.secondary)
                            Text("\(weight, specifier: "%.1f") kg")
                                .font(.title3.bold())
                                .foregroundStyle(Color(red: 0.2, green: 0.7, blue: 0.5))
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(Color(red: 0.2, green: 0.7, blue: 0.5).opacity(0.1))
                        .clipShape(Capsule())
                    }

                    if let plan = viewModel.activePlan {
                        Text(plan.title)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 8)
            }

            Section {
                Label(user.email, systemImage: "envelope.fill")
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
        .navigationTitle("Profil")
        .task {
            await viewModel.loadData()
        }
    }
}

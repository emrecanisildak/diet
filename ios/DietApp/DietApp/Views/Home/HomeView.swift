import SwiftUI

struct HomeView: View {
    let user: User
    let onLogout: () -> Void
    @State private var viewModel = ProfileViewModel()
    @State private var notificationsVM = NotificationsViewModel()
    @State private var showWeightSheet = false

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let name = user.fullName.components(separatedBy: " ").first ?? user.fullName
        switch hour {
        case 6..<12: return "Günaydın, \(name)"
        case 12..<18: return "İyi günler, \(name)"
        case 18..<23: return "İyi akşamlar, \(name)"
        default: return "İyi geceler, \(name)"
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(greeting)
                                .font(.title2.bold())
                                .foregroundStyle(.white)
                            Text("Bugün nasıl hissediyorsun?")
                                .font(.subheadline)
                                .foregroundStyle(.white.opacity(0.7))
                        }
                        Spacer()
                    }
                    .padding(.horizontal)

                    MealListView(meals: viewModel.sortedMeals)
                        .padding(.horizontal)

                    if !viewModel.upcomingAppointments.isEmpty {
                        upcomingAppointmentsCard
                            .padding(.horizontal)
                    }

                    weightEntryButton
                        .padding(.horizontal)

                    WeightChartView(weightLogs: viewModel.weightLogs)
                        .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .background(AppTheme.backgroundGradient.ignoresSafeArea())
            .navigationTitle("")
            .toolbarBackground(.hidden, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    NavigationLink {
                        ProfileDetailView(user: user, onLogout: onLogout)
                    } label: {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 20))
                            .foregroundStyle(.white.opacity(0.9))
                    }
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    NavigationLink {
                        NotificationsView()
                    } label: {
                        HStack(spacing: 2) {
                            Image(systemName: notificationsVM.unreadCount > 0 ? "bell.badge.fill" : "bell.fill")
                                .font(.system(size: 20))
                                .foregroundStyle(.white.opacity(0.9))
                            if notificationsVM.unreadCount > 0 {
                                Text("\(notificationsVM.unreadCount)")
                                    .font(.system(size: 12, weight: .bold))
                                    .foregroundStyle(.white)
                                    .frame(minWidth: 20, minHeight: 20)
                                    .background(Color.red)
                                    .clipShape(Circle())
                            }
                        }
                    }
                }
            }
            .sheet(isPresented: $showWeightSheet) {
                WeightLogSheet { weight, note in
                    await viewModel.addWeight(weight: weight, note: note)
                }
                .presentationDetents([.medium])
            }
            .refreshable {
                await viewModel.loadData()
                await notificationsVM.loadNotifications()
            }
            .task {
                await viewModel.loadData()
                await notificationsVM.loadNotifications()
            }
        }
    }

    @ViewBuilder
    private var weightEntryButton: some View {
        if viewModel.hasLoggedToday {
            HStack(spacing: 12) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.title3)
                    .foregroundStyle(.white)
                    .frame(width: 40, height: 40)
                    .background(AppTheme.accent)
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: 2) {
                    Text("Bugünkü kilo girildi")
                        .font(.headline)
                        .foregroundStyle(.white)
                    if let weight = viewModel.currentWeight {
                        Text("\(weight, specifier: "%.1f") kg")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.7))
                    }
                }

                Spacer()

                Image(systemName: "checkmark")
                    .font(.body.bold())
                    .foregroundStyle(AppTheme.accent)
            }
            .padding()
            .glassCard()
        } else {
            Button {
                showWeightSheet = true
            } label: {
                HStack(spacing: 12) {
                    Image(systemName: "scalemass.fill")
                        .font(.title3)
                        .foregroundStyle(.white)
                        .frame(width: 40, height: 40)
                        .background(AppTheme.accent)
                        .clipShape(Circle())

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Kilo Gir")
                            .font(.headline)
                            .foregroundStyle(.white)
                        if let weight = viewModel.currentWeight {
                            Text("Güncel: \(weight, specifier: "%.1f") kg")
                                .font(.caption)
                                .foregroundStyle(.white.opacity(0.7))
                        }
                    }

                    Spacer()

                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                        .foregroundStyle(AppTheme.accent)
                }
                .padding()
                .glassCard()
            }
            .buttonStyle(.plain)
        }
    }

    private var upcomingAppointmentsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Yaklaşan Randevular", systemImage: "calendar.badge.clock")
                .font(.headline)
                .foregroundStyle(AppTheme.accent)

            ForEach(viewModel.upcomingAppointments) { appt in
                HStack(spacing: 12) {
                    VStack(spacing: 2) {
                        if let days = appt.daysUntil {
                            Text(days == 0 ? "Bugün" : "\(days)")
                                .font(.title3.bold())
                                .foregroundStyle(days == 0 ? .red : AppTheme.accent)
                            if days > 0 {
                                Text("gün")
                                    .font(.caption2)
                                    .foregroundStyle(.white.opacity(0.6))
                            }
                        }
                    }
                    .frame(width: 48, height: 48)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(AppTheme.accent.opacity(0.15))
                    )

                    VStack(alignment: .leading, spacing: 4) {
                        Text(appt.title)
                            .font(.subheadline.bold())
                            .foregroundStyle(.white)
                        Text(formatAppointmentDate(appt.dateTime))
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.6))
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.4))
                }
                .padding(.vertical, 4)

                if appt.id != viewModel.upcomingAppointments.last?.id {
                    Divider().overlay(.white.opacity(0.1))
                }
            }
        }
        .padding()
        .glassCard()
    }

    private func formatAppointmentDate(_ isoString: String) -> String {
        let df = DateFormatter()
        df.locale = Locale(identifier: "en_US_POSIX")
        df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS"
        var date = df.date(from: isoString)
        if date == nil {
            df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
            date = df.date(from: isoString)
        }
        guard let date else { return "" }

        let display = DateFormatter()
        display.dateFormat = "d MMMM yyyy, HH:mm"
        display.locale = Locale(identifier: "tr_TR")
        return display.string(from: date)
    }
}

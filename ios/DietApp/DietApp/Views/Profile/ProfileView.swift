import SwiftUI

struct ProfileView: View {
    let user: User
    @State private var viewModel = ProfileViewModel()
    @State private var showWeightSheet = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Kullanıcı kartı
                    userCard

                    // Yaklaşan randevular
                    if !viewModel.upcomingAppointments.isEmpty {
                        upcomingAppointmentsCard
                            .padding(.horizontal)
                    }

                    // Kilo grafiği
                    WeightChartView(weightLogs: viewModel.weightLogs)
                        .padding(.horizontal)

                    // Öğün listesi
                    MealListView(meals: viewModel.sortedMeals)
                        .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Profil")
            .toolbar {
                ToolbarItem(placement: .primaryAction) {
                    Button {
                        showWeightSheet = true
                    } label: {
                        Image(systemName: "plus.circle.fill")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showWeightSheet) {
                WeightLogSheet { weight, note in
                    Task { await viewModel.addWeight(weight: weight, note: note) }
                }
                .presentationDetents([.medium])
            }
            .refreshable {
                await viewModel.loadData()
            }
            .task {
                await viewModel.loadData()
            }
        }
    }

    private var userCard: some View {
        VStack(spacing: 12) {
            // Avatar
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
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 8, y: 4)
        .padding(.horizontal)
    }

    private var upcomingAppointmentsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Yaklaşan Randevular", systemImage: "calendar.badge.clock")
                .font(.headline)
                .foregroundStyle(Color(red: 0.2, green: 0.7, blue: 0.5))

            ForEach(viewModel.upcomingAppointments) { appt in
                HStack(spacing: 12) {
                    // Gün sayacı
                    VStack(spacing: 2) {
                        if let days = appt.daysUntil {
                            Text(days == 0 ? "Bugün" : "\(days)")
                                .font(.title3.bold())
                                .foregroundStyle(days == 0 ? .red : Color(red: 0.2, green: 0.7, blue: 0.5))
                            if days > 0 {
                                Text("gün")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                    .frame(width: 48, height: 48)
                    .background(
                        RoundedRectangle(cornerRadius: 10)
                            .fill(Color(red: 0.2, green: 0.7, blue: 0.5).opacity(0.1))
                    )

                    VStack(alignment: .leading, spacing: 4) {
                        Text(appt.title)
                            .font(.subheadline.bold())
                        Text(formatAppointmentDate(appt.dateTime))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    Spacer()

                    Image(systemName: "chevron.right")
                        .font(.caption)
                        .foregroundStyle(.tertiary)
                }
                .padding(.vertical, 4)

                if appt.id != viewModel.upcomingAppointments.last?.id {
                    Divider()
                }
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 8, y: 4)
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

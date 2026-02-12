import SwiftUI

struct HomeView: View {
    let user: User
    let onLogout: () -> Void
    @State private var viewModel = ProfileViewModel()
    @State private var showWeightSheet = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Öğün planı
                    MealListView(meals: viewModel.sortedMeals)
                        .padding(.horizontal)

                    // Yaklaşan randevular
                    if !viewModel.upcomingAppointments.isEmpty {
                        upcomingAppointmentsCard
                            .padding(.horizontal)
                    }

                    // Kilo gir butonu
                    weightEntryButton
                        .padding(.horizontal)

                    // Kilo grafiği
                    WeightChartView(weightLogs: viewModel.weightLogs)
                        .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Anasayfa")
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    NavigationLink {
                        ProfileDetailView(user: user, onLogout: onLogout)
                    } label: {
                        Image(systemName: "person.circle.fill")
                            .font(.title3)
                            .foregroundStyle(Color(red: 0.2, green: 0.7, blue: 0.5))
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

    private var weightEntryButton: some View {
        Button {
            showWeightSheet = true
        } label: {
            HStack(spacing: 12) {
                Image(systemName: "scalemass.fill")
                    .font(.title3)
                    .foregroundStyle(.white)
                    .frame(width: 40, height: 40)
                    .background(Color(red: 0.2, green: 0.7, blue: 0.5))
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: 2) {
                    Text("Kilo Gir")
                        .font(.headline)
                        .foregroundStyle(.primary)
                    if let weight = viewModel.currentWeight {
                        Text("Güncel: \(weight, specifier: "%.1f") kg")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                Image(systemName: "plus.circle.fill")
                    .font(.title2)
                    .foregroundStyle(Color(red: 0.2, green: 0.7, blue: 0.5))
            }
            .padding()
            .background(Color(.systemBackground))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .shadow(color: .black.opacity(0.05), radius: 8, y: 4)
        }
        .buttonStyle(.plain)
    }

    private var upcomingAppointmentsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Yaklaşan Randevular", systemImage: "calendar.badge.clock")
                .font(.headline)
                .foregroundStyle(Color(red: 0.2, green: 0.7, blue: 0.5))

            ForEach(viewModel.upcomingAppointments) { appt in
                HStack(spacing: 12) {
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

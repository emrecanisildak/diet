import SwiftUI

struct NotificationsView: View {
    @State private var viewModel = NotificationsViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.notifications.isEmpty {
                    ProgressView("Yükleniyor...")
                } else if viewModel.notifications.isEmpty {
                    ContentUnavailableView(
                        "Bildirim Yok",
                        systemImage: "bell.slash",
                        description: Text("Henüz bir bildiriminiz bulunmuyor")
                    )
                } else {
                    List(viewModel.notifications) { notification in
                        NotificationRow(notification: notification)
                            .onTapGesture {
                                if !notification.isRead {
                                    Task {
                                        await viewModel.markAsRead(notification.id)
                                    }
                                }
                            }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Bildirimler")
            .refreshable {
                await viewModel.loadNotifications()
            }
            .task {
                await viewModel.loadNotifications()
                if viewModel.unreadCount > 0 {
                    await viewModel.markAllAsRead()
                }
            }
        }
    }
}

struct NotificationRow: View {
    let notification: AppNotification

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: notification.isRead ? "bell" : "bell.badge.fill")
                .font(.title3)
                .foregroundStyle(notification.isRead ? .secondary : Color(red: 0.2, green: 0.7, blue: 0.5))
                .frame(width: 32)

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(notification.title)
                        .font(notification.isRead ? .subheadline : .subheadline.bold())

                    Spacer()

                    Text(formatDate(notification.createdAt))
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }

                Text(notification.content)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(2)
            }

            if !notification.isRead {
                Circle()
                    .fill(Color(red: 0.2, green: 0.7, blue: 0.5))
                    .frame(width: 8, height: 8)
            }
        }
        .padding(.vertical, 4)
    }

    private func formatDate(_ isoString: String) -> String {
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
        if Calendar.current.isDateInToday(date) {
            display.dateFormat = "HH:mm"
        } else {
            display.dateFormat = "dd MMM"
        }
        display.locale = Locale(identifier: "tr_TR")
        return display.string(from: date)
    }
}

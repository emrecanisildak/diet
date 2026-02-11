import Foundation

@Observable
final class NotificationsViewModel {
    var notifications: [AppNotification] = []
    var isLoading = false
    var errorMessage: String?

    var unreadCount: Int {
        notifications.filter { !$0.isRead }.count
    }

    func loadNotifications() async {
        isLoading = true
        errorMessage = nil

        do {
            notifications = try await APIClient.shared.request(path: "/notifications")
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = "Bildirimler yüklenemedi"
        }

        isLoading = false
    }

    func markAsRead(_ id: UUID) async {
        do {
            try await APIClient.shared.requestVoid(path: "/notifications/\(id)/read", method: "POST")
            if let index = notifications.firstIndex(where: { $0.id == id }) {
                let n = notifications[index]
                notifications[index] = AppNotification(
                    id: n.id, userId: n.userId, title: n.title,
                    content: n.content, isRead: true, createdAt: n.createdAt
                )
            }
        } catch {
            errorMessage = "Bildirim güncellenemedi"
        }
    }
}

import Foundation
import UserNotifications
import UIKit

class NotificationService {
    static let shared = NotificationService()

    private var pollingTimer: Timer?
    private let seenKey = "seen_notification_ids"

    private init() {}

    // MARK: - Permissions & APNs

    func requestPermissions() {
        UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
            if granted {
                DispatchQueue.main.async {
                    UIApplication.shared.registerForRemoteNotifications()
                }
            }
        }
    }

    func registerToken(_ token: String) async {
        do {
            let _: [String: String] = try await APIClient.shared.request(
                path: "/notifications/register-token?token=\(token)",
                method: "POST"
            )
        } catch {
            print("Failed to register token: \(error.localizedDescription)")
        }
    }

    // MARK: - Polling

    func startPolling() {
        stopPolling()
        Task { await checkForNewNotifications() }
        DispatchQueue.main.async {
            self.pollingTimer = Timer.scheduledTimer(withTimeInterval: 30, repeats: true) { _ in
                Task { await self.checkForNewNotifications() }
            }
        }
    }

    func stopPolling() {
        pollingTimer?.invalidate()
        pollingTimer = nil
    }

    // MARK: - Check & Local Notification

    func checkForNewNotifications() async {
        do {
            let notifications: [AppNotification] = try await APIClient.shared.request(path: "/notifications")
            let unread = notifications.filter { !$0.isRead }
            var seen = seenIds

            for notification in unread {
                let idStr = notification.id.uuidString
                if !seen.contains(idStr) {
                    seen.insert(idStr)
                    await scheduleLocalNotification(notification)
                }
            }

            seenIds = seen
            await updateBadge(count: unread.count)
        } catch {
            // silently fail
        }
    }

    private func scheduleLocalNotification(_ notification: AppNotification) async {
        let content = UNMutableNotificationContent()
        content.title = notification.title
        content.body = notification.content
        content.sound = .default

        let request = UNNotificationRequest(
            identifier: notification.id.uuidString,
            content: content,
            trigger: nil
        )

        try? await UNUserNotificationCenter.current().add(request)
    }

    @MainActor
    private func updateBadge(count: Int) {
        UIApplication.shared.applicationIconBadgeNumber = count
    }

    // MARK: - Seen tracking

    private var seenIds: Set<String> {
        get { Set(UserDefaults.standard.stringArray(forKey: seenKey) ?? []) }
        set { UserDefaults.standard.set(Array(newValue), forKey: seenKey) }
    }

    func clearSeenIds() {
        UserDefaults.standard.removeObject(forKey: seenKey)
    }
}

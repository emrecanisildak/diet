import UIKit
import UserNotifications
import BackgroundTasks

class AppDelegate: NSObject, UIApplicationDelegate, UNUserNotificationCenterDelegate {

    static let bgTaskIdentifier = "com.dietapp.ios.notificationCheck"

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        UNUserNotificationCenter.current().delegate = self

        BGTaskScheduler.shared.register(forTaskWithIdentifier: Self.bgTaskIdentifier, using: nil) { task in
            self.handleBackgroundFetch(task: task as! BGAppRefreshTask)
        }

        return true
    }

    // MARK: - APNs

    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
        Task {
            await NotificationService.shared.registerToken(token)
        }
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        print("Failed to register: \(error.localizedDescription)")
    }

    // MARK: - Foreground notification display

    func userNotificationCenter(_ center: UNUserNotificationCenter, willPresent notification: UNNotification, withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void) {
        completionHandler([.banner, .sound, .badge])
    }

    // MARK: - Background fetch

    func scheduleBackgroundFetch() {
        let request = BGAppRefreshTaskRequest(identifier: Self.bgTaskIdentifier)
        request.earliestBeginDate = Date(timeIntervalSinceNow: 15 * 60) // 15 min
        try? BGTaskScheduler.shared.submit(request)
    }

    private func handleBackgroundFetch(task: BGAppRefreshTask) {
        scheduleBackgroundFetch() // schedule next one

        let checkTask = Task {
            await NotificationService.shared.checkForNewNotifications()
        }

        task.expirationHandler = { checkTask.cancel() }

        Task {
            _ = await checkTask.result
            task.setTaskCompleted(success: true)
        }
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        scheduleBackgroundFetch()
    }
}

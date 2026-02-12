import SwiftUI

@main
struct DietAppApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var delegate
    @Environment(\.scenePhase) private var scenePhase

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .onChange(of: scenePhase) { _, newPhase in
            switch newPhase {
            case .background:
                delegate.scheduleBackgroundFetch()
            case .active:
                NotificationService.shared.startPolling()
            case .inactive:
                NotificationService.shared.stopPolling()
            @unknown default:
                break
            }
        }
    }
}

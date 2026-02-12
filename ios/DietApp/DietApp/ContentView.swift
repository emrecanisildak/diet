import SwiftUI

struct ContentView: View {
    @State private var authViewModel = AuthViewModel()

    var body: some View {
        Group {
            if authViewModel.isAuthenticated, let user = authViewModel.currentUser {
                MainTabView(user: user) {
                    NotificationService.shared.stopPolling()
                    authViewModel.logout()
                }
                .transition(.move(edge: .trailing))
            } else {
                LoginView(viewModel: authViewModel)
                    .transition(.move(edge: .leading))
            }
        }
        .animation(.easeInOut(duration: 0.3), value: authViewModel.isAuthenticated)
        .onChange(of: authViewModel.isAuthenticated) { _, isAuth in
            if isAuth {
                NotificationService.shared.requestPermissions()
                NotificationService.shared.startPolling()
            }
        }
        .task {
            await authViewModel.checkSession()
        }
    }
}

#Preview {
    ContentView()
}

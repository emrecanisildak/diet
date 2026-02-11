import Foundation
import SwiftUI

@Observable
final class AuthViewModel {
    var email = ""
    var password = ""
    var isLoading = false
    var errorMessage: String?
    var currentUser: User?
    var isAuthenticated = false

    func login() async {
        guard !email.isEmpty, !password.isEmpty else {
            errorMessage = "E-posta ve şifre gerekli"
            return
        }

        isLoading = true
        errorMessage = nil

        do {
            let user = try await AuthService.login(email: email, password: password)
            currentUser = user
            isAuthenticated = true
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = "Bağlantı hatası"
        }

        isLoading = false
    }

    func checkSession() async {
        guard AuthService.isLoggedIn else { return }
        do {
            let user = try await AuthService.getCurrentUser()
            currentUser = user
            isAuthenticated = true
        } catch {
            AuthService.logout()
        }
    }

    func logout() {
        AuthService.logout()
        currentUser = nil
        isAuthenticated = false
        email = ""
        password = ""
    }
}

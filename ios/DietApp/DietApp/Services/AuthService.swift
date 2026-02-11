import Foundation

enum AuthService {
    static func login(email: String, password: String) async throws -> User {
        let body = LoginRequest(email: email, password: password)
        let token: TokenResponse = try await APIClient.shared.request(
            path: "/auth/login",
            method: "POST",
            body: body,
            authenticated: false
        )
        KeychainHelper.save(key: "access_token", value: token.accessToken)
        KeychainHelper.save(key: "refresh_token", value: token.refreshToken)

        let user: User = try await APIClient.shared.request(path: "/users/me")
        return user
    }

    static func logout() {
        KeychainHelper.deleteAll()
    }

    static func getCurrentUser() async throws -> User {
        try await APIClient.shared.request(path: "/users/me")
    }

    static var isLoggedIn: Bool {
        KeychainHelper.read(key: "access_token") != nil
    }
}

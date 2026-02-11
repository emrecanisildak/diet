import Foundation

struct User: Codable, Identifiable {
    let id: UUID
    let email: String
    let fullName: String
    let phone: String?
    let role: String
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, email, phone, role
        case fullName = "full_name"
        case createdAt = "created_at"
    }
}

struct LoginRequest: Codable {
    let email: String
    let password: String
}

struct TokenResponse: Codable {
    let accessToken: String
    let refreshToken: String
    let tokenType: String

    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case refreshToken = "refresh_token"
        case tokenType = "token_type"
    }
}

struct TokenRefreshRequest: Codable {
    let refreshToken: String

    enum CodingKeys: String, CodingKey {
        case refreshToken = "refresh_token"
    }
}

struct APIErrorResponse: Codable {
    let detail: String
}

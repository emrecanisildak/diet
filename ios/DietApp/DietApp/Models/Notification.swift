import Foundation

struct AppNotification: Codable, Identifiable {
    let id: UUID
    let userId: UUID
    let title: String
    let content: String
    let isRead: Bool
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, title, content
        case userId = "user_id"
        case isRead = "is_read"
        case createdAt = "created_at"
    }
}

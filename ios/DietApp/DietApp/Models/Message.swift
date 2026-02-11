import Foundation

struct Message: Codable, Identifiable {
    let id: UUID
    let senderId: UUID
    let receiverId: UUID
    let content: String?
    let imageUrl: String?
    let isRead: Bool
    let createdAt: String

    enum CodingKeys: String, CodingKey {
        case id, content
        case senderId = "sender_id"
        case receiverId = "receiver_id"
        case imageUrl = "image_url"
        case isRead = "is_read"
        case createdAt = "created_at"
    }

    var createdDate: Date? {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        if let date = formatter.date(from: createdAt) { return date }
        formatter.formatOptions = [.withInternetDateTime]
        if let date = formatter.date(from: createdAt) { return date }
        let df = DateFormatter()
        df.locale = Locale(identifier: "en_US_POSIX")
        df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS"
        if let date = df.date(from: createdAt) { return date }
        df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        return df.date(from: createdAt)
    }
}

struct Conversation: Codable, Identifiable {
    let userId: UUID
    let fullName: String
    let lastMessage: String?
    let lastMessageAt: String?
    let unreadCount: Int

    var id: UUID { userId }

    enum CodingKeys: String, CodingKey {
        case fullName = "full_name"
        case userId = "user_id"
        case lastMessage = "last_message"
        case lastMessageAt = "last_message_at"
        case unreadCount = "unread_count"
    }
}

struct MessageCreate: Codable {
    let receiverId: UUID
    let content: String?
    let imageUrl: String?

    enum CodingKeys: String, CodingKey {
        case receiverId = "receiver_id"
        case content
        case imageUrl = "image_url"
    }
}

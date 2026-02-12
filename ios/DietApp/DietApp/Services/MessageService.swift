import Foundation

struct UploadResponse: Decodable {
    let imageUrl: String

    enum CodingKeys: String, CodingKey {
        case imageUrl = "image_url"
    }
}

enum MessageService {
    static func getConversations() async throws -> [Conversation] {
        try await APIClient.shared.request(path: "/messages/conversations")
    }

    static func getMessages(with userId: UUID) async throws -> [Message] {
        try await APIClient.shared.request(path: "/messages/\(userId.uuidString)")
    }

    static func sendMessage(to receiverId: UUID, content: String?, imageUrl: String?) async throws -> Message {
        let body = MessageCreate(receiverId: receiverId, content: content, imageUrl: imageUrl)
        return try await APIClient.shared.request(
            path: "/messages",
            method: "POST",
            body: body
        )
    }

    static func getUnreadCount() async throws -> Int {
        let response: [String: Int] = try await APIClient.shared.request(path: "/messages/unread-count")
        return response["count"] ?? 0
    }

    static func uploadImage(data: Data, filename: String, mimeType: String) async throws -> UploadResponse {
        try await APIClient.shared.uploadMultipart(
            path: "/messages/upload",
            imageData: data,
            filename: filename,
            mimeType: mimeType
        )
    }
}

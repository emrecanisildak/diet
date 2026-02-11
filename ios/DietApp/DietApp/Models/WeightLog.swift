import Foundation

struct WeightLog: Codable, Identifiable {
    let id: UUID
    let clientId: UUID
    let weight: Double
    let note: String?
    let loggedAt: String

    enum CodingKeys: String, CodingKey {
        case id, weight, note
        case clientId = "client_id"
        case loggedAt = "logged_at"
    }

    var loggedDate: Date? {
        // Backend returns "2026-02-08T15:31:26.398268" (no timezone)
        let df = DateFormatter()
        df.locale = Locale(identifier: "en_US_POSIX")
        df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS"
        if let date = df.date(from: loggedAt) { return date }
        df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        return df.date(from: loggedAt)
    }
}

struct WeightLogCreate: Codable {
    let weight: Double
    let note: String?
}

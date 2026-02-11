import Foundation

struct Appointment: Codable, Identifiable {
    let id: UUID
    let dietitianId: UUID
    let clientId: UUID
    let title: String
    let dateTime: String
    let durationMinutes: Int
    let notes: String?
    let status: String

    enum CodingKeys: String, CodingKey {
        case id, title, notes, status
        case dietitianId = "dietitian_id"
        case clientId = "client_id"
        case dateTime = "date_time"
        case durationMinutes = "duration_minutes"
    }

    var date: Date? {
        let df = DateFormatter()
        df.locale = Locale(identifier: "en_US_POSIX")
        df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS"
        if let date = df.date(from: dateTime) { return date }
        df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        return df.date(from: dateTime)
    }

    var daysUntil: Int? {
        guard let date else { return nil }
        return Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: .now), to: Calendar.current.startOfDay(for: date)).day
    }
}

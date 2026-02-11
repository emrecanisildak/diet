import Foundation

enum ProfileService {
    static func getWeightLogs() async throws -> [WeightLog] {
        try await APIClient.shared.request(path: "/weight-logs")
    }

    static func addWeightLog(weight: Double, note: String?) async throws -> WeightLog {
        let body = WeightLogCreate(weight: weight, note: note)
        return try await APIClient.shared.request(
            path: "/weight-logs",
            method: "POST",
            body: body
        )
    }

    static func getDietPlans() async throws -> [DietPlan] {
        try await APIClient.shared.request(path: "/diet-plans")
    }

    static func getAppointments() async throws -> [Appointment] {
        try await APIClient.shared.request(path: "/appointments")
    }
}

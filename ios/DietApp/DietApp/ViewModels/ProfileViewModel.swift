import Foundation

@Observable
final class ProfileViewModel {
    var weightLogs: [WeightLog] = []
    var dietPlans: [DietPlan] = []
    var appointments: [Appointment] = []
    var isLoading = false
    var errorMessage: String?

    var currentWeight: Double? {
        weightLogs.first?.weight
    }

    var activePlan: DietPlan? {
        dietPlans.first { $0.isActive }
    }

    var upcomingAppointments: [Appointment] {
        appointments
            .filter { ($0.daysUntil ?? -1) >= 0 && $0.status != "cancelled" }
            .sorted { ($0.date ?? .distantFuture) < ($1.date ?? .distantFuture) }
    }

    var sortedMeals: [(day: Int, dayName: String, meals: [Meal])] {
        guard let plan = activePlan else { return [] }
        let grouped = Dictionary(grouping: plan.meals) { $0.dayOfWeek }
        return grouped.keys.sorted().compactMap { day in
            guard let meals = grouped[day], let first = meals.first else { return nil }
            return (day: day, dayName: first.dayName, meals: meals.sorted { $0.mealType < $1.mealType })
        }
    }

    func loadData() async {
        isLoading = true
        errorMessage = nil

        do {
            async let logs = ProfileService.getWeightLogs()
            async let plans = ProfileService.getDietPlans()
            async let appts = ProfileService.getAppointments()
            weightLogs = try await logs
            dietPlans = try await plans
            appointments = try await appts
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = "Veri yüklenemedi"
        }

        isLoading = false
    }

    func addWeight(weight: Double, note: String?) async {
        do {
            let log = try await ProfileService.addWeightLog(weight: weight, note: note)
            weightLogs.insert(log, at: 0)
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = "Kilo eklenemedi"
        }
    }
}

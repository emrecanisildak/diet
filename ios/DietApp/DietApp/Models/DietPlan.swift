import Foundation

struct MealItem: Codable, Identifiable {
    let id: UUID
    let mealId: UUID
    let name: String
    let amount: String?
    let calories: Int?
    let protein: Double?
    let carbs: Double?
    let fat: Double?
    let sortOrder: Int

    enum CodingKeys: String, CodingKey {
        case id, name, amount, calories, protein, carbs, fat
        case mealId = "meal_id"
        case sortOrder = "sort_order"
    }
}

struct Meal: Codable, Identifiable {
    let id: UUID
    let dietPlanId: UUID
    let mealType: String
    let dayOfWeek: Int
    let name: String
    let description: String?
    let calories: Int?
    let protein: Double?
    let carbs: Double?
    let fat: Double?
    let items: [MealItem]

    enum CodingKeys: String, CodingKey {
        case id, name, description, calories, protein, carbs, fat, items
        case dietPlanId = "diet_plan_id"
        case mealType = "meal_type"
        case dayOfWeek = "day_of_week"
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        id = try container.decode(UUID.self, forKey: .id)
        dietPlanId = try container.decode(UUID.self, forKey: .dietPlanId)
        mealType = try container.decode(String.self, forKey: .mealType)
        dayOfWeek = try container.decode(Int.self, forKey: .dayOfWeek)
        name = try container.decode(String.self, forKey: .name)
        description = try container.decodeIfPresent(String.self, forKey: .description)
        calories = try container.decodeIfPresent(Int.self, forKey: .calories)
        protein = try container.decodeIfPresent(Double.self, forKey: .protein)
        carbs = try container.decodeIfPresent(Double.self, forKey: .carbs)
        fat = try container.decodeIfPresent(Double.self, forKey: .fat)
        items = try container.decodeIfPresent([MealItem].self, forKey: .items) ?? []
    }

    var totalCalories: Int? {
        if !items.isEmpty {
            let sum = items.compactMap(\.calories).reduce(0, +)
            return sum > 0 ? sum : nil
        }
        return calories
    }

    var totalProtein: Double? {
        if !items.isEmpty {
            let sum = items.compactMap(\.protein).reduce(0, +)
            return sum > 0 ? sum : nil
        }
        return protein
    }

    var totalCarbs: Double? {
        if !items.isEmpty {
            let sum = items.compactMap(\.carbs).reduce(0, +)
            return sum > 0 ? sum : nil
        }
        return carbs
    }

    var totalFat: Double? {
        if !items.isEmpty {
            let sum = items.compactMap(\.fat).reduce(0, +)
            return sum > 0 ? sum : nil
        }
        return fat
    }

    var mealTypeDisplay: String {
        switch mealType {
        case "breakfast": return "Kahvaltı"
        case "lunch": return "Öğle Yemeği"
        case "dinner": return "Akşam Yemeği"
        case "snack": return "Ara Öğün"
        default: return mealType
        }
    }

    var dayName: String {
        switch dayOfWeek {
        case 1: return "Pazartesi"
        case 2: return "Salı"
        case 3: return "Çarşamba"
        case 4: return "Perşembe"
        case 5: return "Cuma"
        case 6: return "Cumartesi"
        case 7: return "Pazar"
        default: return "Gün \(dayOfWeek)"
        }
    }
}

struct DietPlan: Codable, Identifiable {
    let id: UUID
    let dietitianId: UUID
    let clientId: UUID
    let title: String
    let description: String?
    let startDate: String
    let endDate: String
    let isActive: Bool
    let createdAt: String
    let meals: [Meal]

    enum CodingKeys: String, CodingKey {
        case id, title, description, meals
        case dietitianId = "dietitian_id"
        case clientId = "client_id"
        case startDate = "start_date"
        case endDate = "end_date"
        case isActive = "is_active"
        case createdAt = "created_at"
    }
}

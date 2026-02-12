import SwiftUI

struct MealListView: View {
    let meals: [(day: Int, dayName: String, meals: [Meal])]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Öğün Planı")
                .font(.headline)
                .foregroundStyle(.white)
                .padding(.horizontal)

            if meals.isEmpty {
                ContentUnavailableView(
                    "Öğün Planı Yok",
                    systemImage: "fork.knife",
                    description: Text("Aktif diyet planınızda öğün bulunmuyor")
                )
            } else {
                ForEach(meals, id: \.day) { group in
                    VStack(alignment: .leading, spacing: 8) {
                        Text(group.dayName)
                            .font(.subheadline.bold())
                            .foregroundStyle(.white.opacity(0.7))
                            .padding(.horizontal)

                        ForEach(group.meals) { meal in
                            MealRow(meal: meal)
                        }
                    }
                }
            }
        }
        .padding(.vertical)
        .glassCard()
    }
}

struct MealRow: View {
    let meal: Meal
    @State private var isExpanded = false

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 12) {
                Image(systemName: mealIcon)
                    .font(.title3)
                    .foregroundStyle(mealColor)
                    .frame(width: 36, height: 36)
                    .background(mealColor.opacity(0.12))
                    .clipShape(Circle())

                VStack(alignment: .leading, spacing: 2) {
                    Text(meal.name)
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)

                    HStack(spacing: 4) {
                        Text(meal.mealTypeDisplay)
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.6))
                        if !meal.items.isEmpty {
                            Text("· \(meal.items.count) besin")
                                .font(.caption)
                                .foregroundStyle(.white.opacity(0.4))
                        }
                    }
                }

                Spacer()

                if let cal = meal.totalCalories {
                    Text("\(cal) kcal")
                        .font(.caption.bold())
                        .foregroundStyle(AppTheme.accent)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 4)
                        .background(AppTheme.accent.opacity(0.15))
                        .clipShape(Capsule())
                }

                if !meal.items.isEmpty {
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.6))
                }
            }
            .padding(.horizontal)
            .padding(.vertical, 6)
            .contentShape(Rectangle())
            .onTapGesture {
                if !meal.items.isEmpty {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        isExpanded.toggle()
                    }
                }
            }

            if isExpanded && !meal.items.isEmpty {
                VStack(alignment: .leading, spacing: 6) {
                    ForEach(meal.items.sorted(by: { $0.sortOrder < $1.sortOrder })) { item in
                        MealItemRow(item: item)
                    }

                    if let cal = meal.totalCalories {
                        HStack(spacing: 8) {
                            Text("Toplam:")
                                .font(.caption2.bold())
                            Text("\(cal) kcal")
                                .font(.caption2)
                            if let p = meal.totalProtein {
                                Text("P: \(p, specifier: "%.0f")g")
                                    .font(.caption2)
                            }
                            if let c = meal.totalCarbs {
                                Text("K: \(c, specifier: "%.0f")g")
                                    .font(.caption2)
                            }
                            if let f = meal.totalFat {
                                Text("Y: \(f, specifier: "%.0f")g")
                                    .font(.caption2)
                            }
                        }
                        .foregroundStyle(.white.opacity(0.6))
                        .padding(.top, 4)
                    }
                }
                .padding(.leading, 60)
                .padding(.trailing)
                .padding(.bottom, 8)
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
    }

    private var mealIcon: String {
        switch meal.mealType {
        case "breakfast": return "sunrise.fill"
        case "lunch": return "sun.max.fill"
        case "dinner": return "moon.fill"
        case "snack": return "cup.and.saucer.fill"
        default: return "fork.knife"
        }
    }

    private var mealColor: Color {
        switch meal.mealType {
        case "breakfast": return .orange
        case "lunch": return .yellow
        case "dinner": return .indigo
        case "snack": return .mint
        default: return .gray
        }
    }
}

struct MealItemRow: View {
    let item: MealItem

    var body: some View {
        HStack(spacing: 8) {
            Circle()
                .fill(AppTheme.accent.opacity(0.5))
                .frame(width: 6, height: 6)

            VStack(alignment: .leading, spacing: 1) {
                HStack(spacing: 4) {
                    Text(item.name)
                        .font(.caption)
                        .fontWeight(.medium)
                        .foregroundStyle(.white)
                    if let amount = item.amount, !amount.isEmpty {
                        Text("(\(amount))")
                            .font(.caption2)
                            .foregroundStyle(.white.opacity(0.6))
                    }
                }
                if item.calories != nil || item.protein != nil || item.carbs != nil || item.fat != nil {
                    HStack(spacing: 6) {
                        if let cal = item.calories {
                            Text("\(cal) kcal")
                        }
                        if let p = item.protein {
                            Text("P: \(p, specifier: "%.0f")g")
                        }
                        if let c = item.carbs {
                            Text("K: \(c, specifier: "%.0f")g")
                        }
                        if let f = item.fat {
                            Text("Y: \(f, specifier: "%.0f")g")
                        }
                    }
                    .font(.caption2)
                    .foregroundStyle(.white.opacity(0.4))
                }
            }

            Spacer()
        }
    }
}

import SwiftUI
import Charts

struct WeightChartView: View {
    let weightLogs: [WeightLog]

    private var chartData: [(date: Date, weight: Double)] {
        weightLogs
            .compactMap { log in
                guard let date = log.loggedDate else { return nil }
                return (date: date, weight: log.weight)
            }
            .sorted { $0.date < $1.date }
            .suffix(30)
            .map { $0 }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Kilo Takibi")
                .font(.headline)

            if chartData.count >= 2 {
                Chart(chartData, id: \.date) { item in
                    LineMark(
                        x: .value("Tarih", item.date),
                        y: .value("Kilo", item.weight)
                    )
                    .interpolationMethod(.catmullRom)
                    .foregroundStyle(Color(red: 0.2, green: 0.7, blue: 0.5))

                    PointMark(
                        x: .value("Tarih", item.date),
                        y: .value("Kilo", item.weight)
                    )
                    .foregroundStyle(Color(red: 0.2, green: 0.7, blue: 0.5))

                    AreaMark(
                        x: .value("Tarih", item.date),
                        y: .value("Kilo", item.weight)
                    )
                    .foregroundStyle(
                        LinearGradient(
                            colors: [
                                Color(red: 0.2, green: 0.7, blue: 0.5).opacity(0.3),
                                Color(red: 0.2, green: 0.7, blue: 0.5).opacity(0.0)
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                }
                .chartYAxis {
                    AxisMarks(position: .leading) { value in
                        AxisValueLabel {
                            if let kg = value.as(Double.self) {
                                Text("\(kg, specifier: "%.1f") kg")
                                    .font(.caption2)
                            }
                        }
                        AxisGridLine()
                    }
                }
                .chartXAxis {
                    AxisMarks(values: .stride(by: .day, count: 7)) { value in
                        AxisValueLabel(format: .dateTime.day().month(.abbreviated))
                        AxisGridLine()
                    }
                }
                .frame(height: 200)
            } else {
                ContentUnavailableView(
                    "Yetersiz Veri",
                    systemImage: "chart.line.uptrend.xyaxis",
                    description: Text("Grafik için en az 2 kilo kaydı gerekli")
                )
                .frame(height: 200)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 8, y: 4)
    }
}

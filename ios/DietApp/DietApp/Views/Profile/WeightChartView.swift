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
                .foregroundStyle(.white)

            if chartData.count >= 2 {
                Chart(chartData, id: \.date) { item in
                    LineMark(
                        x: .value("Tarih", item.date),
                        y: .value("Kilo", item.weight)
                    )
                    .interpolationMethod(.catmullRom)
                    .foregroundStyle(.white)

                    PointMark(
                        x: .value("Tarih", item.date),
                        y: .value("Kilo", item.weight)
                    )
                    .foregroundStyle(AppTheme.accent)

                    AreaMark(
                        x: .value("Tarih", item.date),
                        y: .value("Kilo", item.weight)
                    )
                    .foregroundStyle(
                        LinearGradient(
                            colors: [
                                AppTheme.accent.opacity(0.3),
                                AppTheme.accent.opacity(0.0)
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
                                    .foregroundStyle(.white.opacity(0.7))
                            }
                        }
                        AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                            .foregroundStyle(.white.opacity(0.15))
                    }
                }
                .chartXAxis {
                    AxisMarks(values: .stride(by: .day, count: 7)) { value in
                        AxisValueLabel(format: .dateTime.day().month(.abbreviated))
                            .foregroundStyle(.white.opacity(0.7))
                        AxisGridLine(stroke: StrokeStyle(lineWidth: 0.5))
                            .foregroundStyle(.white.opacity(0.15))
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
        .glassCard()
    }
}

import SwiftUI

enum AppTheme {
    static let accent = Color(red: 0.2, green: 0.7, blue: 0.5)
    static let accentDark = Color(red: 0.1, green: 0.5, blue: 0.7)
    static let cornerRadius: CGFloat = 20

    static let backgroundGradient = LinearGradient(
        colors: [Color(red: 0.12, green: 0.15, blue: 0.22), Color(red: 0.08, green: 0.20, blue: 0.28)],
        startPoint: .topLeading, endPoint: .bottomTrailing
    )
}

struct GlassCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(.white.opacity(0.08))
            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadius))
            .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadius).stroke(.white.opacity(0.1), lineWidth: 0.5))
            .shadow(color: .black.opacity(0.1), radius: 8, y: 4)
    }
}

extension View {
    func glassCard() -> some View { modifier(GlassCard()) }
}

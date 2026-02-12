import SwiftUI

struct WeightLogSheet: View {
    @Environment(\.dismiss) private var dismiss
    let onSave: (Double, String?) async -> Void

    @State private var weightText = ""
    @State private var note = ""
    @State private var isSaving = false
    @FocusState private var focusedField: Field?

    private enum Field { case weight, note }

    private var parsedWeight: Double? {
        Double(weightText.replacingOccurrences(of: ",", with: "."))
    }

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()
                    .onTapGesture { focusedField = nil }

                VStack(spacing: 24) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Kilo (kg)")
                            .font(.subheadline.bold())
                            .foregroundStyle(.white.opacity(0.8))
                        TextField("Örn: 72.5", text: $weightText)
                            .keyboardType(.decimalPad)
                            .focused($focusedField, equals: .weight)
                            .padding()
                            .foregroundStyle(.white)
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadius))
                            .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadius).stroke(.white.opacity(0.15), lineWidth: 1))
                            .onChange(of: weightText) { _, newValue in
                                let cleaned = newValue.replacingOccurrences(of: ",", with: ".")
                                // Only allow digits and one decimal point, max 3 digits before decimal
                                let parts = cleaned.split(separator: ".", maxSplits: 2, omittingEmptySubsequences: false)
                                if let intPart = parts.first, intPart.count > 3 {
                                    weightText = String(intPart.prefix(3)) + (parts.count > 1 ? ".\(parts[1].prefix(1))" : "")
                                } else if parts.count > 1, let decPart = parts.last, decPart.count > 1 {
                                    weightText = "\(parts[0]).\(decPart.prefix(1))"
                                }
                                // Remove non-numeric chars except dot/comma
                                let allowed = CharacterSet(charactersIn: "0123456789.,")
                                if newValue.unicodeScalars.contains(where: { !allowed.contains($0) }) {
                                    weightText = String(newValue.unicodeScalars.filter { allowed.contains($0) })
                                }
                            }
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text("Not (isteğe bağlı)")
                            .font(.subheadline.bold())
                            .foregroundStyle(.white.opacity(0.8))
                        TextField("Not ekle...", text: $note)
                            .focused($focusedField, equals: .note)
                            .padding()
                            .foregroundStyle(.white)
                            .background(.ultraThinMaterial)
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.cornerRadius))
                            .overlay(RoundedRectangle(cornerRadius: AppTheme.cornerRadius).stroke(.white.opacity(0.15), lineWidth: 1))
                    }

                    Spacer()
                }
                .padding(24)
            }
            .navigationTitle("Kilo Ekle")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("İptal") { dismiss() }
                        .foregroundStyle(.white)
                }
                ToolbarItem(placement: .confirmationAction) {
                    if isSaving {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Button("Kaydet") {
                            guard let weight = parsedWeight else { return }
                            isSaving = true
                            focusedField = nil
                            Task {
                                await onSave(weight, note.isEmpty ? nil : note)
                                isSaving = false
                                dismiss()
                            }
                        }
                        .foregroundStyle(AppTheme.accent)
                        .disabled(parsedWeight == nil)
                    }
                }
            }
        }
    }
}

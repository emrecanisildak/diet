import SwiftUI

struct WeightLogSheet: View {
    @Environment(\.dismiss) private var dismiss
    let onSave: (Double, String?) -> Void

    @State private var weightText = ""
    @State private var note = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Kilo (kg)") {
                    TextField("Örn: 72.5", text: $weightText)
                        .keyboardType(.decimalPad)
                }

                Section("Not (isteğe bağlı)") {
                    TextField("Not ekle...", text: $note)
                }
            }
            .navigationTitle("Kilo Ekle")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("İptal") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Kaydet") {
                        if let weight = Double(weightText.replacingOccurrences(of: ",", with: ".")) {
                            onSave(weight, note.isEmpty ? nil : note)
                            dismiss()
                        }
                    }
                    .disabled(Double(weightText.replacingOccurrences(of: ",", with: ".")) == nil)
                }
            }
        }
    }
}

import SwiftUI

struct LoginView: View {
    @Bindable var viewModel: AuthViewModel

    @State private var animateGradient = false

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [AppTheme.accent, AppTheme.accentDark],
                startPoint: animateGradient ? .topLeading : .bottomLeading,
                endPoint: animateGradient ? .bottomTrailing : .topTrailing
            )
            .ignoresSafeArea()
            .onAppear {
                withAnimation(.easeInOut(duration: 3).repeatForever(autoreverses: true)) {
                    animateGradient.toggle()
                }
            }

            VStack(spacing: 32) {
                Spacer()

                VStack(spacing: 8) {
                    Image(systemName: "leaf.fill")
                        .font(.system(size: 60))
                        .foregroundStyle(.white)

                    Text("DietApp")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundStyle(.white)

                    Text("Sağlıklı yaşamın anahtarı")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.8))
                }

                VStack(spacing: 16) {
                    HStack {
                        Image(systemName: "envelope.fill")
                            .foregroundStyle(.white.opacity(0.7))
                            .frame(width: 24)
                        TextField("E-posta", text: $viewModel.email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocorrectionDisabled()
                            .textInputAutocapitalization(.never)
                            .foregroundStyle(.white)
                    }
                    .padding()
                    .background(.white.opacity(0.15))
                    .clipShape(RoundedRectangle(cornerRadius: 14))

                    HStack {
                        Image(systemName: "lock.fill")
                            .foregroundStyle(.white.opacity(0.7))
                            .frame(width: 24)
                        SecureField("Şifre", text: $viewModel.password)
                            .textContentType(.password)
                            .foregroundStyle(.white)
                    }
                    .padding()
                    .background(.white.opacity(0.15))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                .padding(.horizontal, 32)

                if let error = viewModel.errorMessage {
                    Text(error)
                        .font(.footnote)
                        .foregroundStyle(.red)
                        .padding(.horizontal, 32)
                        .multilineTextAlignment(.center)
                }

                Button {
                    Task { await viewModel.login() }
                } label: {
                    Group {
                        if viewModel.isLoading {
                            ProgressView()
                                .tint(AppTheme.accent)
                        } else {
                            Text("Giriş Yap")
                                .font(.headline)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(.white)
                    .foregroundStyle(Color(red: 0.15, green: 0.55, blue: 0.55))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
                .disabled(viewModel.isLoading)
                .padding(.horizontal, 32)

                Spacer()
                Spacer()
            }
        }
    }
}

#Preview {
    LoginView(viewModel: AuthViewModel())
}

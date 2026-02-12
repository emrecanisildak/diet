import SwiftUI
import PhotosUI

struct ChatDetailView: View {
    let currentUserId: UUID
    let otherUserId: UUID
    let otherUserName: String

    @State private var viewModel = ChatViewModel()

    #if targetEnvironment(simulator)
    private let baseURL = "http://127.0.0.1:8000"
    #else
    private let baseURL = "http://192.168.1.100:8000"
    #endif

    var body: some View {
        VStack(spacing: 0) {
            // Mesajlar
            ScrollViewReader { proxy in
                ScrollView {
                    LazyVStack(spacing: 8) {
                        ForEach(viewModel.messages) { message in
                            MessageBubble(
                                message: message,
                                isFromMe: message.senderId == currentUserId,
                                baseURL: baseURL
                            )
                            .id(message.id)
                        }
                    }
                    .padding()
                }
                .onChange(of: viewModel.messages.count) {
                    if let last = viewModel.messages.last {
                        withAnimation {
                            proxy.scrollTo(last.id, anchor: .bottom)
                        }
                    }
                }
            }

            Divider()

            // Image preview
            if viewModel.hasImageSelected {
                HStack {
                    if let data = viewModel.selectedImageData, let uiImage = UIImage(data: data) {
                        Image(uiImage: uiImage)
                            .resizable()
                            .scaledToFill()
                            .frame(width: 80, height: 80)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    } else if let uiImage = viewModel.capturedImage {
                        Image(uiImage: uiImage)
                            .resizable()
                            .scaledToFill()
                            .frame(width: 80, height: 80)
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                    }

                    Spacer()

                    Button {
                        viewModel.clearSelectedImage()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2)
                            .foregroundStyle(.red)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 8)
            }

            // Mesaj gönderme alanı
            HStack(spacing: 8) {
                Menu {
                    PhotosPicker(
                        selection: $viewModel.selectedPhotoItem,
                        matching: .images
                    ) {
                        Label("Galeri", systemImage: "photo.on.rectangle")
                    }

                    Button {
                        viewModel.showCamera = true
                    } label: {
                        Label("Kamera", systemImage: "camera")
                    }
                } label: {
                    Image(systemName: "plus.circle.fill")
                        .font(.title2)
                        .foregroundStyle(Color(red: 0.2, green: 0.7, blue: 0.5))
                }

                TextField("Mesaj yaz...", text: $viewModel.messageText, axis: .vertical)
                    .lineLimit(1...4)
                    .padding(10)
                    .background(Color(.systemGray6))
                    .clipShape(RoundedRectangle(cornerRadius: 20))

                Button {
                    Task { await viewModel.sendMessage(to: otherUserId) }
                } label: {
                    if viewModel.isSending {
                        ProgressView()
                            .frame(width: 28, height: 28)
                    } else {
                        Image(systemName: "arrow.up.circle.fill")
                            .font(.title)
                            .foregroundStyle(Color(red: 0.2, green: 0.7, blue: 0.5))
                    }
                }
                .disabled(
                    viewModel.isSending ||
                    (viewModel.messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !viewModel.hasImageSelected)
                )
            }
            .padding(.horizontal)
            .padding(.vertical, 8)
        }
        .onTapGesture {
            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
        }
        .navigationTitle(otherUserName)
        .navigationBarTitleDisplayMode(.inline)
        .task {
            await viewModel.loadMessages(with: otherUserId)
            viewModel.connectWebSocket()
        }
        .onDisappear {
            viewModel.disconnectWebSocket()
        }
        .onChange(of: viewModel.selectedPhotoItem) {
            Task { await viewModel.handlePhotoSelection() }
        }
        .fullScreenCover(isPresented: $viewModel.showCamera) {
            CameraPicker { image in
                viewModel.capturedImage = image
                viewModel.selectedImageData = nil
            }
            .ignoresSafeArea()
        }
    }
}

struct MessageBubble: View {
    let message: Message
    let isFromMe: Bool
    var baseURL: String = ""

    var body: some View {
        HStack {
            if isFromMe { Spacer(minLength: 60) }

            VStack(alignment: isFromMe ? .trailing : .leading, spacing: 4) {
                VStack(alignment: .leading, spacing: 0) {
                    if let imageUrl = message.imageUrl, let url = URL(string: "\(baseURL)\(imageUrl)") {
                        AsyncImage(url: url) { phase in
                            switch phase {
                            case .empty:
                                ProgressView()
                                    .frame(width: 200, height: 150)
                            case .success(let image):
                                image
                                    .resizable()
                                    .scaledToFit()
                                    .frame(maxWidth: 200, maxHeight: 250)
                            case .failure:
                                Image(systemName: "photo")
                                    .font(.largeTitle)
                                    .foregroundStyle(.secondary)
                                    .frame(width: 200, height: 150)
                            @unknown default:
                                EmptyView()
                            }
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }

                    if let content = message.content, !content.isEmpty {
                        Text(content)
                            .font(.body)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 10)
                    }
                }
                .background(isFromMe
                    ? Color(red: 0.2, green: 0.7, blue: 0.5)
                    : Color(.systemGray5))
                .foregroundStyle(isFromMe ? .white : .primary)
                .clipShape(RoundedRectangle(cornerRadius: 18))

                if let date = message.createdDate {
                    Text(date, format: .dateTime.hour().minute())
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }

            if !isFromMe { Spacer(minLength: 60) }
        }
    }
}

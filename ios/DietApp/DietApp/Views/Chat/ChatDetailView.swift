import SwiftUI
import PhotosUI
import AVFoundation
import Photos

struct ChatDetailView: View {
    let currentUserId: UUID
    let otherUserId: UUID
    let otherUserName: String

    @State private var viewModel = ChatViewModel()
    @State private var showCameraAlert = false
    @State private var showGalleryAlert = false
    @State private var showPhotoPicker = false

    #if targetEnvironment(simulator)
    private let baseURL: String = "http://127.0.0.1:8000"
    #else
    private let baseURL: String = "http://192.168.1.100:8000"
    #endif

    var body: some View {
        VStack(spacing: 0) {
            MessagesList(viewModel: viewModel, currentUserId: currentUserId, baseURL: baseURL)
            imagePreview
            inputBar
        }
        .background(AppTheme.backgroundGradient.ignoresSafeArea())
        .onTapGesture {
            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
        }
        .navigationBarHidden(true)
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
        .alert("Galeri Erişimi Gerekli", isPresented: $showGalleryAlert) {
            Button("Ayarlar") {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            Button("İptal", role: .cancel) {}
        } message: {
            Text("Fotoğraf seçmek için galeri erişimine izin vermeniz gerekiyor. Ayarlardan izin verebilirsiniz.")
        }
        .alert("Kamera Erişimi Gerekli", isPresented: $showCameraAlert) {
            Button("Ayarlar") {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            Button("İptal", role: .cancel) {}
        } message: {
            Text("Fotoğraf çekmek için kamera erişimine izin vermeniz gerekiyor. Ayarlardan izin verebilirsiniz.")
        }
    }

    @ViewBuilder
    private var imagePreview: some View {
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
    }

    private var inputBar: some View {
        HStack(spacing: 8) {
            Menu {
                Button {
                    checkGalleryPermission()
                } label: {
                    Label("Galeri", systemImage: "photo.on.rectangle")
                }

                Button {
                    checkCameraPermission()
                } label: {
                    Label("Kamera", systemImage: "camera")
                }
            } label: {
                Image(systemName: "plus.circle.fill")
                    .font(.title2)
                    .foregroundStyle(.white.opacity(0.9))
            }
            .photosPicker(isPresented: $showPhotoPicker, selection: $viewModel.selectedPhotoItem, matching: .images)

            TextField("", text: $viewModel.messageText, prompt: Text("Mesaj yaz...").foregroundColor(.white.opacity(0.5)), axis: .vertical)
                .lineLimit(1...4)
                .padding(10)
                .foregroundStyle(.white)
                .background(.white.opacity(0.1))
                .clipShape(RoundedRectangle(cornerRadius: 20))
                .overlay(RoundedRectangle(cornerRadius: 20).stroke(.white.opacity(0.08), lineWidth: 0.5))

            sendButton
        }
        .padding(.horizontal)
        .padding(.vertical, 8)
        .background(.white.opacity(0.05))
    }

    private var sendButton: some View {
        Button {
            Task { await viewModel.sendMessage(to: otherUserId) }
        } label: {
            if viewModel.isSending {
                ProgressView()
                    .frame(width: 28, height: 28)
            } else {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.title)
                    .foregroundStyle(AppTheme.accent)
            }
        }
        .disabled(
            viewModel.isSending ||
            (viewModel.messageText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && !viewModel.hasImageSelected)
        )
    }

    private func checkGalleryPermission() {
        let status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
        switch status {
        case .authorized, .limited:
            showPhotoPicker = true
        case .notDetermined:
            PHPhotoLibrary.requestAuthorization(for: .readWrite) { newStatus in
                DispatchQueue.main.async {
                    if newStatus == .authorized || newStatus == .limited {
                        showPhotoPicker = true
                    }
                }
            }
        case .denied, .restricted:
            showGalleryAlert = true
        @unknown default:
            break
        }
    }

    private func checkCameraPermission() {
        switch AVCaptureDevice.authorizationStatus(for: .video) {
        case .authorized:
            viewModel.showCamera = true
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                DispatchQueue.main.async {
                    if granted { viewModel.showCamera = true }
                }
            }
        case .denied, .restricted:
            showCameraAlert = true
        @unknown default:
            break
        }
    }
}

struct MessageBubble: View {
    let message: Message
    let isFromMe: Bool
    var baseURL: String = ""
    @State private var showFullImage = false

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
                                    .onTapGesture { showFullImage = true }
                            case .failure:
                                Image(systemName: "photo")
                                    .font(.largeTitle)
                                    .foregroundStyle(.white.opacity(0.5))
                                    .frame(width: 200, height: 150)
                            @unknown default:
                                EmptyView()
                            }
                        }
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .fullScreenCover(isPresented: $showFullImage) {
                            FullScreenImageView(url: url)
                        }
                    }

                    if let content = message.content, !content.isEmpty {
                        Text(content)
                            .font(.body)
                            .padding(.horizontal, 14)
                            .padding(.vertical, 10)
                    }
                }
                .background(
                    isFromMe
                        ? LinearGradient(colors: [AppTheme.accent, AppTheme.accentDark], startPoint: .topLeading, endPoint: .bottomTrailing)
                        : LinearGradient(colors: [.white.opacity(0.12), .white.opacity(0.06)], startPoint: .topLeading, endPoint: .bottomTrailing)
                )
                .foregroundStyle(.white)
                .clipShape(RoundedRectangle(cornerRadius: 18))
                .overlay(
                    RoundedRectangle(cornerRadius: 18)
                        .stroke(.white.opacity(isFromMe ? 0 : 0.08), lineWidth: 0.5)
                )

                if let date = message.createdDate {
                    Text(date, format: .dateTime.hour().minute())
                        .font(.caption2)
                        .foregroundStyle(.white.opacity(0.5))
                }
            }

            if !isFromMe { Spacer(minLength: 60) }
        }
    }
}

struct FullScreenImageView: View {
    let url: URL
    @Environment(\.dismiss) private var dismiss
    @State private var scale: CGFloat = 1.0

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            AsyncImage(url: url) { phase in
                switch phase {
                case .empty:
                    ProgressView().tint(.white)
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFit()
                        .scaleEffect(scale)
                        .gesture(
                            MagnifyGesture()
                                .onChanged { value in scale = value.magnification }
                                .onEnded { _ in withAnimation { scale = 1.0 } }
                        )
                case .failure:
                    Image(systemName: "photo")
                        .font(.largeTitle)
                        .foregroundStyle(.white.opacity(0.5))
                @unknown default:
                    EmptyView()
                }
            }

            VStack {
                HStack {
                    Spacer()
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title)
                            .foregroundStyle(.white.opacity(0.8))
                            .padding()
                    }
                }
                Spacer()
            }
        }
        .onTapGesture(count: 2) {
            withAnimation { scale = scale > 1 ? 1.0 : 2.0 }
        }
    }
}

struct MessagesList: View {
    let viewModel: ChatViewModel
    let currentUserId: UUID
    let baseURL: String

    var body: some View {
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
    }
}

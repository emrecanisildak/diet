import Foundation
import PhotosUI
import SwiftUI

@Observable
final class ChatViewModel {
    var conversations: [Conversation] = []
    var messages: [Message] = []
    var messageText = ""
    var isLoading = false
    var errorMessage: String?
    var selectedConversation: Conversation?

    var selectedPhotoItem: PhotosPickerItem?
    var selectedImageData: Data?
    var showCamera = false
    var capturedImage: UIImage?
    var isSending = false

    private let webSocket = WebSocketService()

    init() {
        webSocket.onMessageReceived = { [weak self] message in
            self?.messages.append(message)
        }
    }

    func loadConversations() async {
        isLoading = true
        do {
            conversations = try await MessageService.getConversations()
        } catch let error as APIError {
            errorMessage = error.errorDescription
        } catch {
            errorMessage = "Sohbetler yüklenemedi"
        }
        isLoading = false
    }

    func loadMessages(with userId: UUID) async {
        isLoading = true
        do {
            messages = try await MessageService.getMessages(with: userId)
        } catch {
            errorMessage = "Mesajlar yüklenemedi"
        }
        isLoading = false
    }

    func sendMessage(to receiverId: UUID) async {
        let content = messageText.trimmingCharacters(in: .whitespacesAndNewlines)

        // Determine image data to send
        var imageData: Data?
        if let capturedImage {
            imageData = capturedImage.jpegData(compressionQuality: 0.8)
        } else if let selectedImageData {
            imageData = selectedImageData
        }

        guard !content.isEmpty || imageData != nil else { return }

        isSending = true
        messageText = ""

        do {
            var imageUrl: String?
            if let imageData {
                let response = try await MessageService.uploadImage(
                    data: imageData,
                    filename: "photo.jpg",
                    mimeType: "image/jpeg"
                )
                imageUrl = response.imageUrl
            }

            let msg = try await MessageService.sendMessage(
                to: receiverId,
                content: content.isEmpty ? nil : content,
                imageUrl: imageUrl
            )
            messages.append(msg)
            clearSelectedImage()
        } catch {
            errorMessage = "Mesaj gönderilemedi"
            if !content.isEmpty {
                messageText = content
            }
        }
        isSending = false
    }

    func handlePhotoSelection() async {
        guard let item = selectedPhotoItem else { return }
        do {
            if let data = try await item.loadTransferable(type: Data.self) {
                selectedImageData = data
                capturedImage = nil
            }
        } catch {
            errorMessage = "Fotoğraf yüklenemedi"
        }
    }

    func clearSelectedImage() {
        selectedImageData = nil
        capturedImage = nil
        selectedPhotoItem = nil
    }

    var hasImageSelected: Bool {
        selectedImageData != nil || capturedImage != nil
    }

    func connectWebSocket() {
        webSocket.connect()
    }

    func disconnectWebSocket() {
        webSocket.disconnect()
    }
}

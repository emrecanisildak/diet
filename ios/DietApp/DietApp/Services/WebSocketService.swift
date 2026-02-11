import Foundation

@Observable
final class WebSocketService {
    private var webSocketTask: URLSessionWebSocketTask?
    private var isConnected = false
    var onMessageReceived: ((Message) -> Void)?

    #if targetEnvironment(simulator)
    private let wsBaseURL = "ws://127.0.0.1:8000/api/messages/ws"
    #else
    private let wsBaseURL = "ws://192.168.1.100:8000/api/messages/ws"
    #endif

    func connect() {
        guard let token = KeychainHelper.read(key: "access_token"),
              let url = URL(string: "\(wsBaseURL)/\(token)") else { return }

        let session = URLSession(configuration: .default)
        webSocketTask = session.webSocketTask(with: url)
        webSocketTask?.resume()
        isConnected = true
        receiveMessage()
    }

    func disconnect() {
        webSocketTask?.cancel(with: .goingAway, reason: nil)
        webSocketTask = nil
        isConnected = false
    }

    func send(receiverId: UUID, content: String) {
        let payload: [String: String] = [
            "receiver_id": receiverId.uuidString,
            "content": content
        ]
        guard let data = try? JSONEncoder().encode(payload),
              let string = String(data: data, encoding: .utf8) else { return }
        webSocketTask?.send(.string(string)) { _ in }
    }

    private func receiveMessage() {
        webSocketTask?.receive { [weak self] result in
            switch result {
            case .success(let message):
                switch message {
                case .string(let text):
                    if let data = text.data(using: .utf8),
                       let msg = try? JSONDecoder().decode(Message.self, from: data) {
                        Task { @MainActor in
                            self?.onMessageReceived?(msg)
                        }
                    }
                default:
                    break
                }
                self?.receiveMessage()
            case .failure:
                self?.isConnected = false
            }
        }
    }
}

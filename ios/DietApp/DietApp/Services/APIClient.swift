import Foundation

enum APIError: Error, LocalizedError {
    case invalidURL
    case unauthorized
    case serverError(String)
    case decodingError
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Geçersiz URL"
        case .unauthorized: return "Oturum süresi doldu"
        case .serverError(let msg): return msg
        case .decodingError: return "Veri işleme hatası"
        case .networkError(let err): return err.localizedDescription
        }
    }
}

actor APIClient {
    static let shared = APIClient()

    #if targetEnvironment(simulator)
    private let baseURL = "http://127.0.0.1:8000/api"
    #else
    private let baseURL = "http://192.168.1.100:8000/api"  // LAN IP - cihazda test için güncelle
    #endif

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        return d
    }()

    private var isRefreshing = false

    func request<T: Decodable>(
        path: String,
        method: String = "GET",
        body: (any Encodable)? = nil,
        authenticated: Bool = true
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if authenticated, let token = KeychainHelper.read(key: "access_token") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkError(URLError(.badServerResponse))
        }

        if httpResponse.statusCode == 401 && authenticated {
            if try await refreshToken() {
                return try await self.request(path: path, method: method, body: body, authenticated: true)
            }
            throw APIError.unauthorized
        }

        if httpResponse.statusCode >= 400 {
            if let apiErr = try? decoder.decode(Models.APIError.self, from: data) {
                throw APIError.serverError(apiErr.detail)
            }
            throw APIError.serverError("Sunucu hatası: \(httpResponse.statusCode)")
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError
        }
    }

    func requestVoid(
        path: String,
        method: String = "GET",
        body: (any Encodable)? = nil,
        authenticated: Bool = true
    ) async throws {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw APIError.invalidURL
        }

        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if authenticated, let token = KeychainHelper.read(key: "access_token") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            request.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkError(URLError(.badServerResponse))
        }

        if httpResponse.statusCode == 401 && authenticated {
            if try await refreshToken() {
                try await self.requestVoid(path: path, method: method, body: body, authenticated: true)
                return
            }
            throw APIError.unauthorized
        }

        if httpResponse.statusCode >= 400 {
            if let apiErr = try? decoder.decode(Models.APIError.self, from: data) {
                throw APIError.serverError(apiErr.detail)
            }
            throw APIError.serverError("Sunucu hatası: \(httpResponse.statusCode)")
        }
    }

    func uploadMultipart<T: Decodable>(
        path: String,
        imageData: Data,
        filename: String,
        mimeType: String
    ) async throws -> T {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw APIError.invalidURL
        }

        let boundary = "Boundary-\(UUID().uuidString)"
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")

        if let token = KeychainHelper.read(key: "access_token") {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        var body = Data()
        body.append("--\(boundary)\r\n".data(using: .utf8)!)
        body.append("Content-Disposition: form-data; name=\"file\"; filename=\"\(filename)\"\r\n".data(using: .utf8)!)
        body.append("Content-Type: \(mimeType)\r\n\r\n".data(using: .utf8)!)
        body.append(imageData)
        body.append("\r\n--\(boundary)--\r\n".data(using: .utf8)!)
        request.httpBody = body

        let (data, response) = try await URLSession.shared.data(for: request)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkError(URLError(.badServerResponse))
        }

        if httpResponse.statusCode == 401 {
            if try await refreshToken() {
                return try await self.uploadMultipart(path: path, imageData: imageData, filename: filename, mimeType: mimeType)
            }
            throw APIError.unauthorized
        }

        if httpResponse.statusCode >= 400 {
            if let apiErr = try? decoder.decode(Models.APIError.self, from: data) {
                throw APIError.serverError(apiErr.detail)
            }
            throw APIError.serverError("Sunucu hatası: \(httpResponse.statusCode)")
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError
        }
    }

    private func refreshToken() async throws -> Bool {
        guard !isRefreshing else { return false }
        isRefreshing = true
        defer { isRefreshing = false }

        guard let refreshToken = KeychainHelper.read(key: "refresh_token") else {
            return false
        }

        guard let url = URL(string: "\(baseURL)/auth/refresh") else { return false }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.httpBody = try JSONEncoder().encode(TokenRefreshRequest(refreshToken: refreshToken))

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            KeychainHelper.deleteAll()
            return false
        }

        if let token = try? decoder.decode(TokenResponse.self, from: data) {
            KeychainHelper.save(key: "access_token", value: token.accessToken)
            KeychainHelper.save(key: "refresh_token", value: token.refreshToken)
            return true
        }
        return false
    }
}

private enum Models {
    struct APIError: Decodable {
        let detail: String
    }
}

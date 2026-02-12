import SwiftUI

struct ConversationsView: View {
    let currentUserId: UUID
    @State private var viewModel = ChatViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.conversations.isEmpty {
                    ProgressView("Yükleniyor...")
                } else if let conversation = viewModel.conversations.first {
                    ChatDetailView(
                        currentUserId: currentUserId,
                        otherUserId: conversation.userId,
                        otherUserName: conversation.fullName
                    )
                } else {
                    ContentUnavailableView(
                        "Sohbet Yok",
                        systemImage: "bubble.left.and.bubble.right",
                        description: Text("Henüz bir sohbetiniz bulunmuyor")
                    )
                }
            }
            .task {
                await viewModel.loadConversations()
            }
        }
    }
}

import SwiftUI

struct ConversationsView: View {
    let currentUserId: UUID
    @State private var viewModel = ChatViewModel()

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading && viewModel.conversations.isEmpty {
                    ProgressView("Yükleniyor...")
                } else if viewModel.conversations.isEmpty {
                    ContentUnavailableView(
                        "Sohbet Yok",
                        systemImage: "bubble.left.and.bubble.right",
                        description: Text("Henüz bir sohbetiniz bulunmuyor")
                    )
                } else {
                    List(viewModel.conversations) { conversation in
                        NavigationLink {
                            ChatDetailView(
                                currentUserId: currentUserId,
                                otherUserId: conversation.userId,
                                otherUserName: conversation.fullName
                            )
                        } label: {
                            ConversationRow(conversation: conversation)
                        }
                    }
                    .listStyle(.plain)
                }
            }
            .navigationTitle("Sohbet")
            .refreshable {
                await viewModel.loadConversations()
            }
            .task {
                await viewModel.loadConversations()
            }
        }
    }
}

struct ConversationRow: View {
    let conversation: Conversation

    var body: some View {
        HStack(spacing: 12) {
            // Avatar
            Text(String(conversation.fullName.prefix(1)))
                .font(.headline)
                .foregroundStyle(.white)
                .frame(width: 44, height: 44)
                .background(Color(red: 0.2, green: 0.7, blue: 0.5))
                .clipShape(Circle())

            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(conversation.fullName)
                        .font(.subheadline.bold())

                    Spacer()

                    if let dateStr = conversation.lastMessageAt {
                        Text(formatDate(dateStr))
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }

                if let message = conversation.lastMessage {
                    Text(message)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            if conversation.unreadCount > 0 {
                Text("\(conversation.unreadCount)")
                    .font(.caption2.bold())
                    .foregroundStyle(.white)
                    .padding(.horizontal, 7)
                    .padding(.vertical, 3)
                    .background(Color(red: 0.2, green: 0.7, blue: 0.5))
                    .clipShape(Capsule())
            }
        }
        .padding(.vertical, 4)
    }

    private func formatDate(_ isoString: String) -> String {
        let df = DateFormatter()
        df.locale = Locale(identifier: "en_US_POSIX")
        df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS"
        var date = df.date(from: isoString)
        if date == nil {
            df.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
            date = df.date(from: isoString)
        }
        guard let date else { return "" }

        let display = DateFormatter()
        if Calendar.current.isDateInToday(date) {
            display.dateFormat = "HH:mm"
        } else {
            display.dateFormat = "dd MMM"
        }
        display.locale = Locale(identifier: "tr_TR")
        return display.string(from: date)
    }
}

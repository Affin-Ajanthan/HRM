// lib/screens/messages_screen.dart
import 'package:flutter/material.dart';

class MessagesScreen extends StatefulWidget {
  const MessagesScreen({super.key});

  @override
  State<MessagesScreen> createState() => _MessagesScreenState();
}

class _MessagesScreenState extends State<MessagesScreen> {
  final List<Map<String, dynamic>> _messages = [
    {
      'id': '1',
      'name': 'Sarah Johnson',
      'message': 'Meeting scheduled for tomorrow at 10 AM',
      'time': '10:30 AM',
      'unread': true,
      'avatar': 'SJ',
    },
    {
      'id': '2',
      'name': 'Michael Chen',
      'message': 'Please review the updated project timeline',
      'time': 'Yesterday',
      'unread': true,
      'avatar': 'MC',
    },
    {
      'id': '3',
      'name': 'HR Department',
      'message': 'Your leave request has been approved',
      'time': '2 days ago',
      'unread': false,
      'avatar': 'HR',
    },
    {
      'id': '4',
      'name': 'David Smith',
      'message': 'Thanks for the quick response!',
      'time': '3 days ago',
      'unread': false,
      'avatar': 'DS',
    },
    {
      'id': '5',
      'name': 'Emma Wilson',
      'message': 'Could you join the team sync call?',
      'time': '1 week ago',
      'unread': false,
      'avatar': 'EW',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Messages'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView.builder(
        itemCount: _messages.length,
        itemBuilder: (context, index) {
          final message = _messages[index];
          final isUnread = message['unread'] as bool;
          
          return Container(
            decoration: BoxDecoration(
              color: isUnread ? Colors.blue.withValues(alpha: 0.05) : Colors.white,
              border: Border(
                bottom: BorderSide(
                  color: Colors.grey.shade200,
                  width: 1,
                ),
              ),
            ),
            child: ListTile(
              contentPadding: const EdgeInsets.symmetric(
                horizontal: 16,
                vertical: 8,
              ),
              leading: CircleAvatar(
                backgroundColor: Colors.lightBlue,
                child: Text(
                  message['avatar'] as String,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              title: Row(
                children: [
                  Expanded(
                    child: Text(
                      message['name'] as String,
                      style: TextStyle(
                        fontWeight: isUnread ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ),
                  Text(
                    message['time'] as String,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.grey[600],
                    ),
                  ),
                ],
              ),
              subtitle: Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  message['message'] as String,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontWeight: isUnread ? FontWeight.w500 : FontWeight.normal,
                    color: isUnread ? Colors.black87 : Colors.grey[600],
                  ),
                ),
              ),
              trailing: isUnread
                  ? Container(
                      width: 8,
                      height: 8,
                      decoration: const BoxDecoration(
                        color: Colors.lightBlue,
                        shape: BoxShape.circle,
                      ),
                    )
                  : null,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => MessageDetailScreen(
                      name: message['name'] as String,
                      avatar: message['avatar'] as String,
                    ),
                  ),
                );
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: Colors.lightBlue,
        child: const Icon(Icons.edit),
      ),
    );
  }
}

// Message Detail Screen
class MessageDetailScreen extends StatefulWidget {
  final String name;
  final String avatar;

  const MessageDetailScreen({
    super.key,
    required this.name,
    required this.avatar,
  });

  @override
  State<MessageDetailScreen> createState() => _MessageDetailScreenState();
}

class _MessageDetailScreenState extends State<MessageDetailScreen> {
  final TextEditingController _messageController = TextEditingController();
  final List<Map<String, dynamic>> _conversation = [
    {
      'message': 'Hi! How are you doing?',
      'time': '10:00 AM',
      'isSent': false,
    },
    {
      'message': 'I\'m doing well, thanks! How about you?',
      'time': '10:05 AM',
      'isSent': true,
    },
    {
      'message': 'Great! I wanted to discuss the project timeline.',
      'time': '10:10 AM',
      'isSent': false,
    },
    {
      'message': 'Sure, I\'m available to discuss.',
      'time': '10:15 AM',
      'isSent': true,
    },
  ];

  @override
  void dispose() {
    _messageController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    if (_messageController.text.trim().isNotEmpty) {
      setState(() {
        _conversation.add({
          'message': _messageController.text,
          'time': 'Just now',
          'isSent': true,
        });
        _messageController.clear();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              backgroundColor: Colors.lightBlue,
              radius: 16,
              child: Text(
                widget.avatar,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
            const SizedBox(width: 12),
            Text(widget.name),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.call),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.more_vert),
            onPressed: () {},
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: _conversation.length,
              itemBuilder: (context, index) {
                final chat = _conversation[index];
                final isSent = chat['isSent'] as bool;

                return Align(
                  alignment: isSent ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                    constraints: BoxConstraints(
                      maxWidth: MediaQuery.of(context).size.width * 0.7,
                    ),
                    decoration: BoxDecoration(
                      color: isSent ? Colors.lightBlue : Colors.grey[200],
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          chat['message'] as String,
                          style: TextStyle(
                            color: isSent ? Colors.white : Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          chat['time'] as String,
                          style: TextStyle(
                            fontSize: 10,
                            color: isSent ? Colors.white70 : Colors.grey[600],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.shade300,
                  blurRadius: 4,
                  offset: const Offset(0, -2),
                ),
              ],
            ),
            child: Row(
              children: [
                IconButton(
                  icon: const Icon(Icons.attach_file),
                  onPressed: () {},
                  color: Colors.grey[600],
                ),
                Expanded(
                  child: TextField(
                    controller: _messageController,
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: Colors.grey[100],
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 8,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  backgroundColor: Colors.lightBlue,
                  child: IconButton(
                    icon: const Icon(Icons.send),
                    onPressed: _sendMessage,
                    color: Colors.white,
                    iconSize: 20,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
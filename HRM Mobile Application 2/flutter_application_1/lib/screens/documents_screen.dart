import 'package:flutter/material.dart';

class DocumentsScreen extends StatelessWidget {
  const DocumentsScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final documents = [
      {
        'name': 'Employment Contract',
        'type': 'PDF',
        'size': '2.5 MB',
        'date': 'Jan 15, 2026',
        'icon': Icons.description,
        'color': Colors.red,
      },
      {
        'name': 'Tax Documents 2025',
        'type': 'PDF',
        'size': '1.8 MB',
        'date': 'Jan 10, 2026',
        'icon': Icons.receipt_long,
        'color': Colors.orange,
      },
      {
        'name': 'Performance Review',
        'type': 'DOCX',
        'size': '856 KB',
        'date': 'Dec 20, 2025',
        'icon': Icons.assignment,
        'color': Colors.blue,
      },
      {
        'name': 'ID Card Copy',
        'type': 'JPG',
        'size': '1.2 MB',
        'date': 'Nov 5, 2025',
        'icon': Icons.image,
        'color': Colors.green,
      },
      {
        'name': 'Insurance Documents',
        'type': 'PDF',
        'size': '3.1 MB',
        'date': 'Oct 15, 2025',
        'icon': Icons.security,
        'color': Colors.purple,
      },
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Documents'),
        actions: [
          IconButton(
            icon: const Icon(Icons.search),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Storage Info
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Colors.lightBlue, Color(0xFF0288D1)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Storage Used',
                    style: TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '9.4 MB / 50 MB',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: LinearProgressIndicator(
                      value: 0.188,
                      backgroundColor: Colors.white.withOpacity(0.3),
                      valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                      minHeight: 8,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Documents List
            const Text(
              'All Documents',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: documents.length,
              itemBuilder: (context, index) {
                final doc = documents[index];
                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: (doc['color'] as Color).withOpacity(0.2),
                      child: Icon(
                        doc['icon'] as IconData,
                        color: doc['color'] as Color,
                      ),
                    ),
                    title: Text(doc['name'] as String),
                    subtitle: Text(
                      '${doc['type']} • ${doc['size']} • ${doc['date']}',
                      style: const TextStyle(fontSize: 12),
                    ),
                    trailing: PopupMenuButton(
                      icon: const Icon(Icons.more_vert),
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'download',
                          child: Row(
                            children: [
                              Icon(Icons.download, size: 20),
                              SizedBox(width: 8),
                              Text('Download'),
                            ],
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'share',
                          child: Row(
                            children: [
                              Icon(Icons.share, size: 20),
                              SizedBox(width: 8),
                              Text('Share'),
                            ],
                          ),
                        ),
                        const PopupMenuItem(
                          value: 'delete',
                          child: Row(
                            children: [
                              Icon(Icons.delete, size: 20, color: Colors.red),
                              SizedBox(width: 8),
                              Text('Delete', style: TextStyle(color: Colors.red)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    onTap: () {},
                  ),
                );
              },
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: Colors.lightBlue,
        child: const Icon(Icons.upload_file),
      ),
    );
  }
}
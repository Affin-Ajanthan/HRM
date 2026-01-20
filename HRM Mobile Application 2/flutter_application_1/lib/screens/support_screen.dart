import 'package:flutter/material.dart';

class SupportScreen extends StatelessWidget {
  const SupportScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Support'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Contact Cards
            _SupportCard(
              icon: Icons.phone,
              title: 'Call Support',
              subtitle: '+1 (555) 123-4567',
              color: Colors.green,
              onTap: () {},
            ),
            _SupportCard(
              icon: Icons.email,
              title: 'Email Support',
              subtitle: 'support@company.com',
              color: Colors.blue,
              onTap: () {},
            ),
            _SupportCard(
              icon: Icons.chat,
              title: 'Live Chat',
              subtitle: 'Chat with our support team',
              color: Colors.orange,
              onTap: () {},
            ),
            const SizedBox(height: 24),

            // FAQ Section
            const Text(
              'Frequently Asked Questions',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            _FAQItem(
              question: 'How do I request leave?',
              answer:
                  'Go to the Leave section, click the + button, fill in the details, and submit your request.',
            ),
            _FAQItem(
              question: 'How do I check my attendance?',
              answer:
                  'Navigate to the Attendance tab to view your complete attendance history and statistics.',
            ),
            _FAQItem(
              question: 'Where can I find my payslips?',
              answer:
                  'Go to the Salary section to view and download all your payslips.',
            ),
            _FAQItem(
              question: 'How do I update my profile?',
              answer:
                  'Go to Profile, select the information you want to update, and save your changes.',
            ),
            const SizedBox(height: 24),

            // Submit Ticket
            const Text(
              'Need More Help?',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: () {},
                icon: const Icon(Icons.confirmation_number),
                label: const Text('Submit Support Ticket'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.lightBlue,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SupportCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _SupportCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: color.withOpacity(0.2),
          child: Icon(icon, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.arrow_forward_ios, size: 16),
        onTap: onTap,
      ),
    );
  }
}

class _FAQItem extends StatefulWidget {
  final String question;
  final String answer;

  const _FAQItem({
    required this.question,
    required this.answer,
  });

  @override
  State<_FAQItem> createState() => _FAQItemState();
}

class _FAQItemState extends State<_FAQItem> {
  bool isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: Column(
        children: [
          ListTile(
            title: Text(
              widget.question,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            trailing: Icon(
              isExpanded ? Icons.expand_less : Icons.expand_more,
            ),
            onTap: () {
              setState(() {
                isExpanded = !isExpanded;
              });
            },
          ),
          if (isExpanded)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
              child: Text(
                widget.answer,
                style: const TextStyle(color: Colors.grey),
              ),
            ),
        ],
      ),
    );
  }
}
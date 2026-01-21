import 'package:flutter/material.dart';

class MyTasksScreen extends StatefulWidget {
  const MyTasksScreen({Key? key}) : super(key: key);

  @override
  State<MyTasksScreen> createState() => _MyTasksScreenState();
}

class _MyTasksScreenState extends State<MyTasksScreen> {
  final List<Map<String, dynamic>> _tasks = [
    {
      'id': '1',
      'title': 'Complete project documentation',
      'description': 'Write comprehensive documentation for the new feature',
      'priority': 'High',
      'status': 'In Progress',
      'dueDate': 'Jan 25, 2026',
      'completed': false,
    },
    {
      'id': '2',
      'title': 'Code review for Team Member',
      'description': 'Review pull request #234',
      'priority': 'Medium',
      'status': 'Pending',
      'dueDate': 'Jan 22, 2026',
      'completed': false,
    },
    {
      'id': '3',
      'title': 'Attend team meeting',
      'description': 'Weekly sync-up meeting',
      'priority': 'Low',
      'status': 'Completed',
      'dueDate': 'Jan 20, 2026',
      'completed': true,
    },
    {
      'id': '4',
      'title': 'Fix bug in payment module',
      'description': 'Critical bug affecting transactions',
      'priority': 'High',
      'status': 'In Progress',
      'dueDate': 'Jan 21, 2026',
      'completed': false,
    },
  ];

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'High':
        return Colors.red;
      case 'Medium':
        return Colors.orange;
      case 'Low':
        return Colors.green;
      default:
        return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final pendingTasks = _tasks.where((t) => !t['completed']).toList();
    final completedTasks = _tasks.where((t) => t['completed']).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Tasks'),
        actions: [
          IconButton(
            icon: const Icon(Icons.filter_list),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Task Summary
            Row(
              children: [
                Expanded(
                  child: _TaskSummaryCard(
                    title: 'Total Tasks',
                    value: '${_tasks.length}',
                    icon: Icons.assignment,
                    color: Colors.blue,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _TaskSummaryCard(
                    title: 'Pending',
                    value: '${pendingTasks.length}',
                    icon: Icons.pending,
                    color: Colors.orange,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _TaskSummaryCard(
                    title: 'Completed',
                    value: '${completedTasks.length}',
                    icon: Icons.check_circle,
                    color: Colors.green,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Pending Tasks
            const Text(
              'Pending Tasks',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            if (pendingTasks.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: Text('No pending tasks'),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: pendingTasks.length,
                itemBuilder: (context, index) {
                  final task = pendingTasks[index];
                  return _TaskCard(
                    task: task,
                    onTap: () {},
                    priorityColor: _getPriorityColor(task['priority']),
                  );
                },
              ),
            const SizedBox(height: 24),

            // Completed Tasks
            const Text(
              'Completed Tasks',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            if (completedTasks.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: Text('No completed tasks'),
                ),
              )
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: completedTasks.length,
                itemBuilder: (context, index) {
                  final task = completedTasks[index];
                  return _TaskCard(
                    task: task,
                    onTap: () {},
                    priorityColor: _getPriorityColor(task['priority']),
                  );
                },
              ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {},
        backgroundColor: Colors.lightBlue,
        child: const Icon(Icons.add),
      ),
    );
  }
}

class _TaskSummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const _TaskSummaryCard({
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            title,
            style: const TextStyle(fontSize: 10, color: Colors.grey),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}

class _TaskCard extends StatelessWidget {
  final Map<String, dynamic> task;
  final VoidCallback onTap;
  final Color priorityColor;

  const _TaskCard({
    required this.task,
    required this.onTap,
    required this.priorityColor,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(8),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      task['title'],
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        decoration: task['completed']
                            ? TextDecoration.lineThrough
                            : null,
                      ),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: priorityColor.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      task['priority'],
                      style: TextStyle(
                        color: priorityColor,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                task['description'],
                style: const TextStyle(color: Colors.grey, fontSize: 14),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.calendar_today, size: 14, color: Colors.grey),
                  const SizedBox(width: 4),
                  Text(
                    task['dueDate'],
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  ),
                  const Spacer(),
                  Chip(
                    label: Text(task['status']),
                    backgroundColor: task['completed']
                        ? Colors.green.withOpacity(0.2)
                        : Colors.blue.withOpacity(0.2),
                    labelStyle: TextStyle(
                      fontSize: 12,
                      color: task['completed'] ? Colors.green : Colors.blue,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
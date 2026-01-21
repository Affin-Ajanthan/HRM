// lib/screens/employer_dashboard.dart
import 'package:flutter/material.dart';
import 'login_screen.dart';
import 'check_in_screen.dart';
import 'my_tasks_screen.dart';
import 'messages_screen.dart';
import 'documents_screen.dart';
import 'support_screen.dart';
import 'leave_application_screen.dart';

class EmployerDashboard extends StatefulWidget {
  const EmployerDashboard({Key? key}) : super(key: key);

  @override
  State<EmployerDashboard> createState() => _EmployerDashboardState();
}

class _EmployerDashboardState extends State<EmployerDashboard> {
  int _selectedIndex = 0;

  final List<Widget> _screens = [
    const DashboardHome(),
    const MyAttendanceScreen(),
    const LeaveRequestScreen(),
    const PayslipScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_selectedIndex],
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (index) => setState(() => _selectedIndex = index),
        type: BottomNavigationBarType.fixed,
        selectedItemColor: Colors.lightBlue,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.access_time), label: 'Attendance'),
          BottomNavigationBarItem(icon: Icon(Icons.event_available), label: 'Leave'),
          BottomNavigationBarItem(icon: Icon(Icons.receipt_long), label: 'Payslip'),
          BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}

// Helper Widgets
class _StatusCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;

  const _StatusCard({
    required this.icon,
    required this.title,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 28),
          const SizedBox(height: 8),
          Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [BoxShadow(color: Colors.grey.shade200, blurRadius: 4, spreadRadius: 1)],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: Colors.lightBlue, size: 32),
            const SizedBox(height: 8),
            Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

class _EventItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final String time;

  const _EventItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.time,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.lightBlue.withOpacity(0.1),
          child: Icon(icon, color: Colors.lightBlue),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(subtitle),
        trailing: Text(time, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;

  const _SummaryCard({required this.title, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          Text(title, style: const TextStyle(fontSize: 14)),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
        ],
      ),
    );
  }
}

class _ProfileOption extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;

  const _ProfileOption({required this.icon, required this.title, required this.value});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Icon(icon, color: Colors.lightBlue, size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                const SizedBox(height: 4),
                Text(value, style: const TextStyle(fontSize: 16)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// Dashboard Home Screen
class DashboardHome extends StatelessWidget {
  const DashboardHome({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Employee Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Colors.lightBlue, Color(0xFF0288D1)]),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Welcome Back!', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  Text('Have a productive day ahead', style: TextStyle(color: Colors.white.withOpacity(0.9), fontSize: 14)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Today\'s Status', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _StatusCard(icon: Icons.check_circle, title: 'Check-in Time', value: '09:00 AM', color: Colors.green)),
                const SizedBox(width: 12),
                Expanded(child: _StatusCard(icon: Icons.timer, title: 'Hours Worked', value: '7.5 hrs', color: Colors.orange)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _StatusCard(icon: Icons.calendar_today, title: 'Attendance', value: '98%', color: Colors.blue)),
                const SizedBox(width: 12),
                Expanded(child: _StatusCard(icon: Icons.task_alt, title: 'Tasks Done', value: '12/15', color: Colors.purple)),
              ],
            ),
            const SizedBox(height: 24),
            const Text('Quick Actions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            GridView.count(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisCount: 3,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              children: [
                _ActionCard(icon: Icons.login, title: 'Check-in', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const CheckInScreen()))),
                _ActionCard(icon: Icons.logout, title: 'Check-out', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const CheckInScreen()))),
                _ActionCard(icon: Icons.assignment, title: 'My Tasks', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const MyTasksScreen()))),
                _ActionCard(icon: Icons.message, title: 'Messages', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const MessagesScreen()))),
                _ActionCard(icon: Icons.description, title: 'Documents', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const DocumentsScreen()))),
                _ActionCard(icon: Icons.help, title: 'Support', onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const SupportScreen()))),
              ],
            ),
            const SizedBox(height: 24),
            const Text('Upcoming Events', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _EventItem(icon: Icons.event, title: 'Team Meeting', subtitle: 'Tomorrow at 2:00 PM', time: 'Conference Room A'),
            _EventItem(icon: Icons.school, title: 'Training Session', subtitle: 'Friday at 10:00 AM', time: 'Online - Zoom Link'),
            _EventItem(icon: Icons.celebration, title: 'Company Event', subtitle: 'Next Monday', time: 'Grand Ballroom'),
          ],
        ),
      ),
    );
  }
}

// My Attendance Screen
class MyAttendanceScreen extends StatefulWidget {
  const MyAttendanceScreen({Key? key}) : super(key: key);

  @override
  State<MyAttendanceScreen> createState() => _MyAttendanceScreenState();
}

class _MyAttendanceScreenState extends State<MyAttendanceScreen> {
  String _selectedMonth = 'January 2026';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Attendance')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.grey.shade300),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [Text(_selectedMonth), const Icon(Icons.calendar_today, color: Colors.lightBlue)],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Monthly Summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _SummaryCard(title: 'Present', value: '18', color: Colors.green)),
                const SizedBox(width: 12),
                Expanded(child: _SummaryCard(title: 'Absent', value: '2', color: Colors.red)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _SummaryCard(title: 'On Leave', value: '3', color: Colors.orange)),
                const SizedBox(width: 12),
                Expanded(child: _SummaryCard(title: 'Late Arrival', value: '1', color: Colors.amber)),
              ],
            ),
            const SizedBox(height: 24),
            const Text('Daily Attendance', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 15,
              itemBuilder: (context, index) {
                final day = index + 1;
                final isPresent = day % 2 == 0;
                final isLeave = day == 15;
                return Card(
                  margin: const EdgeInsets.only(bottom: 8),
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: isLeave ? Colors.orange.withOpacity(0.2) : isPresent ? Colors.green.withOpacity(0.2) : Colors.red.withOpacity(0.2),
                      child: Icon(isLeave ? Icons.event_available : isPresent ? Icons.check : Icons.close, color: isLeave ? Colors.orange : isPresent ? Colors.green : Colors.red),
                    ),
                    title: Text('January $day, 2026'),
                    subtitle: isLeave ? const Text('On Leave') : isPresent ? const Text('09:00 AM - 05:30 PM') : const Text('Absent'),
                    trailing: isPresent
                        ? const Chip(label: Text('On Time'), backgroundColor: Colors.green, labelStyle: TextStyle(color: Colors.white, fontSize: 12))
                        : isLeave
                            ? const Chip(label: Text('Leave'), backgroundColor: Colors.orange, labelStyle: TextStyle(color: Colors.white, fontSize: 12))
                            : const Chip(label: Text('Absent'), backgroundColor: Colors.red, labelStyle: TextStyle(color: Colors.white, fontSize: 12)),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}

// Leave Request Screen
class LeaveRequestScreen extends StatelessWidget {
  const LeaveRequestScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Leave Requests')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Colors.lightBlue, Color(0xFF0288D1)]),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Leave Balance', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 8),
                  const Text('12 Days', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text('Remaining out of 20 days', style: TextStyle(color: Colors.white.withOpacity(0.8), fontSize: 14)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            const Text('Leave Types', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _LeaveTypeCard(title: 'Annual', available: '8', total: '12', color: Colors.blue)),
                const SizedBox(width: 12),
                Expanded(child: _LeaveTypeCard(title: 'Sick', available: '3', total: '5', color: Colors.red)),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(child: _LeaveTypeCard(title: 'Casual', available: '1', total: '3', color: Colors.orange)),
                const SizedBox(width: 12),
                Expanded(child: _LeaveTypeCard(title: 'Emergency', available: '0', total: '0', color: Colors.purple)),
              ],
            ),
            const SizedBox(height: 24),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Recent Requests', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                TextButton.icon(
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => const LeaveApplicationScreen(),
                      ),
                    );
                  },
                  icon: const Icon(Icons.add, size: 18),
                  label: const Text('New Request'),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _LeaveRequestCard(
              type: 'Annual Leave',
              startDate: 'Jan 25, 2026',
              endDate: 'Jan 27, 2026',
              days: '3',
              status: 'Approved',
              statusColor: Colors.green,
            ),
            _LeaveRequestCard(
              type: 'Sick Leave',
              startDate: 'Feb 5, 2026',
              endDate: 'Feb 6, 2026',
              days: '2',
              status: 'Pending',
              statusColor: Colors.orange,
            ),
            _LeaveRequestCard(
              type: 'Casual Leave',
              startDate: 'Feb 15, 2026',
              endDate: 'Feb 15, 2026',
              days: '1',
              status: 'Rejected',
              statusColor: Colors.red,
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => const LeaveApplicationScreen(),
            ),
          );
        },
        icon: const Icon(Icons.add),
        label: const Text('Apply Leave'),
        backgroundColor: Colors.lightBlue,
      ),
    );
  }
}

class _LeaveTypeCard extends StatelessWidget {
  final String title;
  final String available;
  final String total;
  final Color color;

  const _LeaveTypeCard({required this.title, required this.available, required this.total, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
          const SizedBox(height: 8),
          Row(
            children: [
              Text(available, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
              Text(' / $total', style: const TextStyle(fontSize: 16, color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }
}

class _LeaveRequestCard extends StatelessWidget {
  final String type;
  final String startDate;
  final String endDate;
  final String days;
  final String status;
  final Color statusColor;

  const _LeaveRequestCard({
    required this.type,
    required this.startDate,
    required this.endDate,
    required this.days,
    required this.status,
    required this.statusColor,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(type, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Chip(
                  label: Text(status),
                  backgroundColor: statusColor.withOpacity(0.2),
                  labelStyle: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12),
                  padding: EdgeInsets.zero,
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.calendar_today, size: 16, color: Colors.grey),
                const SizedBox(width: 4),
                Text('$startDate - $endDate', style: const TextStyle(color: Colors.grey, fontSize: 14)),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.access_time, size: 16, color: Colors.grey),
                const SizedBox(width: 4),
                Text('$days day(s)', style: const TextStyle(color: Colors.grey, fontSize: 14)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// Payslip Screen
class PayslipScreen extends StatelessWidget {
  const PayslipScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payslips')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: [Colors.lightBlue, Color(0xFF0288D1)]),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('January 2026', style: TextStyle(color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 8),
                  const Text('Net Salary', style: TextStyle(color: Colors.white, fontSize: 16)),
                  const SizedBox(height: 8),
                  const Text('\$4,300.00', style: TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text('Gross Salary', style: TextStyle(color: Colors.white70, fontSize: 12)),
                          SizedBox(height: 4),
                          Text('\$5,000.00', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: const [
                          Text('Total Deductions', style: TextStyle(color: Colors.white70, fontSize: 12)),
                          SizedBox(height: 4),
                          Text('\$700.00', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w600)),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            const Text('Salary Breakdown', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            _SalaryItem(title: 'Basic Salary', amount: '\$3,500', isDeduction: false),
            _SalaryItem(title: 'Allowances', amount: '\$1,000', isDeduction: false),
            _SalaryItem(title: 'Housing', amount: '\$500', isDeduction: false),
            const Divider(height: 24),
            _SalaryItem(title: 'Tax', amount: '\$400', isDeduction: true),
            _SalaryItem(title: 'Insurance', amount: '\$200', isDeduction: true),
            _SalaryItem(title: 'Provident Fund', amount: '\$100', isDeduction: true),
            const SizedBox(height: 24),

            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text('Recent Payslips', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              ],
            ),
            const SizedBox(height: 12),
            _PayslipCard(month: 'January 2026', amount: '\$4,300', date: 'Jan 5, 2026', isPaid: true),
            _PayslipCard(month: 'December 2025', amount: '\$4,300', date: 'Dec 5, 2025', isPaid: true),
            _PayslipCard(month: 'November 2025', amount: '\$4,300', date: 'Nov 5, 2025', isPaid: true),
            _PayslipCard(month: 'October 2025', amount: '\$4,300', date: 'Oct 5, 2025', isPaid: true),
          ],
        ),
      ),
    );
  }
}

class _SalaryItem extends StatelessWidget {
  final String title;
  final String amount;
  final bool isDeduction;

  const _SalaryItem({required this.title, required this.amount, required this.isDeduction});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(
                isDeduction ? Icons.remove_circle : Icons.add_circle,
                color: isDeduction ? Colors.red : Colors.green,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(fontSize: 16)),
            ],
          ),
          Text(
            amount,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: isDeduction ? Colors.red : Colors.green,
            ),
          ),
        ],
      ),
    );
  }
}

class _PayslipCard extends StatelessWidget {
  final String month;
  final String amount;
  final String date;
  final bool isPaid;

  const _PayslipCard({required this.month, required this.amount, required this.date, required this.isPaid});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.lightBlue.withOpacity(0.1),
          child: const Icon(Icons.receipt_long, color: Colors.lightBlue),
        ),
        title: Text(month, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('Paid on $date'),
        trailing: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(amount, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.lightBlue)),
            const SizedBox(height: 4),
            InkWell(
              onTap: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Downloading payslip...')),
                );
              },
              child: const Text('Download', style: TextStyle(fontSize: 12, color: Colors.blue, decoration: TextDecoration.underline)),
            ),
          ],
        ),
      ),
    );
  }
}

// Profile Screen
class ProfileScreen extends StatelessWidget {
  const ProfileScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Profile')),
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: const BoxDecoration(
                gradient: LinearGradient(colors: [Colors.lightBlue, Color(0xFF0288D1)]),
              ),
              child: Column(
                children: [
                  CircleAvatar(radius: 50, backgroundColor: Colors.white, child: const Icon(Icons.person, size: 60, color: Colors.lightBlue)),
                  const SizedBox(height: 16),
                  const Text('John Doe', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                  const SizedBox(height: 4),
                  const Text('Software Engineer', style: TextStyle(fontSize: 16, color: Colors.white70)),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.2), borderRadius: BorderRadius.circular(20)),
                    child: const Text('Full-time Employee', style: TextStyle(color: Colors.white, fontSize: 12)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Personal Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  _ProfileOption(icon: Icons.badge, title: 'Employee ID', value: 'EMP2024001'),
                  _ProfileOption(icon: Icons.email, title: 'Email', value: 'john.doe@company.com'),
                  _ProfileOption(icon: Icons.phone, title: 'Phone', value: '+1 (555) 123-4567'),
                  _ProfileOption(icon: Icons.cake, title: 'Date of Birth', value: 'January 15, 1992'),
                  const Divider(height: 24),
                  const Text('Work Information', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  _ProfileOption(icon: Icons.business, title: 'Department', value: 'Engineering'),
                  _ProfileOption(icon: Icons.supervisor_account, title: 'Manager', value: 'Jane Smith'),
                  _ProfileOption(icon: Icons.calendar_today, title: 'Date of Joining', value: 'March 10, 2021'),
                  _ProfileOption(icon: Icons.location_on, title: 'Office Location', value: 'New York, USA'),
                  const Divider(height: 24),
                  const Text('Emergency Contact', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 12),
                  _ProfileOption(icon: Icons.person, title: 'Contact Name', value: 'Sarah Doe'),
                  _ProfileOption(icon: Icons.phone, title: 'Contact Phone', value: '+1 (555) 987-6543'),
                  const SizedBox(height: 24),
                  const Divider(),
                  const SizedBox(height: 16),
                  ListTile(leading: const Icon(Icons.lock, color: Colors.lightBlue), title: const Text('Change Password'), trailing: const Icon(Icons.arrow_forward_ios, size: 16), onTap: () {}),
                  ListTile(leading: const Icon(Icons.settings, color: Colors.lightBlue), title: const Text('Settings'), trailing: const Icon(Icons.arrow_forward_ios, size: 16), onTap: () {}),
                  ListTile(
                    leading: const Icon(Icons.help, color: Colors.lightBlue),
                    title: const Text('Help & Support'),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () => Navigator.push(context, MaterialPageRoute(builder: (context) => const SupportScreen())),
                  ),
                  ListTile(
                    leading: const Icon(Icons.exit_to_app, color: Colors.red),
                    title: const Text('Logout', style: TextStyle(color: Colors.red)),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.red),
                    onTap: () {
                      showDialog(
                        context: context,
                        builder: (BuildContext context) {
                          return AlertDialog(
                            title: const Text('Logout'),
                            content: const Text('Are you sure you want to logout?'),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel')),
                              TextButton(
                                onPressed: () {
                                  Navigator.pop(context);
                                  Navigator.pushAndRemoveUntil(
                                    context,
                                    MaterialPageRoute(builder: (context) => const LoginScreen()),
                                    (route) => false,
                                  );
                                },
                                child: const Text('Logout', style: TextStyle(color: Colors.red)),
                              ),
                            ],
                          );
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
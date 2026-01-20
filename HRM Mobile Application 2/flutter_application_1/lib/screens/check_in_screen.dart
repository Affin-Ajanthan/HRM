import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';

class CheckInScreen extends StatefulWidget {
  const CheckInScreen({super.key});

  @override
  State<CheckInScreen> createState() => _CheckInScreenState();
}

class _CheckInScreenState extends State<CheckInScreen> {
  bool isCheckedIn = false;
  DateTime? checkInDateTime;
  DateTime? checkOutDateTime;

  @override
  void initState() {
    super.initState();
    _loadCheckInState();
  }

  // Load check-in state from SharedPreferences
  Future<void> _loadCheckInState() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      isCheckedIn = prefs.getBool('isCheckedIn') ?? false;
      
      final checkInString = prefs.getString('checkInDateTime');
      if (checkInString != null) {
        checkInDateTime = DateTime.parse(checkInString);
      }
      
      final checkOutString = prefs.getString('checkOutDateTime');
      if (checkOutString != null) {
        checkOutDateTime = DateTime.parse(checkOutString);
      }
    });
  }

  // Save check-in state to SharedPreferences
  Future<void> _saveCheckInState() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isCheckedIn', isCheckedIn);
    
    if (checkInDateTime != null) {
      await prefs.setString('checkInDateTime', checkInDateTime!.toIso8601String());
    } else {
      await prefs.remove('checkInDateTime');
    }
    
    if (checkOutDateTime != null) {
      await prefs.setString('checkOutDateTime', checkOutDateTime!.toIso8601String());
    } else {
      await prefs.remove('checkOutDateTime');
    }
  }

  void _handleCheckIn() async {
    setState(() {
      isCheckedIn = true;
      checkInDateTime = DateTime.now();
      checkOutDateTime = null; // Reset checkout if checking in again
    });
    
    await _saveCheckInState();
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Checked in successfully!'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  void _handleCheckOut() async {
    setState(() {
      checkOutDateTime = DateTime.now();
    });
    
    await _saveCheckInState();
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Checked out successfully!'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  String _calculateWorkHours() {
    if (checkInDateTime == null) return '0.0 hrs';
    
    DateTime endTime = checkOutDateTime ?? DateTime.now();
    Duration duration = endTime.difference(checkInDateTime!);
    
    double hours = duration.inMinutes / 60;
    return '${hours.toStringAsFixed(1)} hrs';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Check-in'),
        actions: [
          // Reset button for testing (remove in production)
          if (isCheckedIn)
            IconButton(
              icon: const Icon(Icons.refresh),
              onPressed: () async {
                final prefs = await SharedPreferences.getInstance();
                await prefs.clear();
                setState(() {
                  isCheckedIn = false;
                  checkInDateTime = null;
                  checkOutDateTime = null;
                });
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Status reset successfully!'),
                    ),
                  );
                }
              },
              tooltip: 'Reset Status',
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Current Date and Time
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Colors.lightBlue, Color(0xFF0288D1)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Icon(Icons.access_time, color: Colors.white, size: 48),
                  const SizedBox(height: 16),
                  StreamBuilder(
                    stream: Stream.periodic(const Duration(seconds: 1)),
                    builder: (context, snapshot) {
                      return Text(
                        DateFormat('hh:mm:ss a').format(DateTime.now()),
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 48,
                          fontWeight: FontWeight.bold,
                        ),
                      );
                    },
                  ),
                  const SizedBox(height: 8),
                  Text(
                    DateFormat('EEEE, MMMM d, yyyy').format(DateTime.now()),
                    style: const TextStyle(
                      color: Colors.white70,
                      fontSize: 16,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Status Card
            if (isCheckedIn) ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.green.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green, width: 2),
                ),
                child: Column(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.green, size: 48),
                    const SizedBox(height: 12),
                    const Text(
                      'You are checked in',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Check-in time: ${DateFormat('hh:mm a').format(checkInDateTime!)}',
                      style: const TextStyle(color: Colors.grey),
                    ),
                    if (checkOutDateTime != null)
                      Text(
                        'Check-out time: ${DateFormat('hh:mm a').format(checkOutDateTime!)}',
                        style: const TextStyle(color: Colors.grey),
                      ),
                  ],
                ),
              ),
            ] else ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.orange.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.orange, width: 2),
                ),
                child: const Column(
                  children: [
                    Icon(Icons.pending, color: Colors.orange, size: 48),
                    SizedBox(height: 12),
                    Text(
                      'You are not checked in',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 8),
                    Text(
                      'Please check in to start your day',
                      style: TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 24),

            // Check-in Button
            if (!isCheckedIn)
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _handleCheckIn,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.green,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Check In',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              )
            else if (checkOutDateTime == null)
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _handleCheckOut,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  child: const Text(
                    'Check Out',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                ),
              )
            else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.blue.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.blue.withOpacity(0.3)),
                ),
                child: const Column(
                  children: [
                    Icon(Icons.info_outline, color: Colors.blue, size: 32),
                    SizedBox(height: 8),
                    Text(
                      'You have completed your day',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Have a great rest of your day!',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 24),

            // Today's Summary
            const Text(
              'Today\'s Summary',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _SummaryCard(
                    icon: Icons.login,
                    title: 'Check-in',
                    value: checkInDateTime != null 
                        ? DateFormat('hh:mm a').format(checkInDateTime!)
                        : '--:--',
                    color: Colors.green,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _SummaryCard(
                    icon: Icons.logout,
                    title: 'Check-out',
                    value: checkOutDateTime != null
                        ? DateFormat('hh:mm a').format(checkOutDateTime!)
                        : '--:--',
                    color: Colors.red,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: StreamBuilder(
                    stream: Stream.periodic(const Duration(seconds: 1)),
                    builder: (context, snapshot) {
                      return _SummaryCard(
                        icon: Icons.timer,
                        title: 'Hours',
                        value: _calculateWorkHours(),
                        color: Colors.blue,
                      );
                    },
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _SummaryCard(
                    icon: Icons.pause,
                    title: 'Break',
                    value: '1.0 hrs',
                    color: Colors.orange,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final Color color;

  const _SummaryCard({
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
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 8),
          Text(
            value,
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(fontSize: 12, color: Colors.grey),
          ),
        ],
      ),
    );
  }
}
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class WorkoutScreen extends StatefulWidget {
  const WorkoutScreen({super.key});

  @override
  State<WorkoutScreen> createState() => _WorkoutScreenState();
}

class _WorkoutScreenState extends State<WorkoutScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _workoutPlan;
  bool _isDone = false;

  @override
  void initState() {
    super.initState();
    _fetchWorkout();
  }

  Future<void> _fetchWorkout() async {
    setState(() => _isLoading = true);
    try {
      final storage = Provider.of<StorageService>(context, listen: false);
      final api = ApiService();
      final plan = await api.getTodayPlan(storage.getUserId()!);
      setState(() {
        _workoutPlan = plan?['workout_plan'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _logWorkout(bool done) async {
    final storage = Provider.of<StorageService>(context, listen: false);
    final api = ApiService();
    final success = await api.logWorkout(storage.getUserId()!, done);
    if (success && done) {
      setState(() => _isDone = true);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Awesome job! Workout logged. 🔥'), backgroundColor: Color(0xFF4CAF50)),
        );
      }
    } else {
      if (mounted) Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Today\'s Workout'), backgroundColor: Colors.transparent, elevation: 0),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Color(0xFF4CAF50)))
        : _buildContent(),
    );
  }

  Widget _buildContent() {
    if (_workoutPlan == null) return const Center(child: Text('No workout found for today.'));

    final exercises = (_workoutPlan!['exercises'] as List?) ?? [];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          const SizedBox(height: 24),
          ...exercises.map((ex) => _buildExerciseCard(ex)),
          const SizedBox(height: 24),
          _buildCooldownCard(),
          const SizedBox(height: 40),
          ElevatedButton(
            onPressed: _isDone ? null : () => _logWorkout(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: _isDone ? Colors.grey : const Color(0xFF4CAF50),
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 56),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                if (_isDone) const Icon(Icons.check_circle_outline),
                if (_isDone) const SizedBox(width: 8),
                Text(_isDone ? 'COMPLETED' : 'I COMPLETED THIS WORKOUT'),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Center(
            child: TextButton(
              onPressed: () => _logWorkout(false),
              child: const Text('Skip today', style: TextStyle(color: Colors.grey)),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(_workoutPlan!['workout_name'] ?? 'Home Workout', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
        const SizedBox(height: 4),
        Text('${_workoutPlan!['duration_minutes']} minutes • No equipment needed', style: const TextStyle(color: Colors.grey)),
      ],
    );
  }

  Widget _buildExerciseCard(Map ex) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(ex['name'] ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Text('${ex['sets']} x ${ex['reps']}', style: const TextStyle(color: Color(0xFF4CAF50), fontWeight: FontWeight.bold, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 8),
            Text('Rest: ${ex['rest_seconds']} seconds', style: const TextStyle(color: Colors.grey, fontSize: 12)),
            const SizedBox(height: 12),
            Text('Tip: ${ex['tip']}', style: const TextStyle(fontSize: 13, fontStyle: FontStyle.italic, color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _buildCooldownCard() {
    return Card(
      color: Colors.blueGrey.withOpacity(0.1),
      child: ListTile(
        leading: const Icon(Icons.timer_outlined, color: Colors.blue),
        title: const Text('Cooldown'),
        subtitle: Text(_workoutPlan!['cooldown'] ?? 'Stretch'),
      ),
    );
  }
}

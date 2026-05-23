import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _todayPlan;
  String _errorMessage = '';

  @override
  void initState() {
    super.initState();
    _fetchTodayPlan();
  }

  Future<void> _fetchTodayPlan() async {
    setState(() {
      _isLoading = true;
      _errorMessage = '';
    });
    try {
      final storage = Provider.of<StorageService>(context, listen: false);
      final api = ApiService();
      final userId = storage.getUserId();
      if (userId != null) {
        final plan = await api.getTodayPlan(userId);
        setState(() {
          _todayPlan = plan;
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Failed to load today\'s plan. Tap to retry.';
        _isLoading = false;
      });
    }
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }

  @override
  Widget build(BuildContext context) {
    final storage = Provider.of<StorageService>(context);
    final userName = storage.getUserName() ?? 'Friend';

    return Scaffold(
      bottomNavigationBar: _buildBottomNav(),
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: _fetchTodayPlan,
          color: const Color(0xFF4CAF50),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildHeader(userName),
                const SizedBox(height: 24),
                if (_isLoading) _buildSkeleton()
                else if (_errorMessage.isNotEmpty) _buildErrorCard()
                else ...[
                  _buildCalorieCard(),
                  const SizedBox(height: 20),
                  _buildMealPreviewCard(),
                  const SizedBox(height: 20),
                  _buildWorkoutPreviewCard(),
                  const SizedBox(height: 20),
                  _buildQuickLogSection(),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(String name) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${_getGreeting()}, $name', 
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            Text(DateFormat('EEEE, d MMMM').format(DateTime.now()), 
              style: const TextStyle(color: Colors.grey)),
          ],
        ),
        IconButton(
          icon: const Icon(Icons.settings_outlined, color: Colors.grey),
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildCalorieCard() {
    final target = _todayPlan?['meal_plan']?['total_calories'] ?? 2800;
    // Mocking logged calories for now
    const logged = 1200;
    final progress = logged / target;

    return Card(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: const BorderSide(color: Color(0xFF4CAF50), width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Daily Calorie Progress', style: TextStyle(fontSize: 16, color: Colors.grey)),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('$logged / $target', style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                const Text('cal', style: TextStyle(color: Colors.grey)),
              ],
            ),
            const SizedBox(height: 16),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 12,
                backgroundColor: Colors.grey[900],
                valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF4CAF50)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMealPreviewCard() {
    final meals = (_todayPlan?['meal_plan']?['meals'] as List?) ?? [];
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('What to eat today', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            if (meals.isEmpty) 
              const Text('No meals planned yet.', style: TextStyle(color: Colors.grey))
            else 
              ...meals.take(2).map((meal) => ListTile(
                contentPadding: EdgeInsets.zero,
                leading: const Icon(Icons.restaurant, color: Color(0xFF4CAF50)),
                title: Text(meal['name'] ?? ''),
                subtitle: Text('${meal['time']} • ${meal['calories']} cal'),
              )),
            const SizedBox(height: 10),
            TextButton(
              onPressed: () => Navigator.pushNamed(context, '/meals'),
              style: TextButton.styleFrom(foregroundColor: const Color(0xFF4CAF50)),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('See full plan'),
                  Icon(Icons.chevron_right, size: 20),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildWorkoutPreviewCard() {
    final workout = _todayPlan?['workout_plan'];
    final name = workout?['workout_name'] ?? 'Full Body Build';
    final duration = workout?['duration_minutes'] ?? 25;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Today\'s workout', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            Row(
              children: [
                const Icon(Icons.fitness_center, color: Color(0xFF4CAF50), size: 32),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w500)),
                    Text('$duration minutes • No equipment', style: const TextStyle(color: Colors.grey)),
                  ],
                ),
                const Spacer(),
                const Icon(Icons.check_circle, color: Colors.grey), // Change to green if done
              ],
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.pushNamed(context, '/workout'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4CAF50).withOpacity(0.1),
                foregroundColor: const Color(0xFF4CAF50),
                minimumSize: const Size(double.infinity, 48),
                elevation: 0,
              ),
              child: const Text('Start workout'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickLogSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Quick Log', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
        const SizedBox(height: 16),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            _buildQuickLogButton(Icons.monitor_weight, 'Weight', _showWeightSheet),
            _buildQuickLogButton(Icons.kitchen, 'Kitchen', _showKitchenSheet),
            _buildQuickLogButton(Icons.done_all, 'Done', () {}),
          ],
        ),
      ],
    );
  }

  Widget _buildQuickLogButton(IconData icon, String label, VoidCallback onTap) {
    return Column(
      children: [
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(30),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A1A),
              shape: BoxType.circle == BoxType.circle ? BoxShape.circle : BoxShape.rectangle,
              border: Border.all(color: Colors.grey[800]!),
            ),
            child: Icon(icon, color: const Color(0xFF4CAF50)),
          ),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      ],
    );
  }

  void _showWeightSheet() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1A1A1A),
      builder: (context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Log Today\'s Weight', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            const TextField(
              keyboardType: TextInputType.number,
              decoration: InputDecoration(
                labelText: 'Weight (kg)',
                suffixText: 'kg',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4CAF50),
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text('SAVE'),
            ),
          ],
        ),
      ),
    );
  }

  void _showKitchenSheet() {
    // Reusing kitchen MCQ concept
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1A1A1A),
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        height: MediaQuery.of(context).size.height * 0.7,
        child: Column(
          children: [
            const Text('Update Kitchen Inventory', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            Expanded(
              child: ListView(
                children: [
                  CheckboxListTile(title: const Text('Eggs'), value: true, onChanged: (v) {}, activeColor: const Color(0xFF4CAF50)),
                  CheckboxListTile(title: const Text('Milk'), value: true, onChanged: (v) {}, activeColor: const Color(0xFF4CAF50)),
                  CheckboxListTile(title: const Text('Chicken'), value: false, onChanged: (v) {}, activeColor: const Color(0xFF4CAF50)),
                  // Add more...
                ],
              ),
            ),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4CAF50),
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text('UPDATE'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomNav() {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      backgroundColor: const Color(0xFF0A0A0A),
      selectedItemColor: const Color(0xFF4CAF50),
      unselectedItemColor: Colors.grey,
      currentIndex: 0,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
        BottomNavigationBarItem(icon: Icon(Icons.restaurant), label: 'Meals'),
        BottomNavigationBarItem(icon: Icon(Icons.fitness_center), label: 'Workout'),
        BottomNavigationBarItem(icon: Icon(Icons.bar_chart), label: 'Progress'),
      ],
      onTap: (index) {
        if (index == 1) Navigator.pushNamed(context, '/meals');
        if (index == 2) Navigator.pushNamed(context, '/workout');
        if (index == 3) Navigator.pushNamed(context, '/progress');
      },
    );
  }

  Widget _buildSkeleton() {
    return Column(
      children: List.generate(3, (index) => Container(
        height: 150,
        margin: const EdgeInsets.only(bottom: 20),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A1A),
          borderRadius: BorderRadius.circular(16),
        ),
      )),
    );
  }

  Widget _buildErrorCard() {
    return GestureDetector(
      onTap: _fetchTodayPlan,
      child: Card(
        color: Colors.red.withOpacity(0.1),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16), side: const BorderSide(color: Colors.red)),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            children: [
              const Icon(Icons.error_outline, color: Colors.red),
              const SizedBox(width: 12),
              Expanded(child: Text(_errorMessage, style: const TextStyle(color: Colors.red))),
            ],
          ),
        ),
      ),
    );
  }
}

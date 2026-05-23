import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class MealScreen extends StatefulWidget {
  const MealScreen({super.key});

  @override
  State<MealScreen> createState() => _MealScreenState();
}

class _MealScreenState extends State<MealScreen> {
  bool _isLoading = true;
  Map<String, dynamic>? _mealPlan;
  final Set<int> _eatenMeals = {};

  @override
  void initState() {
    super.initState();
    _fetchMeals();
  }

  Future<void> _fetchMeals() async {
    setState(() => _isLoading = true);
    try {
      final storage = Provider.of<StorageService>(context, listen: false);
      final api = ApiService();
      final plan = await api.getTodayPlan(storage.getUserId()!);
      setState(() {
        _mealPlan = plan?['meal_plan'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _regenerate() async {
    setState(() => _isLoading = true);
    try {
      final storage = Provider.of<StorageService>(context, listen: false);
      final api = ApiService();
      final plan = await api.regeneratePlan(storage.getUserId()!);
      setState(() {
        _mealPlan = plan?['meal_plan'];
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _logMeal(int index, Map meal) async {
    final storage = Provider.of<StorageService>(context, listen: false);
    final api = ApiService();
    final success = await api.logMeal(storage.getUserId()!, Map<String, dynamic>.from(meal));
    if (success) {
      setState(() => _eatenMeals.add(index));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Today\'s Meals'),
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator(color: Color(0xFF4CAF50)))
        : _buildContent(),
    );
  }

  Widget _buildContent() {
    if (_mealPlan == null) return const Center(child: Text('No meal plan found.'));
    
    final meals = (_mealPlan!['meals'] as List?) ?? [];
    
    return Column(
      children: [
        _buildSummaryRow(),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: meals.length,
            itemBuilder: (context, index) => _buildMealCard(index, meals[index]),
          ),
        ),
        Padding(
          padding: const EdgeInsets.all(16.0),
          child: TextButton(
            onPressed: _regenerate,
            child: const Text('Not happy with this plan? Regenerate', style: TextStyle(color: Colors.grey)),
          ),
        ),
      ],
    );
  }

  Widget _buildSummaryRow() {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 16),
      color: const Color(0xFF1A1A1A),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildStatColumn('Calories', '${_mealPlan!['total_calories']}'),
          _buildStatColumn('Protein', '${_mealPlan!['protein_est']}g'),
          _buildStatColumn('Status', '${_eatenMeals.length}/${(_mealPlan!['meals'] as List).length} eaten'),
        ],
      ),
    );
  }

  Widget _buildStatColumn(String label, String value) {
    return Column(
      children: [
        Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Color(0xFF4CAF50))),
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 12)),
      ],
    );
  }

  Widget _buildMealCard(int index, Map meal) {
    bool isEaten = _eatenMeals.contains(index);
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(meal['time'] ?? '', style: const TextStyle(color: Color(0xFF4CAF50), fontWeight: FontWeight.bold)),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: const Color(0xFF4CAF50).withOpacity(0.1), borderRadius: BorderRadius.circular(4)),
                  child: Text('${meal['calories']} cal', style: const TextStyle(color: Color(0xFF4CAF50), fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(meal['name'] ?? '', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ... (meal['items'] as List).map((item) => Text('• $item', style: const TextStyle(color: Colors.grey))),
            const SizedBox(height: 12),
            Text(meal['instructions'] ?? '', style: const TextStyle(fontSize: 12, color: Colors.grey, fontStyle: FontStyle.italic)),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: isEaten ? null : () => _logMeal(index, meal),
              style: ElevatedButton.styleFrom(
                backgroundColor: isEaten ? Colors.green : const Color(0xFF1A1A1A),
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 44),
                side: BorderSide(color: isEaten ? Colors.transparent : const Color(0xFF4CAF50)),
              ),
              child: Text(isEaten ? 'EATEN' : 'MARK AS EATEN'),
            ),
          ],
        ),
      ),
    );
  }
}

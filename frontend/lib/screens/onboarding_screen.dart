import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;
  bool _isLoading = false;

  // Form Data
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _ageController = TextEditingController();
  double _height = 170;
  double _weight = 60;
  
  String _bodyType = 'ectomorph';
  String _goal = 'gain_weight';
  
  TimeOfDay _wakeTime = const TimeOfDay(hour: 8, minute: 0);
  TimeOfDay _sleepTime = const TimeOfDay(hour: 23, minute: 0);
  TimeOfDay _uniStart = const TimeOfDay(hour: 9, minute: 0);
  TimeOfDay _uniEnd = const TimeOfDay(hour: 17, minute: 0);
  bool _noFixedSchedule = false;

  final Map<String, bool> _kitchenItems = {
    'Roti / Atta': false,
    'Rice': false,
    'Bread': false,
    'Paratha': false,
    'Eggs': false,
    'Chicken': false,
    'Lobia': false,
    'Daal': false,
    'Milk': false,
    'Dahi': false,
    'Aloo': false,
    'Pyaz': false,
    'Tamatar': false,
    'Saag': false,
  };

  void _nextPage() {
    if (_currentPage < 4) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _submit();
    }
  }

  Future<void> _submit() async {
    setState(() => _isLoading = true);
    try {
      final storage = Provider.of<StorageService>(context, listen: false);
      final api = ApiService();

      final userData = {
        'name': _nameController.text,
        'age': int.tryParse(_ageController.text) ?? 25,
        'height_cm': _height,
        'weight_kg': _weight,
        'body_type': _bodyType,
        'goal': _goal,
        'activity_level': 'moderate',
        'schedule': {
          'wake_time': _wakeTime.format(context),
          'sleep_time': _sleepTime.format(context),
          'university_start': _noFixedSchedule ? null : _uniStart.format(context),
          'university_end': _noFixedSchedule ? null : _uniEnd.format(context),
        },
        'kitchen_items': _kitchenItems,
      };

      final userId = await api.registerUser(userData);
      if (userId != null) {
        await storage.saveUserId(userId);
        await storage.saveUserName(_nameController.text);
        await storage.setOnboardingDone(true);
        if (mounted) Navigator.pushReplacementNamed(context, '/home');
      } else {
        throw Exception('Failed to register user');
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: ${e.toString()}'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Column(
          children: [
            LinearProgressIndicator(
              value: (_currentPage + 1) / 5,
              backgroundColor: Colors.grey[900],
              valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFF4CAF50)),
            ),
            Expanded(
              child: PageView(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                onPageChanged: (int page) => setState(() => _currentPage = page),
                children: [
                  _buildPage1(),
                  _buildPage2(),
                  _buildPage3(),
                  _buildPage4(),
                  _buildPage5(),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(24.0),
              child: ElevatedButton(
                onPressed: _isLoading ? null : _nextPage,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4CAF50),
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: _isLoading 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : Text(_currentPage == 4 ? 'GET STARTED' : 'CONTINUE'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPage1() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Qawam', style: TextStyle(fontSize: 48, fontWeight: FontWeight.bold, color: Color(0xFF4CAF50))),
          const Text('Built for you. Not for everyone.', style: TextStyle(fontSize: 18, color: Colors.grey)),
          const SizedBox(height: 40),
          TextField(
            controller: _nameController,
            decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 20),
          TextField(
            controller: _ageController,
            keyboardType: TextInputType.number,
            decoration: const InputDecoration(labelText: 'Age', border: OutlineInputBorder()),
          ),
          const SizedBox(height: 30),
          Text('Height: ${_height.round()} cm'),
          Slider(
            value: _height,
            min: 140,
            max: 220,
            activeColor: const Color(0xFF4CAF50),
            onChanged: (v) => setState(() => _height = v),
          ),
          const SizedBox(height: 20),
          Text('Weight: ${_weight.round()} kg'),
          Slider(
            value: _weight,
            min: 30,
            max: 150,
            activeColor: const Color(0xFF4CAF50),
            onChanged: (v) => setState(() => _weight = v),
          ),
        ],
      ),
    );
  }

  Widget _buildPage2() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('What best describes you?', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 30),
          _buildSelectionCard('Skinny & Hard to gain weight', 'ectomorph', Icons.accessibility_new),
          _buildSelectionCard('Average build', 'mesomorph', Icons.accessibility),
          _buildSelectionCard('Gain weight easily', 'endomorph', Icons.accessibility_rounded),
        ],
      ),
    );
  }

  Widget _buildSelectionCard(String title, String value, IconData icon) {
    bool isSelected = _bodyType == value;
    return GestureDetector(
      onTap: () => setState(() => _bodyType = value),
      child: Card(
        color: isSelected ? const Color(0xFF4CAF50).withOpacity(0.2) : const Color(0xFF1A1A1A),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: isSelected ? const Color(0xFF4CAF50) : Colors.transparent, width: 2),
        ),
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Row(
            children: [
              Icon(icon, color: isSelected ? const Color(0xFF4CAF50) : Colors.white, size: 32),
              const SizedBox(width: 20),
              Text(title, style: const TextStyle(fontSize: 16)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPage3() {
    return Padding(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('What is your goal?', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 30),
          _buildGoalCard('Gain weight & build muscle', 'gain_weight'),
          _buildGoalCard('Lose fat & get lean', 'lose_weight'),
          _buildGoalCard('Stay fit & maintain', 'maintain'),
        ],
      ),
    );
  }

  Widget _buildGoalCard(String title, String value) {
    bool isSelected = _goal == value;
    return GestureDetector(
      onTap: () => setState(() => _goal = value),
      child: Card(
        color: isSelected ? const Color(0xFF4CAF50).withOpacity(0.2) : const Color(0xFF1A1A1A),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: isSelected ? const Color(0xFF4CAF50) : Colors.transparent, width: 2),
        ),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20.0),
          child: Text(title, style: const TextStyle(fontSize: 16)),
        ),
      ),
    );
  }

  Widget _buildPage4() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Tell me your day', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 30),
          _buildTimeTile('Wake up time', _wakeTime, (t) => setState(() => _wakeTime = t)),
          _buildTimeTile('Sleep time', _sleepTime, (t) => setState(() => _sleepTime = t)),
          const Divider(height: 40),
          CheckboxListTile(
            title: const Text("I don't have a fixed schedule"),
            value: _noFixedSchedule,
            activeColor: const Color(0xFF4CAF50),
            onChanged: (v) => setState(() => _noFixedSchedule = v!),
          ),
          if (!_noFixedSchedule) ...[
            _buildTimeTile('University/Work Start', _uniStart, (t) => setState(() => _uniStart = t)),
            _buildTimeTile('University/Work End', _uniEnd, (t) => setState(() => _uniEnd = t)),
          ],
        ],
      ),
    );
  }

  Widget _buildTimeTile(String title, TimeOfDay time, Function(TimeOfDay) onSelect) {
    return ListTile(
      title: Text(title),
      trailing: Text(time.format(context), style: const TextStyle(color: Color(0xFF4CAF50), fontWeight: FontWeight.bold, fontSize: 18)),
      onTap: () async {
        final picked = await showTimePicker(context: context, initialTime: time);
        if (picked != null) onSelect(picked);
      },
    );
  }

  Widget _buildPage5() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text("What's in your kitchen?", style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 20),
          ..._kitchenItems.keys.map((item) {
            return CheckboxListTile(
              title: Text(item),
              value: _kitchenItems[item],
              activeColor: const Color(0xFF4CAF50),
              onChanged: (v) => setState(() => _kitchenItems[item] = v!),
            );
          }),
        ],
      ),
    );
  }
}

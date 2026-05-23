import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  final SharedPreferences _prefs;

  StorageService(this._prefs);

  static const String _keyUserId = 'user_id';
  static const String _keyUserName = 'user_name';
  static const String _keyOnboardingDone = 'onboarding_done';

  Future<void> saveUserId(String userId) async {
    await _prefs.setString(_keyUserId, userId);
  }

  String? getUserId() {
    return _prefs.getString(_keyUserId);
  }

  Future<void> saveUserName(String name) async {
    await _prefs.setString(_keyUserName, name);
  }

  String? getUserName() {
    return _prefs.getString(_keyUserName);
  }

  Future<void> setOnboardingDone(bool done) async {
    await _prefs.setBool(_keyOnboardingDone, done);
  }

  bool isOnboardingDone() {
    return _prefs.getBool(_keyOnboardingDone) ?? false;
  }

  Future<void> clearAll() async {
    await _prefs.clear();
  }
}

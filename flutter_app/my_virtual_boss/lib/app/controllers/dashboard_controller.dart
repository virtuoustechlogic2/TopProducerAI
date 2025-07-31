import 'package:get/get.dart';

// Data Models
class DashboardStats {
  final double quarterlyProgress;
  final int todayTasksCompleted;
  final int todayTasksTotal;
  final int totalContacts;
  final int newContactsToday;
  final double quarterlyIncome;
  final double quarterlyGoal;

  DashboardStats({
    required this.quarterlyProgress,
    required this.todayTasksCompleted,
    required this.todayTasksTotal,
    required this.totalContacts,
    required this.newContactsToday,
    required this.quarterlyIncome,
    required this.quarterlyGoal,
  });
}

class Task {
  final int id;
  final String title;
  final String description;
  final String category;
  final String scheduledTime;
  final bool isCompleted;

  Task({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.scheduledTime,
    required this.isCompleted,
  });
}

class Activity {
  final int id;
  final String type;
  final String description;
  final String createdAt;

  Activity({
    required this.id,
    required this.type,
    required this.description,
    required this.createdAt,
  });
}

class Affirmation {
  final String text;
  final String? author;

  Affirmation({required this.text, this.author});
}

class DashboardController extends GetxController {
  // Observables for state management
  var stats = Rx<DashboardStats?>(null);
  var tasks = RxList<Task>([]);
  var activities = RxList<Activity>([]);
  var affirmation = Rx<Affirmation?>(null);
  var isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    fetchDashboardData();
  }

  Future<void> fetchDashboardData() async {
    try {
      isLoading(true);
      // Simulate network delay
      await Future.delayed(const Duration(seconds: 1));

      // Placeholder data
      stats.value = DashboardStats(
        quarterlyProgress: 50.0,
        todayTasksCompleted: 3,
        todayTasksTotal: 5,
        totalContacts: 120,
        newContactsToday: 2,
        quarterlyIncome: 15000.0,
        quarterlyGoal: 30000.0,
      );

      tasks.value = [
        Task(id: 1, title: 'Morning Preparation & Goal Review', description: '', category: 'Personal Development', scheduledTime: '8:00 AM', isCompleted: true),
        Task(id: 2, title: 'FSBO Cold Calls', description: '', category: 'Lead Generation', scheduledTime: '9:00 AM', isCompleted: false),
      ];

      activities.value = [
        Activity(id: 1, type: 'contact_added', description: 'You added a new contact: John Doe', createdAt: '2 hours ago'),
        Activity(id: 2, type: 'task_completed', description: 'Task Completed: Follow up with Jane Smith', createdAt: '4 hours ago'),
      ];

      affirmation.value = Affirmation(text: "My potential is limitless.");

    } finally {
      isLoading(false);
    }
  }

  void toggleTaskCompletion(int taskId) {
    final taskIndex = tasks.indexWhere((task) => task.id == taskId);
    if (taskIndex != -1) {
      final task = tasks[taskIndex];
      tasks[taskIndex] = Task(
        id: task.id,
        title: task.title,
        description: task.description,
        category: task.category,
        scheduledTime: task.scheduledTime,
        isCompleted: !task.isCompleted,
      );
    }
  }
}

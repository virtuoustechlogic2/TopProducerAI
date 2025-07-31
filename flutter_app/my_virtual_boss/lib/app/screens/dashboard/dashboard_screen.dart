import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:my_virtual_boss/app/controllers/dashboard_controller.dart';
import 'package:my_virtual_boss/app/widgets/quick_stats_card.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final DashboardController controller = Get.put(DashboardController());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }
        return SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildMotivationBanner(controller.affirmation.value),
              const SizedBox(height: 24),
              _buildQuickStatsGrid(controller.stats.value),
              const SizedBox(height: 24),
              _buildTodaysSchedule(context, controller),
              const SizedBox(height: 24),
              _buildRightSidebar(context),
            ],
          ),
        );
      }),
    );
  }

  Widget _buildMotivationBanner(Affirmation? affirmation) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        gradient: const LinearGradient(
          colors: [Colors.blue, Colors.blueAccent],
        ),
      ),
      child: Row(
        children: [
          const Icon(LucideIcons.quote, color: Colors.white70),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  affirmation?.text ?? "My potential is limitless.",
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  "Daily Affirmation",
                  style: TextStyle(color: Colors.white.withOpacity(0.9)),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(LucideIcons.refreshCw, color: Colors.white),
            onPressed: () {
              // TODO: Implement refresh affirmation
            },
          )
        ],
      ),
    );
  }

  Widget _buildQuickStatsGrid(DashboardStats? stats) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 16,
      mainAxisSpacing: 16,
      children: [
        QuickStatsCard(
          title: 'Q1 Progress',
          value: '${stats?.quarterlyProgress.toStringAsFixed(0) ?? '0'}%',
          icon: LucideIcons.target,
          color: Colors.orange,
        ),
        QuickStatsCard(
          title: "Today's Tasks",
          value: '${stats?.todayTasksCompleted ?? 0}/${stats?.todayTasksTotal ?? 0}',
          icon: LucideIcons.checkCircle,
          color: Colors.green,
        ),
        QuickStatsCard(
          title: 'CRM Contacts',
          value: stats?.totalContacts.toString() ?? '0',
          icon: LucideIcons.users,
          color: Colors.purple,
        ),
        QuickStatsCard(
          title: 'This Quarter',
          value: '\$${stats?.quarterlyIncome.toStringAsFixed(0) ?? '0'}',
          icon: LucideIcons.dollarSign,
          color: Colors.blue,
        ),
      ],
    );
  }

  Widget _buildTodaysSchedule(BuildContext context, DashboardController controller) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Today\'s Schedule',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            ...controller.tasks.map((task) => _buildTaskItem(task, controller)),
          ],
        ),
      ),
    );
  }

  Widget _buildTaskItem(Task task, DashboardController controller) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Row(
        children: [
          Checkbox(
            value: task.isCompleted,
            onChanged: (bool? value) {
              controller.toggleTaskCompletion(task.id);
            },
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  task.title,
                  style: TextStyle(
                    decoration:
                        task.isCompleted ? TextDecoration.lineThrough : null,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  task.category,
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
          Text(task.scheduledTime),
        ],
      ),
    );
  }

  Widget _buildRightSidebar(BuildContext context) {
    return Column(
      children: [
        _buildQuickCrmActions(context),
        const SizedBox(height: 24),
        _buildRecentActivity(context),
        const SizedBox(height: 24),
        _buildIncomeGoalProgress(context),
      ],
    );
  }

  Widget _buildQuickCrmActions(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Quick CRM Actions',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            _buildActionItem(
                icon: LucideIcons.userPlus, text: 'Add New Contact'),
            _buildActionItem(
                icon: LucideIcons.phone, text: 'View Follow-ups Due'),
            _buildActionItem(
                icon: LucideIcons.calculator, text: 'Real Estate Tools'),
          ],
        ),
      ),
    );
  }

  Widget _buildRecentActivity(BuildContext context) {
    final DashboardController controller = Get.find();
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Recent Activity',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            ...controller.activities.map((activity) => _buildActivityItem(activity)),
          ],
        ),
      ),
    );
  }

  Widget _buildIncomeGoalProgress(BuildContext context) {
    final DashboardController controller = Get.find();
    final stats = controller.stats.value;
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Q1 Income Goal',
                style: Theme.of(context).textTheme.titleLarge),
            const SizedBox(height: 16),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Progress'),
                Text('${stats?.quarterlyProgress.toStringAsFixed(0) ?? '0'}%'),
              ],
            ),
            const SizedBox(height: 8),
            LinearProgressIndicator(
              value: (stats?.quarterlyProgress ?? 0) / 100,
              minHeight: 10,
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Current: \$${stats?.quarterlyIncome.toStringAsFixed(0) ?? '0'}'),
                Text('Goal: \$${stats?.quarterlyGoal.toStringAsFixed(0) ?? '0'}'),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActionItem({required IconData icon, required String text}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: TextButton.icon(
        onPressed: () {},
        icon: Icon(icon),
        label: Text(text),
        style: TextButton.styleFrom(
          foregroundColor: Colors.black,
          alignment: Alignment.centerLeft,
        ),
      ),
    );
  }

  Widget _buildActivityItem(Activity activity) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        children: [
          Icon(_getIconForActivity(activity.type), size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(activity.description),
                const SizedBox(height: 4),
                Text(
                  activity.createdAt,
                  style: const TextStyle(color: Colors.grey, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getIconForActivity(String type) {
    switch (type) {
      case 'contact_added':
        return LucideIcons.userPlus;
      case 'task_completed':
        return LucideIcons.checkCircle;
      default:
        return LucideIcons.activity;
    }
  }
}

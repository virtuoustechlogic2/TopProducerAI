import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_flutter/lucide_flutter.dart';

import '../dashboard/dashboard_screen.dart';
import '../tasks/tasks_screen.dart';
import '../crm/crm_screen.dart';
import '../goals/goals_screen.dart';
import '../income/income_screen.dart';
import '../tools/tools_screen.dart';
import '../training/training_screen.dart';
import '../../controllers/home_controller.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final HomeController controller = Get.put(HomeController());

    final List<Widget> screens = [
      const DashboardScreen(),
      const TasksScreen(),
      const CrmScreen(),
      const GoalsScreen(),
      const IncomeScreen(),
      const ToolsScreen(),
      const TrainingScreen(),
    ];

    return Scaffold(
      body: Obx(() => IndexedStack(
            index: controller.selectedIndex.value,
            children: screens,
          )),
      bottomNavigationBar: Obx(() => NavigationBar(
            onDestinationSelected: (int index) {
              controller.selectedIndex.value = index;
            },
            selectedIndex: controller.selectedIndex.value,
            destinations: const <Widget>[
              NavigationDestination(
                icon: Icon(LucideIcons.home),
                label: 'Dashboard',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.checkSquare),
                label: 'Tasks',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.users),
                label: 'CRM',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.target),
                label: 'Goals',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.dollarSign),
                label: 'Income',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.calculator),
                label: 'Tools',
              ),
              NavigationDestination(
                icon: Icon(LucideIcons.graduationCap),
                label: 'Training',
              ),
            ],
          )),
    );
  }
}

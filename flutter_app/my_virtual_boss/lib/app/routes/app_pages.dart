import 'package:get/get.dart';

import '../screens/dashboard/dashboard_screen.dart';
import '../screens/tasks/tasks_screen.dart';
import '../screens/crm/crm_screen.dart';
import '../screens/goals/goals_screen.dart';
import '../screens/income/income_screen.dart';
import '../screens/tools/tools_screen.dart';
import '../screens/training/training_screen.dart';
import '../screens/landing/landing_screen.dart';
import '../screens/home/home_screen.dart';
import '../screens/crm/add_edit_contact_screen.dart';
import '../screens/tools/investment_analysis_screen.dart';

part 'app_routes.dart';

class AppPages {
  static const INITIAL = Routes.LANDING;

  static final routes = [
    GetPage(
      name: Routes.LANDING,
      page: () => const LandingScreen(),
    ),
    GetPage(
      name: Routes.HOME,
      page: () => const HomeScreen(),
    ),
    GetPage(
      name: Routes.DASHBOARD,
      page: () => const DashboardScreen(),
    ),
    GetPage(
      name: Routes.TASKS,
      page: () => const TasksScreen(),
    ),
    GetPage(
      name: Routes.CRM,
      page: () => const CrmScreen(),
    ),
    GetPage(
      name: Routes.GOALS,
      page: () => const GoalsScreen(),
    ),
    GetPage(
      name: Routes.INCOME,
      page: () => const IncomeScreen(),
    ),
    GetPage(
      name: Routes.TOOLS,
      page: () => const ToolsScreen(),
    ),
    GetPage(
      name: Routes.TRAINING,
      page: () => const TrainingScreen(),
    ),
    GetPage(
      name: Routes.ADD_EDIT_CONTACT,
      page: () => AddEditContactScreen(),
    ),
    GetPage(
      name: Routes.INVESTMENT_ANALYSIS,
      page: () => const InvestmentAnalysisScreen(),
    ),
  ];
}

import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:my_virtual_boss/app/routes/app_pages.dart';

class ToolsScreen extends StatelessWidget {
  const ToolsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final tools = [
      {'title': 'Investment Analysis', 'icon': LucideIcons.trendingUp},
      {'title': 'Prequalification Calculator', 'icon': LucideIcons.home},
      {'title': 'Seller\'s Net Sheet', 'icon': LucideIcons.dollarSign},
      {'title': 'Quick CMA Tool', 'icon': LucideIcons.barChart3},
    ];

    return Scaffold(
      appBar: AppBar(
        title: const Text('Tools'),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16.0),
        itemCount: tools.length,
        itemBuilder: (context, index) {
          final tool = tools[index];
          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            child: ListTile(
              leading: Icon(tool['icon'] as IconData),
              title: Text(tool['title'] as String),
              trailing: const Icon(LucideIcons.chevronRight),
              onTap: () {
                if (tool['title'] == 'Investment Analysis') {
                  Get.toNamed(Routes.INVESTMENT_ANALYSIS);
                }
              },
            ),
          );
        },
      ),
    );
  }
}

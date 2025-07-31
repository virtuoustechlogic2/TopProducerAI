import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'package:my_virtual_boss/app/controllers/crm_controller.dart';
import 'package:my_virtual_boss/app/routes/app_pages.dart';

class CrmScreen extends StatelessWidget {
  const CrmScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final CrmController controller = Get.put(CrmController());

    return Scaffold(
      appBar: AppBar(
        title: const Text('CRM'),
        actions: [
          IconButton(
            icon: const Icon(LucideIcons.search),
            onPressed: () {
              // TODO: Implement search
            },
          ),
          IconButton(
            icon: const Icon(LucideIcons.filter),
            onPressed: () {
              // TODO: Implement filter
            },
          ),
        ],
      ),
      body: Obx(() {
        if (controller.isLoading.value) {
          return const Center(child: CircularProgressIndicator());
        }
        return ListView(
          padding: const EdgeInsets.all(16.0),
          children: [
            _buildStatsCards(),
            const SizedBox(height: 16),
            _buildContactList(controller),
          ],
        );
      }),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Get.toNamed(Routes.ADD_EDIT_CONTACT);
        },
        child: const Icon(LucideIcons.userPlus),
      ),
    );
  }

  Widget _buildStatsCards() {
    return const Row(
      mainAxisAlignment: MainAxisAlignment.spaceAround,
      children: [
        _StatCard(title: 'Total Contacts', value: '120', icon: LucideIcons.users),
        _StatCard(title: 'Follow-ups', value: '5', icon: LucideIcons.clock),
        _StatCard(title: 'High Priority', value: '12', icon: LucideIcons.star),
      ],
    );
  }

  Widget _buildContactList(CrmController controller) {
    return ListView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: controller.contacts.length,
      itemBuilder: (context, index) {
        final contact = controller.contacts[index];
        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: ListTile(
            leading: const CircleAvatar(child: Icon(LucideIcons.user)),
            title: Text(contact.fullName),
            subtitle: Text(contact.category),
            trailing: IconButton(
              icon: const Icon(LucideIcons.phone),
              onPressed: () {},
            ),
          ),
        );
      },
    );
  }
}

class _StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;

  const _StatCard({
    required this.title,
    required this.value,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 30, color: Theme.of(context).primaryColor),
        const SizedBox(height: 8),
        Text(value, style: Theme.of(context).textTheme.headlineSmall),
        const SizedBox(height: 4),
        Text(title, style: const TextStyle(color: Colors.grey)),
      ],
    );
  }
}

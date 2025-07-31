import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:my_virtual_boss/app/controllers/investment_analysis_controller.dart';

class InvestmentAnalysisScreen extends StatelessWidget {
  const InvestmentAnalysisScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final InvestmentAnalysisController controller =
        Get.put(InvestmentAnalysisController());

    return Scaffold(
      appBar: AppBar(
        title: const Text('Investment Analysis'),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            _buildPropertyInfoSection(controller),
            const SizedBox(height: 20),
            _buildUnitDetailsSection(controller),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                controller.calculate();
              },
              child: const Text('Calculate'),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildPropertyInfoSection(InvestmentAnalysisController controller) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Property Information',
                style: Theme.of(Get.context!).textTheme.titleLarge),
            const SizedBox(height: 16),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Asking Price'),
              keyboardType: TextInputType.number,
              onChanged: (value) =>
                  controller.propertyValue.value = double.tryParse(value) ?? 0,
            ),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Down Payment'),
              keyboardType: TextInputType.number,
              onChanged: (value) =>
                  controller.downPayment.value = double.tryParse(value) ?? 0,
            ),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Closing Costs'),
              keyboardType: TextInputType.number,
              onChanged: (value) =>
                  controller.closingCosts.value = double.tryParse(value) ?? 0,
            ),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Renovation Costs'),
              keyboardType: TextInputType.number,
              onChanged: (value) =>
                  controller.renovationCosts.value = double.tryParse(value) ?? 0,
            ),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Number of Units'),
              keyboardType: TextInputType.number,
              onChanged: (value) =>
                  controller.numberOfUnits.value = int.tryParse(value) ?? 1,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUnitDetailsSection(InvestmentAnalysisController controller) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Unit Details',
                style: Theme.of(Get.context!).textTheme.titleLarge),
            const SizedBox(height: 16),
            Obx(
              () => ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: controller.units.length,
                itemBuilder: (context, index) {
                  final unit = controller.units[index];
                  return _buildUnitInput(unit);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUnitInput(UnitData unit) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      child: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          children: [
            Text('Unit ${unit.id}'),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Current Rent'),
              keyboardType: TextInputType.number,
              onChanged: (value) =>
                  unit.currentRent.value = double.tryParse(value) ?? 0,
            ),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Repair Costs'),
              keyboardType: TextInputType.number,
              onChanged: (value) =>
                  unit.repairCosts.value = double.tryParse(value) ?? 0,
            ),
            TextFormField(
              decoration: const InputDecoration(labelText: 'Potential Rent'),
              keyboardType: TextInputType.number,
              onChanged: (value) =>
                  unit.potentialRent.value = double.tryParse(value) ?? 0,
            ),
          ],
        ),
      ),
    );
  }
}

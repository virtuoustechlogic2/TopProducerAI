import 'package:get/get.dart';

// Data Models
class UnitData {
  final int id;
  var currentRent = 0.0.obs;
  var repairCosts = 0.0.obs;
  var potentialRent = 0.0.obs;

  UnitData({required this.id});
}

class CalculationResults {
  // Add all result fields here
}

class InvestmentAnalysisController extends GetxController {
  // Property Information
  var propertyValue = 0.0.obs;
  var downPayment = 0.0.obs;
  var closingCosts = 0.0.obs;
  var renovationCosts = 0.0.obs;
  var numberOfUnits = 1.obs;

  // Units
  var units = <UnitData>[].obs;

  // Income
  var otherIncome = 0.0.obs;

  // Expenses
  var insurance = 0.0.obs;
  var propertyTaxes = 0.0.obs;
  var maintenance = 0.0.obs;
  var managementPercent = 0.0.obs;
  var vacancy = 0.0.obs;

  // Financing
  var loanAmount = 0.0.obs;
  var interestRate = 0.0.obs;
  var loanTerm = 0.0.obs;

  // Results
  var results = Rx<CalculationResults?>(null);
  var showResults = false.obs;

  @override
  void onInit() {
    super.onInit();
    // Initialize with one unit
    units.add(UnitData(id: 1));

    // Listen to changes in numberOfUnits to update the units list
    ever(numberOfUnits, (int count) {
      if (count > units.length) {
        for (int i = units.length; i < count; i++) {
          units.add(UnitData(id: i + 1));
        }
      } else if (count < units.length) {
        units.removeRange(count, units.length);
      }
    });
  }

  void calculate() {
    // TODO: Implement calculation logic here
    showResults(true);
  }

  void reset() {
    // TODO: Implement reset logic here
    showResults(false);
  }
}

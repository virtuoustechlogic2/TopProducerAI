import 'package:get/get.dart';

class Contact {
  final int id;
  final String firstName;
  final String lastName;
  final String? email;
  final String? phone;
  final String category;

  Contact({
    required this.id,
    required this.firstName,
    required this.lastName,
    this.email,
    this.phone,
    required this.category,
  });

  String get fullName => '$firstName $lastName';
}

class CrmController extends GetxController {
  var contacts = RxList<Contact>([]);
  var isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    fetchContacts();
  }

  Future<void> fetchContacts() async {
    try {
      isLoading(true);
      await Future.delayed(const Duration(seconds: 1)); // Simulate network delay

      // Placeholder data
      contacts.value = [
        Contact(id: 1, firstName: 'John', lastName: 'Doe', category: 'Buyer', phone: '555-1234'),
        Contact(id: 2, firstName: 'Jane', lastName: 'Smith', category: 'Seller', phone: '555-5678'),
        Contact(id: 3, firstName: 'Peter', lastName: 'Jones', category: 'Investor', phone: '555-9876'),
      ];
    } finally {
      isLoading(false);
    }
  }

  void addContact(Contact contact) {
    contacts.add(contact);
  }
}

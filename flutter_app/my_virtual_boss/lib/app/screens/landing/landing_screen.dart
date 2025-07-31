import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:my_virtual_boss/app/routes/app_pages.dart';

class LandingScreen extends StatelessWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text('Landing Screen'),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Get.offAllNamed(Routes.HOME);
              },
              child: const Text('Login'),
            ),
          ],
        ),
      ),
    );
  }
}

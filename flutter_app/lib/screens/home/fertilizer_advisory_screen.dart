import 'package:flutter/material.dart';

class FertilizerAdvisoryScreen extends StatefulWidget {
  const FertilizerAdvisoryScreen({Key? key}) : super(key: key);

  @override
  State<FertilizerAdvisoryScreen> createState() => _FertilizerAdvisoryScreenState();
}

class _FertilizerAdvisoryScreenState extends State<FertilizerAdvisoryScreen> {
  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(title: const Text('Fertilizer Advisory')),
      body: const Center(child: Text('Fertilizer Advisory Screen')),
    );
}

import 'package:flutter/material.dart';

class CropAdvisoryScreen extends StatefulWidget {
  const CropAdvisoryScreen({Key? key}) : super(key: key);

  @override
  State<CropAdvisoryScreen> createState() => _CropAdvisoryScreenState();
}

class _CropAdvisoryScreenState extends State<CropAdvisoryScreen> {
  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(title: const Text('Crop Advisory')),
      body: const Center(child: Text('Crop Advisory Screen')),
    );
}

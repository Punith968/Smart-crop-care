import 'package:flutter/material.dart';

class PriceEstimationScreen extends StatefulWidget {
  const PriceEstimationScreen({Key? key}) : super(key: key);

  @override
  State<PriceEstimationScreen> createState() => _PriceEstimationScreenState();
}

class _PriceEstimationScreenState extends State<PriceEstimationScreen> {
  @override
  Widget build(BuildContext context) => Scaffold(
      appBar: AppBar(title: const Text('Price Estimation')),
      body: const Center(child: Text('Price Estimation Screen')),
    );
}

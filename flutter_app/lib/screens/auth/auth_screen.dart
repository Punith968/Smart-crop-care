import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/theme/app_theme.dart';
import '../../providers/auth_provider.dart';

class AuthScreen extends ConsumerStatefulWidget {
  const AuthScreen({super.key, this.initialTabIndex = 0});
  final int initialTabIndex;

  @override
  ConsumerState<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends ConsumerState<AuthScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTabIndex.clamp(0, 1).toInt(),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppTheme.bgDark : AppTheme.bgLight;

    return Scaffold(
      backgroundColor: bg,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            children: [
              // ── Hero section ──────────────────────────────────────────
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(28, 48, 28, 36),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Brand mark
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.forestDark : AppTheme.forest,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'FCA',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                          color:
                              isDark ? const Color(0xFF08110D) : Colors.white,
                          letterSpacing: 2,
                        ),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'SMART CROP INTELLIGENCE SUITE',
                      style: Theme.of(context).textTheme.labelSmall?.copyWith(
                            color:
                                isDark ? AppTheme.forestDark : AppTheme.forest,
                            letterSpacing: 2,
                          ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Premium farm advisory for your crop-care system.',
                      style: Theme.of(context).textTheme.displaySmall,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Crop recommendation, fertilizer strategy, cost estimation, and disease diagnostics — all in one place.',
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                    const SizedBox(height: 24),
                    // Feature ribbon
                    const Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        _FeatureChip('Crop recommendation'),
                        _FeatureChip('Fertilizer strategy'),
                        _FeatureChip('Cost estimation'),
                        _FeatureChip('Disease diagnostics'),
                      ],
                    ),
                  ],
                ),
              ),

              // ── Auth card ─────────────────────────────────────────────
              Container(
                margin: const EdgeInsets.fromLTRB(16, 0, 16, 32),
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.panelDark : AppTheme.panelLight,
                  borderRadius: BorderRadius.circular(28),
                  border: Border.all(
                    color: isDark
                        ? const Color(0x14FFFFFF)
                        : const Color(0x1C324338),
                  ),
                ),
                child: Column(
                  children: [
                    // Tab bar
                    Padding(
                      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                      child: Container(
                        decoration: BoxDecoration(
                          color: isDark
                              ? const Color(0x0CFFFFFF)
                              : const Color(0x0C324338),
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: TabBar(
                          controller: _tabController,
                          indicator: BoxDecoration(
                            color:
                                isDark ? AppTheme.forestDark : AppTheme.forest,
                            borderRadius: BorderRadius.circular(14),
                          ),
                          indicatorSize: TabBarIndicatorSize.tab,
                          labelColor:
                              isDark ? const Color(0xFF08110D) : Colors.white,
                          unselectedLabelColor:
                              isDark ? AppTheme.mutedDark : AppTheme.mutedLight,
                          labelStyle: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                          ),
                          dividerColor: Colors.transparent,
                          tabs: const [
                            Tab(text: 'Sign In'),
                            Tab(text: 'Register'),
                          ],
                        ),
                      ),
                    ),
                    SizedBox(
                      height: 420,
                      child: TabBarView(
                        controller: _tabController,
                        children: const [
                          _LoginForm(),
                          _RegisterForm(),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Feature chip ──────────────────────────────────────────────────────────────

class _FeatureChip extends StatelessWidget {
  const _FeatureChip(this.label);
  final String label;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isDark ? const Color(0x14FFFFFF) : const Color(0x14324338),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isDark ? const Color(0x14FFFFFF) : const Color(0x1C324338),
        ),
      ),
      child: Text(
        label,
        style: Theme.of(context).textTheme.labelSmall?.copyWith(
              letterSpacing: 0.5,
            ),
      ),
    );
  }
}

// ── Login form ────────────────────────────────────────────────────────────────

class _LoginForm extends ConsumerStatefulWidget {
  const _LoginForm();

  @override
  ConsumerState<_LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends ConsumerState<_LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _usernameCtrl = TextEditingController(text: 'farmer');
  final _passwordCtrl = TextEditingController(text: 'farmer123');
  bool _loading = false;
  String? _error;
  bool _obscure = true;

  @override
  void dispose() {
    _usernameCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      debugPrint('[LoginForm] Form validation failed');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final username = _usernameCtrl.text.trim();
      final password = _passwordCtrl.text;

      debugPrint('[LoginForm] ➜ Starting login with username=$username');

      // Call login - this updates the auth state
      await ref.read(authNotifierProvider.notifier).login(username, password);

      debugPrint('[LoginForm] ✓ Login API call succeeded');

      // Wait a frame for state to propagate
      await Future.delayed(const Duration(milliseconds: 100));

      if (!mounted) {
        debugPrint('[LoginForm] ✗ Widget not mounted after login');
        return;
      }

      final authState = ref.read(authNotifierProvider);
      debugPrint('[LoginForm] Auth state after login: isAuth=${authState.isAuthenticated}, user=${authState.user?.username}');

      if (authState.isAuthenticated) {
        debugPrint('[LoginForm] ✓ Login confirmed: user is authenticated');
        // Router will handle navigation automatically
        // Just reset loading state
        if (mounted) {
          setState(() => _loading = false);
        }
      } else {
        debugPrint('[LoginForm] ✗ Auth state shows NOT authenticated after login!');
        if (mounted) {
          setState(() {
            _error = 'Login failed: Authentication not confirmed';
            _loading = false;
          });
        }
      }

    } catch (e, stackTrace) {
      debugPrint('[LoginForm] ✗ Login error: $e');
      debugPrint('[LoginForm] Stack trace: $stackTrace');

      if (mounted) {
        setState(() {
          _error = 'Login failed: ${e.toString()}';
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Welcome back',
                  style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 4),
              Text('Use your credentials to open the advisory cockpit.',
                  style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 24),
              TextFormField(
                controller: _usernameCtrl,
                decoration: const InputDecoration(labelText: 'USERNAME'),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _passwordCtrl,
                obscureText: _obscure,
                decoration: InputDecoration(
                  labelText: 'PASSWORD',
                  suffixIcon: IconButton(
                    icon: Icon(
                        _obscure ? Icons.visibility_off : Icons.visibility,
                        size: 18),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                ),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!,
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                        fontSize: 13)),
              ],
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Text('Open dashboard'),
              ),
              const SizedBox(height: 12),
              Text(
                'Demo: farmer / farmer123',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ),
        ),
      );
}

// ── Register form ─────────────────────────────────────────────────────────────

class _RegisterForm extends ConsumerStatefulWidget {
  const _RegisterForm();

  @override
  ConsumerState<_RegisterForm> createState() => _RegisterFormState();
}

class _RegisterFormState extends ConsumerState<_RegisterForm> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;
  String? _error;
  bool _obscure = true;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _usernameCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      debugPrint('[RegisterForm] Form validation failed');
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final username = _usernameCtrl.text.trim();
      final password = _passwordCtrl.text;
      final fullName = _nameCtrl.text.trim().isEmpty ? null : _nameCtrl.text.trim();

      debugPrint('[RegisterForm] ➜ Starting registration with username=$username');

      // Call register - this updates the auth state
      await ref.read(authNotifierProvider.notifier).register(username, password, fullName);

      debugPrint('[RegisterForm] ✓ Registration API call succeeded');

      // Wait a frame for state to propagate
      await Future.delayed(const Duration(milliseconds: 100));

      if (!mounted) {
        debugPrint('[RegisterForm] ✗ Widget not mounted after registration');
        return;
      }

      final authState = ref.read(authNotifierProvider);
      debugPrint('[RegisterForm] Auth state after registration: isAuth=${authState.isAuthenticated}, user=${authState.user?.username}');

      if (authState.isAuthenticated) {
        debugPrint('[RegisterForm] ✓ Registration confirmed: user is authenticated');
        // Router will handle navigation automatically
        // Just reset loading state
        if (mounted) {
          setState(() => _loading = false);
        }
      } else {
        debugPrint('[RegisterForm] ✗ Auth state shows NOT authenticated after registration!');
        if (mounted) {
          setState(() {
            _error = 'Registration failed: Authentication not confirmed';
            _loading = false;
          });
        }
      }

    } catch (e, stackTrace) {
      debugPrint('[RegisterForm] ✗ Registration error: $e');
      debugPrint('[RegisterForm] Stack trace: $stackTrace');

      if (mounted) {
        setState(() {
          _error = 'Registration failed: ${e.toString()}';
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('Create access',
                  style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 4),
              Text('Register to keep reports and advisory history per user.',
                  style: Theme.of(context).textTheme.bodySmall),
              const SizedBox(height: 20),
              TextFormField(
                controller: _nameCtrl,
                decoration:
                    const InputDecoration(labelText: 'FULL NAME (optional)'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _usernameCtrl,
                decoration: const InputDecoration(labelText: 'USERNAME'),
                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _passwordCtrl,
                obscureText: _obscure,
                decoration: InputDecoration(
                  labelText: 'PASSWORD',
                  suffixIcon: IconButton(
                    icon: Icon(
                        _obscure ? Icons.visibility_off : Icons.visibility,
                        size: 18),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                ),
                validator: (v) =>
                    v == null || v.length < 6 ? 'Minimum 6 characters' : null,
              ),
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!,
                    style: TextStyle(
                        color: Theme.of(context).colorScheme.error,
                        fontSize: 13)),
              ],
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(
                        height: 18,
                        width: 18,
                        child: CircularProgressIndicator(
                            strokeWidth: 2, color: Colors.white))
                    : const Text('Create account'),
              ),
            ],
          ),
        ),
      );
}

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../config/theme/app_theme.dart';
import '../../providers/auth_provider.dart';
import 'advisory_screen.dart';
import 'disease_screen.dart';
import 'reports_screen.dart';

class DashboardScreen extends ConsumerStatefulWidget {
  const DashboardScreen({super.key});

  @override
  ConsumerState<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends ConsumerState<DashboardScreen> {
  int _selectedIndex = 0;

  static const _tabs = [
    _TabItem(
        icon: Icons.eco_outlined, activeIcon: Icons.eco, label: 'Advisory'),
    _TabItem(
        icon: Icons.biotech_outlined,
        activeIcon: Icons.biotech,
        label: 'Disease'),
    _TabItem(
        icon: Icons.folder_outlined,
        activeIcon: Icons.folder,
        label: 'Reports'),
  ];

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final user = authState.user;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.bgDark : AppTheme.bgLight,
      body: SafeArea(
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 800),
            child: Column(
              children: [
                // ── Top bar ───────────────────────────────────────────────
                _TopBar(
                  user: user?.displayName ?? 'Farmer',
                  handle: '@${user?.username ?? 'farmer'}',
                  onLogout: () async {
                    await ref.read(authNotifierProvider.notifier).logout();
                    if (context.mounted) {
                      GoRouter.of(context).go('/login');
                    }
                  },
                  onThemeToggle: () =>
                      ref.read(themeModeProvider.notifier).toggle(),
                  isDark: isDark,
                ),

                // ── Nav chips ─────────────────────────────────────────────
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Row(
                    children: List.generate(_tabs.length, (i) {
                      final tab = _tabs[i];
                      final active = _selectedIndex == i;
                      return Expanded(
                        child: Padding(
                          padding:
                              EdgeInsets.only(right: i < _tabs.length - 1 ? 8 : 0),
                          child: _NavChip(
                            icon: active ? tab.activeIcon : tab.icon,
                            label: tab.label,
                            active: active,
                            onTap: () => setState(() => _selectedIndex = i),
                          ),
                        ),
                      );
                    }),
                  ),
                ),

                // ── Content ───────────────────────────────────────────────
                Expanded(
                  child: IndexedStack(
                    index: _selectedIndex,
                    children: const [
                      AdvisoryScreen(),
                      DiseaseScreen(),
                      ReportsScreen(),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ── Top bar ───────────────────────────────────────────────────────────────────

class _TopBar extends StatelessWidget {
  const _TopBar({
    required this.user,
    required this.handle,
    required this.onLogout,
    required this.onThemeToggle,
    required this.isDark,
  });
  final String user;
  final String handle;
  final VoidCallback onLogout;
  final VoidCallback onThemeToggle;
  final bool isDark;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 16, 4),
        child: Row(
          children: [
            // Brand
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: isDark ? AppTheme.forestDark : AppTheme.forest,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                'FCA',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  color: isDark ? const Color(0xFF08110D) : Colors.white,
                  letterSpacing: 1.5,
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Farmer Crop Advisory',
                    style: Theme.of(context).textTheme.labelSmall?.copyWith(
                          color:
                              isDark ? AppTheme.mutedDark : AppTheme.mutedLight,
                        ),
                  ),
                  Text(
                    'Operations cockpit',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ],
              ),
            ),
            // User info
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(user, style: Theme.of(context).textTheme.labelLarge),
                Text(handle, style: Theme.of(context).textTheme.bodySmall),
              ],
            ),
            const SizedBox(width: 8),
            // Theme toggle
            IconButton(
              onPressed: onThemeToggle,
              icon: Icon(
                isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
                size: 20,
              ),
              tooltip: isDark ? 'Light mode' : 'Dark mode',
            ),
            // Logout
            IconButton(
              onPressed: onLogout,
              icon: const Icon(Icons.logout, size: 20),
              tooltip: 'Logout',
            ),
          ],
        ),
      );
}

// ── Nav chip ──────────────────────────────────────────────────────────────────

class _NavChip extends StatelessWidget {
  const _NavChip({
    required this.icon,
    required this.label,
    required this.active,
    required this.onTap,
  });
  final IconData icon;
  final String label;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primary = isDark ? AppTheme.forestDark : AppTheme.forest;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        decoration: BoxDecoration(
          color: active
              ? primary
              : (isDark ? const Color(0x0CFFFFFF) : const Color(0x0C324338)),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: active
                ? primary
                : (isDark ? const Color(0x14FFFFFF) : const Color(0x1C324338)),
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              size: 16,
              color: active
                  ? (isDark ? const Color(0xFF08110D) : Colors.white)
                  : (isDark ? AppTheme.mutedDark : AppTheme.mutedLight),
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w800,
                color: active
                    ? (isDark ? const Color(0xFF08110D) : Colors.white)
                    : (isDark ? AppTheme.mutedDark : AppTheme.mutedLight),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _TabItem {
  const _TabItem(
      {required this.icon, required this.activeIcon, required this.label});
  final IconData icon;
  final IconData activeIcon;
  final String label;
}

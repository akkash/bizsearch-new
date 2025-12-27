/**
 * Supabase Diagnostic Utility
 * 
 * Provides detailed logging and connectivity checks for Supabase
 * to help diagnose timeout and connection issues.
 */

import { supabase } from './supabase';

interface DiagnosticResult {
    test: string;
    status: 'success' | 'error' | 'timeout';
    duration: number;
    error?: string;
    details?: any;
}

interface FullDiagnosticReport {
    timestamp: string;
    supabaseUrl: string;
    results: DiagnosticResult[];
    summary: {
        total: number;
        passed: number;
        failed: number;
        avgDuration: number;
    };
}

const TIMEOUT_MS = 8000; // 8 second timeout for each test

/**
 * Run a single diagnostic test with timeout
 */
async function runTest<T>(
    name: string,
    testFn: () => Promise<T>
): Promise<DiagnosticResult> {
    const startTime = performance.now();

    console.log(`🔬 [Diagnostic] Starting: ${name}`);

    try {
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), TIMEOUT_MS)
        );

        await Promise.race([testFn(), timeoutPromise]);

        const duration = Math.round(performance.now() - startTime);
        console.log(`✅ [Diagnostic] ${name}: Passed (${duration}ms)`);

        return {
            test: name,
            status: 'success',
            duration,
        };
    } catch (error: any) {
        const duration = Math.round(performance.now() - startTime);
        const isTimeout = error.message === 'TIMEOUT';

        console.error(`❌ [Diagnostic] ${name}: ${isTimeout ? 'TIMEOUT' : 'FAILED'} (${duration}ms)`, error.message);

        return {
            test: name,
            status: isTimeout ? 'timeout' : 'error',
            duration,
            error: error.message,
        };
    }
}

/**
 * Test 1: Basic network connectivity to Supabase
 */
async function testNetworkConnectivity(): Promise<void> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    // Simple fetch to Supabase health endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
        headers: {
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
}

/**
 * Test 2: Supabase Auth - Get Session
 */
async function testAuthGetSession(): Promise<void> {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw error;
    }

    console.log(`   Session exists: ${!!data.session}`);
}

/**
 * Test 3: Supabase Auth - Get User
 */
async function testAuthGetUser(): Promise<void> {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
        throw error;
    }

    console.log(`   User exists: ${!!data.user}`);
}

/**
 * Test 4: Database - Simple query (no RLS)
 * Uses a public endpoint to test basic DB connectivity
 */
async function testDatabasePing(): Promise<void> {
    // Query the profiles table with a limit of 0 to test connectivity without RLS issues
    const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

    if (error) {
        throw error;
    }
}

/**
 * Test 5: Database - User's own profile (tests RLS)
 */
async function testProfileFetch(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.log('   Skipping: No authenticated user');
        return;
    }

    const { data, error } = await supabase
        .from('profiles')
        .select('id, email, display_name')
        .eq('id', user.id)
        .single();

    if (error) {
        throw error;
    }

    console.log(`   Profile found: ${data?.display_name || data?.email}`);
}

/**
 * Test 6: Database - Count query (simpler than full fetch)
 */
async function testProfileCount(): Promise<void> {
    const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    if (error) {
        throw error;
    }

    console.log(`   Total profiles: ${count}`);
}

/**
 * Run a quick connectivity check (single test)
 * Use this for fast checks before operations
 */
export async function quickConnectivityCheck(): Promise<boolean> {
    try {
        const startTime = performance.now();

        const response = await Promise.race([
            fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/`, {
                method: 'HEAD',
                headers: {
                    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
                },
            }),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('Quick check timeout')), 3000)
            ),
        ]);

        const duration = Math.round(performance.now() - startTime);

        if (!response.ok) {
            console.warn(`🌐 Supabase connectivity: HTTP ${response.status} (${duration}ms)`);
            return false;
        }

        console.log(`🌐 Supabase connectivity: OK (${duration}ms)`);
        return true;
    } catch (error) {
        console.error('🌐 Supabase connectivity: FAILED', error);
        return false;
    }
}

/**
 * Run full diagnostic suite
 * Call this from browser console: window.runSupabaseDiagnostics()
 */
export async function runFullDiagnostics(): Promise<FullDiagnosticReport> {
    console.log('\n========================================');
    console.log('🔬 SUPABASE DIAGNOSTICS');
    console.log('========================================\n');
    console.log(`🕐 Started at: ${new Date().toISOString()}`);
    console.log(`📍 Supabase URL: ${import.meta.env.VITE_SUPABASE_URL}`);
    console.log('\n');

    const results: DiagnosticResult[] = [];

    // Run tests sequentially
    results.push(await runTest('Network Connectivity', testNetworkConnectivity));
    results.push(await runTest('Auth: Get Session', testAuthGetSession));
    results.push(await runTest('Auth: Get User', testAuthGetUser));
    results.push(await runTest('Database: Ping', testDatabasePing));
    results.push(await runTest('Database: Profile Count', testProfileCount));
    results.push(await runTest('Database: User Profile (RLS)', testProfileFetch));

    // Calculate summary
    const passed = results.filter(r => r.status === 'success').length;
    const failed = results.length - passed;
    const avgDuration = Math.round(
        results.reduce((sum, r) => sum + r.duration, 0) / results.length
    );

    const report: FullDiagnosticReport = {
        timestamp: new Date().toISOString(),
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        results,
        summary: {
            total: results.length,
            passed,
            failed,
            avgDuration,
        },
    };

    // Print summary
    console.log('\n========================================');
    console.log('📊 SUMMARY');
    console.log('========================================');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Average Duration: ${report.summary.avgDuration}ms`);

    if (failed > 0) {
        console.log('\n⚠️ FAILED TESTS:');
        results
            .filter(r => r.status !== 'success')
            .forEach(r => console.log(`   - ${r.test}: ${r.status} (${r.error})`));
    }

    console.log('\n========================================\n');

    // Store in window for easy access
    (window as any).__supabaseDiagnosticReport = report;
    console.log('💾 Report stored in: window.__supabaseDiagnosticReport');

    return report;
}

/**
 * Wrap a Supabase operation with detailed timing logs
 */
export function withTiming<T>(
    operationName: string,
    operation: () => Promise<T>
): Promise<T> {
    const startTime = performance.now();
    console.log(`⏱️ [${operationName}] Starting...`);

    return operation()
        .then((result) => {
            const duration = Math.round(performance.now() - startTime);
            console.log(`⏱️ [${operationName}] Completed in ${duration}ms`);
            return result;
        })
        .catch((error) => {
            const duration = Math.round(performance.now() - startTime);
            console.error(`⏱️ [${operationName}] Failed after ${duration}ms:`, error.message);
            throw error;
        });
}

// Expose to window for console access
if (typeof window !== 'undefined') {
    (window as any).runSupabaseDiagnostics = runFullDiagnostics;
    (window as any).quickSupabaseCheck = quickConnectivityCheck;

    console.log('🔧 Supabase diagnostics available:');
    console.log('   - window.runSupabaseDiagnostics() - Run full diagnostic suite');
    console.log('   - window.quickSupabaseCheck() - Quick connectivity test');
}

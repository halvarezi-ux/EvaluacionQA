<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Evaluation;
use App\Models\Feedback;
use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MetricsController extends Controller
{
    /**
     * Get dashboard metrics.
     */
    public function dashboard()
    {
        $totalUsers = User::count();
        $activeUsers = User::where('is_active', true)->count();
        $totalEvaluations = Evaluation::count();
        $activeEvaluations = Evaluation::whereIn('status', ['pending', 'in_progress'])->count();
        $completedEvaluations = Evaluation::where('status', 'completed')->count();
        $averageScore = Evaluation::where('status', 'completed')->avg('score');
        $pendingFeedback = Feedback::where('is_read', false)->count();

        // Recent activity (last 10 evaluations)
        $recentActivity = Evaluation::with(['evaluator', 'evaluatedUser'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Evaluations by status
        $evaluationsByStatus = Evaluation::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status');

        return response()->json([
            'success' => true,
            'data' => [
                'total_users' => $totalUsers,
                'active_users' => $activeUsers,
                'total_evaluations' => $totalEvaluations,
                'active_evaluations' => $activeEvaluations,
                'completed_evaluations' => $completedEvaluations,
                'average_score' => round($averageScore ?? 0, 2),
                'pending_feedback' => $pendingFeedback,
                'evaluations_by_status' => $evaluationsByStatus,
                'recent_activity' => $recentActivity,
            ],
        ]);
    }

    /**
     * Get user metrics.
     */
    public function users()
    {
        // Users by department
        $byDepartment = User::select('department', DB::raw('count(*) as total'))
            ->whereNotNull('department')
            ->groupBy('department')
            ->get()
            ->pluck('total', 'department');

        // Users by role
        $byRole = DB::table('role_user')
            ->join('roles', 'role_user.role_id', '=', 'roles.id')
            ->select('roles.name', DB::raw('count(*) as total'))
            ->groupBy('roles.name')
            ->get()
            ->pluck('total', 'name');

        // Active vs inactive
        $activeStatus = User::select('is_active', DB::raw('count(*) as total'))
            ->groupBy('is_active')
            ->get()
            ->pluck('total', 'is_active');

        // Top evaluators
        $topEvaluators = User::withCount(['evaluationsAsEvaluator' => function ($query) {
            $query->where('status', 'completed');
        }])
            ->orderBy('evaluations_as_evaluator_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'by_department' => $byDepartment,
                'by_role' => $byRole,
                'active_status' => $activeStatus,
                'top_evaluators' => $topEvaluators,
            ],
        ]);
    }

    /**
     * Get evaluation metrics.
     */
    public function evaluations()
    {
        // Evaluations by status
        $byStatus = Evaluation::select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->get()
            ->pluck('total', 'status');

        // Average scores by form
        $averageScoresByForm = Evaluation::join('forms', 'evaluations.form_id', '=', 'forms.id')
            ->where('evaluations.status', 'completed')
            ->select('forms.name', DB::raw('AVG(evaluations.score) as average_score'), DB::raw('count(*) as total'))
            ->groupBy('forms.name')
            ->get();

        // Completion rate
        $total = Evaluation::count();
        $completed = Evaluation::where('status', 'completed')->count();
        $completionRate = $total > 0 ? round(($completed / $total) * 100, 2) : 0;

        // Evaluations over time (last 30 days)
        $trends = Evaluation::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('count(*) as total')
        )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Score distribution
        $scoreDistribution = Evaluation::where('status', 'completed')
            ->select(
                DB::raw('CASE 
                    WHEN score >= 90 THEN "90-100"
                    WHEN score >= 80 THEN "80-89"
                    WHEN score >= 70 THEN "70-79"
                    WHEN score >= 60 THEN "60-69"
                    ELSE "Below 60"
                END as score_range'),
                DB::raw('count(*) as total')
            )
            ->groupBy('score_range')
            ->get()
            ->pluck('total', 'score_range');

        return response()->json([
            'success' => true,
            'data' => [
                'by_status' => $byStatus,
                'average_scores_by_form' => $averageScoresByForm,
                'completion_rate' => $completionRate,
                'trends' => $trends,
                'score_distribution' => $scoreDistribution,
            ],
        ]);
    }

    /**
     * Get feedback metrics.
     */
    public function feedback()
    {
        // Feedback by type
        $byType = Feedback::select('type', DB::raw('count(*) as total'))
            ->groupBy('type')
            ->get()
            ->pluck('total', 'type');

        // Read vs unread
        $readStatus = Feedback::select('is_read', DB::raw('count(*) as total'))
            ->groupBy('is_read')
            ->get()
            ->pluck('total', 'is_read');

        // Feedback over time (last 30 days)
        $trends = Feedback::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('count(*) as total')
        )
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Most active feedback givers
        $topGivers = User::withCount('feedbackSent')
            ->orderBy('feedback_sent_count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'by_type' => $byType,
                'read_status' => $readStatus,
                'trends' => $trends,
                'top_givers' => $topGivers,
            ],
        ]);
    }
}

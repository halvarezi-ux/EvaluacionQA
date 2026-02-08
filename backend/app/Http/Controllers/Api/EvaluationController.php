<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Evaluation;
use App\Models\EvaluationResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class EvaluationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $query = Evaluation::with(['form', 'evaluator', 'evaluatedUser']);

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filter by evaluator
        if ($request->has('evaluator_id')) {
            $query->where('evaluator_id', $request->evaluator_id);
        }

        // Filter by evaluated user
        if ($request->has('evaluated_user_id')) {
            $query->where('evaluated_user_id', $request->evaluated_user_id);
        }

        $evaluations = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $evaluations,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'form_id' => 'required|exists:forms,id',
            'evaluated_user_id' => 'required|exists:users,id',
            'comments' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $evaluation = Evaluation::create([
            'form_id' => $request->form_id,
            'evaluator_id' => auth()->id(),
            'evaluated_user_id' => $request->evaluated_user_id,
            'status' => 'pending',
            'comments' => $request->comments,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Evaluation created successfully',
            'data' => $evaluation->load(['form', 'evaluator', 'evaluatedUser']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $evaluation = Evaluation::with([
            'form.fields',
            'evaluator',
            'evaluatedUser',
            'responses.formField'
        ])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $evaluation,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $evaluation = Evaluation::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'comments' => 'nullable|string',
            'status' => 'sometimes|in:pending,in_progress,completed,cancelled',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $evaluation->update($request->only(['comments', 'status']));

        return response()->json([
            'success' => true,
            'message' => 'Evaluation updated successfully',
            'data' => $evaluation->load(['form', 'evaluator', 'evaluatedUser']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $evaluation = Evaluation::findOrFail($id);
        $evaluation->delete();

        return response()->json([
            'success' => true,
            'message' => 'Evaluation deleted successfully',
        ]);
    }

    /**
     * Store responses for an evaluation.
     */
    public function storeResponses(Request $request, string $id)
    {
        $evaluation = Evaluation::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'responses' => 'required|array',
            'responses.*.form_field_id' => 'required|exists:form_fields,id',
            'responses.*.response' => 'required|string',
            'responses.*.score' => 'nullable|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        DB::transaction(function () use ($evaluation, $request) {
            // Delete existing responses
            $evaluation->responses()->delete();

            // Create new responses
            foreach ($request->responses as $response) {
                $evaluation->responses()->create($response);
            }

            // Update evaluation status
            if ($evaluation->status === 'pending') {
                $evaluation->update([
                    'status' => 'in_progress',
                    'started_at' => now(),
                ]);
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Responses saved successfully',
            'data' => $evaluation->load('responses.formField'),
        ]);
    }

    /**
     * Submit evaluation as completed.
     */
    public function submit(string $id)
    {
        $evaluation = Evaluation::with('responses')->findOrFail($id);

        // Calculate total score
        $totalScore = $evaluation->responses->sum('score');

        $evaluation->update([
            'status' => 'completed',
            'score' => $totalScore,
            'completed_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Evaluation submitted successfully',
            'data' => [
                'id' => $evaluation->id,
                'status' => $evaluation->status,
                'score' => $evaluation->score,
                'completed_at' => $evaluation->completed_at,
            ],
        ]);
    }
}

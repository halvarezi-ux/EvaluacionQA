<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FeedbackController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $query = Feedback::with(['evaluation', 'fromUser', 'toUser']);

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by read status
        if ($request->has('is_read')) {
            $query->where('is_read', $request->is_read === 'true');
        }

        // Filter by receiver
        if ($request->has('to_user_id')) {
            $query->where('to_user_id', $request->to_user_id);
        }

        // Default: show feedback for current user
        if (!$request->has('to_user_id') && !$request->has('from_user_id')) {
            $query->where('to_user_id', auth()->id());
        }

        $feedback = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $feedback,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'evaluation_id' => 'required|exists:evaluations,id',
            'to_user_id' => 'required|exists:users,id',
            'message' => 'required|string',
            'type' => 'required|in:positive,constructive,improvement',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $feedback = Feedback::create([
            'evaluation_id' => $request->evaluation_id,
            'from_user_id' => auth()->id(),
            'to_user_id' => $request->to_user_id,
            'message' => $request->message,
            'type' => $request->type,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Feedback created successfully',
            'data' => $feedback->load(['evaluation', 'fromUser', 'toUser']),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $feedback = Feedback::with(['evaluation', 'fromUser', 'toUser'])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $feedback,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $feedback = Feedback::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'message' => 'sometimes|required|string',
            'type' => 'sometimes|required|in:positive,constructive,improvement',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $feedback->update($request->only(['message', 'type']));

        return response()->json([
            'success' => true,
            'message' => 'Feedback updated successfully',
            'data' => $feedback->load(['evaluation', 'fromUser', 'toUser']),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->delete();

        return response()->json([
            'success' => true,
            'message' => 'Feedback deleted successfully',
        ]);
    }

    /**
     * Mark feedback as read.
     */
    public function markAsRead(string $id)
    {
        $feedback = Feedback::findOrFail($id);

        // Only the receiver can mark as read
        if ($feedback->to_user_id !== auth()->id()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized action',
            ], 403);
        }

        $feedback->update(['is_read' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Feedback marked as read',
            'data' => $feedback,
        ]);
    }
}

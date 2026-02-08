<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Form;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class FormController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 15);
        $forms = Form::with('creator', 'fields')->paginate($perPage);

        return response()->json([
            'success' => true,
            'data' => $forms,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'fields' => 'required|array',
            'fields.*.label' => 'required|string',
            'fields.*.type' => 'required|string|in:text,textarea,select,radio,checkbox,date,number,email',
            'fields.*.options' => 'nullable|array',
            'fields.*.validation' => 'nullable|array',
            'fields.*.order' => 'nullable|integer',
            'fields.*.weight' => 'nullable|integer',
            'fields.*.is_required' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $form = Form::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name) . '-' . time(),
            'description' => $request->description,
            'is_active' => $request->is_active ?? true,
            'created_by' => auth()->id(),
        ]);

        foreach ($request->fields as $field) {
            $form->fields()->create($field);
        }

        return response()->json([
            'success' => true,
            'message' => 'Form created successfully',
            'data' => $form->load('fields'),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $form = Form::with('creator', 'fields')->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $form,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $form = Form::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'fields' => 'sometimes|array',
            'fields.*.label' => 'required|string',
            'fields.*.type' => 'required|string|in:text,textarea,select,radio,checkbox,date,number,email',
            'fields.*.options' => 'nullable|array',
            'fields.*.validation' => 'nullable|array',
            'fields.*.order' => 'nullable|integer',
            'fields.*.weight' => 'nullable|integer',
            'fields.*.is_required' => 'nullable|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors(),
            ], 422);
        }

        $form->update($request->except('fields'));

        if ($request->has('fields')) {
            $form->fields()->delete();
            foreach ($request->fields as $field) {
                $form->fields()->create($field);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Form updated successfully',
            'data' => $form->load('fields'),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $form = Form::findOrFail($id);
        $form->delete();

        return response()->json([
            'success' => true,
            'message' => 'Form deleted successfully',
        ]);
    }
}

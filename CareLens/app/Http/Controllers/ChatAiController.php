<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Services\ChatAiService;
use App\Services\ConversationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatAiController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required',
            'message' => 'required|string',
        ]);

        return response()->stream(function () use ($request) {

            app(ChatAiService::class)->handle(
                $request->conversation_id,
                $request->message
            );

        });
    }

    public function createConversation()
    {
        $id = app(ConversationService::class)->create(Auth::user()->id);

        return response()->json([
            'status' => true,
            'id' => $id,
        ]);
    }

    public function getConversation(Conversation $conversation)
    {

        $data = app(ConversationService::class)->get($conversation->id);

        return response()->json($data);
    }

    public function userConversations()
    {
        $conversations = Conversation::where('user_id', Auth::id())->get(['id', 'name']);
        return response()->json($conversations);
    }

    public function deletConversation(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required',
        ]);

        app(ConversationService::class)->delete(Auth::user()->id);
    }
}

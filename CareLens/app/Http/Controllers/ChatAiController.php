<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Services\ChatAiService;
use App\Services\ConversationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class ChatAiController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required|integer',
            'message' => 'required|string',
        ]);

        $conversation = Conversation::where('id', '=', $request->conversation_id, 'and')
            ->where('user_id', '=', Auth::id(), 'and')
            ->firstOrFail();

        $this->authorize('update', $conversation);

        return response()->stream(function () use ($conversation, $request) {
            app(ChatAiService::class)->handle(
                $conversation,
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
        $this->authorize('view', $conversation);

        $data = app(ConversationService::class)->get($conversation->id);
        return response()->json($data);
    }

    public function userConversations()
    {
        $today = Carbon::today();

        $todayConversations = Conversation::where('user_id', '=', Auth::id(), 'and')
            ->whereDate('created_at', $today)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name']);

        $historyConversations = Conversation::where('user_id', '=', Auth::id(), 'and')
            ->whereDate('created_at', '<', $today)
            ->orderBy('created_at', 'desc')
            ->get(['id', 'name']);

        return response()->json([
            'today'=>$todayConversations,
            'history'=> $historyConversations
            ]);
    }

    public function deletConversation(Request $request)
    {
        $request->validate([
            'conversation_id' => 'required',
        ]);

        app(ConversationService::class)->delete(Auth::user()->id);
    }
}


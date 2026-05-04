<?php

namespace App\Services;
use App\Models\Conversation;
use Illuminate\Support\Facades\Auth;

class ConversationService
{
    public function create($userId)
    {
        $conversation = Conversation::create([
            'user_id' => $userId,
        ]);
        return $conversation->id;
    }

    public function get($id)
    {
        return Conversation::with('messages')->where('id', $id)->where('user_id', Auth::user()->id)->first();
    }

    public function delete($id)
    {
        return Conversation::destroy($id);
    }
    
}

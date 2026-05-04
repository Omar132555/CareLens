<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;

class ChatAiService
{
    public function handle(int $conversationId, string $message)
    {
        $conversation = Conversation::find($conversationId);
        $found = true;
        if (! $conversation) {
            $conversation = Conversation::create(['user_id' => Auth::user()->id ?? 6]);
            $title = $this->generateTitle($message);
            $found = false;
            $conversation->update([
                'name' => $title,
            ]);
        }
        $userMsg = Message::create([
            'conversation_id' => $conversation->id,
            'role' => 'user',
            'content' => $message,
            'created_at' => now(),
        ]);

        $this->streamAI($conversation, $userMsg);
    }

    public function generateTitle(string $message)
    {
        $prompt = "Generate a title for the message below.
        STRICT RULES:
        - Return ONLY the title
        - Maximum 5 words
        - NO explanations
        - NO alternatives
        - NO extra text before or after
        - If you break the rules, output is invalid
            - No punctuation outside the title\n".$message;

        $res = Http::post('http://localhost:11434/api/generate', [
            'model' => 'phi3',
            'prompt' => $prompt,
            'stream' => false,
        ]);

        return trim($res['response']);
    }

    public function streamAI($conversation, $userMsg)
    {
        $client = new Client;

        $response = $client->post('http://localhost:11434/api/generate', [
            'json' => [
                'model' => 'phi3',
                'prompt' => $userMsg->content,
                'stream' => true,
            ],
            'stream' => true,
        ]);

        $body = $response->getBody();

        $full = '';

        while (! $body->eof()) {
            $chunk = $body->read(1024);
            $data = json_decode($chunk, true);

            if (isset($data['response'])) {
                $text = $data['response'];

                $full .= $text;

                echo $text;
                ob_flush();
                flush();
            }
        }
        Message::create([
            'conversation_id' => $conversation->id,
            'role' => 'assistant',
            'content' => $full,
            ]);
    //         $prompt = $userMsg->content;
    //         $res = Http::post('http://localhost:11434/api/generate', [
    //             'model' => 'phi3',
    //             'prompt' => $prompt,
    //             'stream' => false,
    //             ]);
    //             Message::create([
    //                 'conversation_id' => $conversation->id,
    //                 'role' => 'assistant',
    //                 'content' => $res['response'],
    //                 ]);

    // return response()->json([
    //     'response' => $res['response'],
    //     'user message' => $userMsg
    //     ]);

    }
}

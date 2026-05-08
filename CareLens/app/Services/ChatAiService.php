<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\Message;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ChatAiService
{
    public function handle(int $conversationId, string $message)
    {
        // $conversation = Conversation::where(
        //     'id',
        //     $conversationId
        // )->where(
        //     'user_id',
        //     Auth::id()
        // )->first();
        $conversation = Conversation::find($conversationId);
        $found = true;
        if (! $conversation) {
            $conversation = Conversation::create(['user_id' => Auth::user()->id]);
            $title = $this->generateTitle($message);
            $found = false;
            $conversation->update([
                'name' => $title,
            ]);
        }
        if (! $conversation->name) {
            $title = $this->generateTitle($message);
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
        $prompt = "Generate a title for just and only the message below.
        STRICT RULES:
        - Return ONLY the title
        - Maximum 5 words
        - NO explanations
        - NO alternatives
        - NO extra text before or after
        - If you break the rules, output is invalid
        - No punctuation outside the title\n Message: ".$message;

        $res = Http::post('http://localhost:11434/api/generate', [
            'model' => 'phi3',
            'prompt' => $prompt,
            'stream' => false,
        ]);
        $content = Str::limit($res['response'], 50);

        return trim($content);
    }

    public function streamAI($conversation, $userMsg)
    {
        header('Content-Type: text/plain; charset=utf-8');
        header('Cache-Control: no-cache');
        header('X-Accel-Buffering: no');
        // $messages = Message::where(
        //     'conversation_id',
        //     $conversation->id
        // )->orderBy('created_at')->get();
        // $prompt = '
        // You are a helpful medical AI assistant.
        // Keep responses concise and medically safe.

        // ';

        // foreach ($messages as $msg) {

        //     $role = $msg->role === 'user'
        //         ? 'User'
        //         : 'Assistant';

        //     $prompt .= $role.': '.$msg->content."\n";
        // }
        // $prompt .= 'Assistant:';
        if (ob_get_level()) {
            ob_end_clean();
        }

        try {
            $client = new Client([
                'timeout' => 0,
                'read_timeout' => 300,
            ]);

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

                if (! $chunk) {
                    continue;
                }

                $lines = explode("\n", $chunk);

                foreach ($lines as $line) {
                    $line = trim($line);

                    if (! $line) {
                        continue;
                    }

                    $data = json_decode($line, true);

                    if (isset($data['response'])) {
                        $text = $data['response'];
                        $full .= $text;

                        echo $text;

                        if (ob_get_level()) {
                            ob_flush();
                        }
                        flush();
                    }

                    if (isset($data['done']) && $data['done'] === true) {
                        break 2;
                    }
                }
            }

            if ($full) {
                Message::create([
                    'conversation_id' => $conversation->id,
                    'role' => 'assistant',
                    'content' => $full,
                ]);
            }

        } catch (\Exception $e) {

            echo 'Error: '.$e->getMessage();

            Log::error('AI Streaming Error', [
                'conversation_id' => $conversation->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

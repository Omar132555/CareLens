<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Http;

class RagService
{
    public function embed($text)
    {
        return Http::post('http://localhost:11434/api/embeddings', [
            'model' => 'nomic-embed-text',
            'prompt' => $text,
        ])->json()['embedding'];
    }

    public function chunk($text)
    {
        return str_split($text, 400);
    }

    public function search($question)
    {
        $embedding = $this->embed($question);

        $res = Http::post('http://localhost:8000/api/v1/collections/medical/query', [
            'query_embeddings' => [$embedding],
            'n_results' => 3,
        ]);

        return $res['documents'][0] ?? [];
    }

    public function ask($question)
    {
        // $context = $this->search($question);

        // if (!$context) {
        //     return 'Not Enough Info';
        // }

        // $prompt = "Answer ONLY using this context:\n"
        //     .implode("\n", $context)
        //     ."\n\nQuestion: ".$question;
        $prompt = $question;
        $res = Http::post('http://localhost:11434/api/generate', [
            'model' => 'phi3',
            'prompt' => $prompt,
            'stream' => false,
        ]);

        return $res['response'];
    }
}

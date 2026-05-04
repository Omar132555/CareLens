<?php

namespace App\Console\Commands;

use App\Services\RagService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
 

#[Signature('app:import-medical-data')]
#[Description('Command description')]
class ImportMedicalData extends Command
{
    /**
     * Execute the console command.
     */
    public function handle()
    {
        $text = file_get_contents(storage_path('app/medical.txt'));

        $chunks = app(RagService::class)->chunk($text);

        foreach ($chunks as $chunk) {

            $embedding = app(RagService::class)->embed($chunk);

            Http::post('http://localhost:8000/api/v1/collections/medical/add', [
                'documents' => [$chunk],
                'embeddings' => [$embedding],
                'ids' => [uniqid()],
            ]);
        }

        $this->info('Ingestion Done');
    }
}

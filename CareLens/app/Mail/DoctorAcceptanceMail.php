<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Attachment;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class DoctorAcceptanceMail extends Mailable
{
    use Queueable, SerializesModels;

    public $url;

    public $user;

    public $acceptance;

    public function __construct($user, $url, $acceptance)
    {
        $this->url = $url;
        $this->user = $user;
        $this->acceptance = $acceptance;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Doctor Acceptance Mail',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'mail.doctor-acceptance-mail',
            with: [
                'url' => $this->url,
                'acceptance' => $this->acceptance,
                'doctor' => $this->user
            ]
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

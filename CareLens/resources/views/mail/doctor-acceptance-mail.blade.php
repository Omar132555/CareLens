@if ($acceptance == true)    
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding:100px 0; font-family:'Manrope', Poppins, Arial, sans-serif;">
    <tr>
        <td align="center">

            <table width="600" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="font-size:48px; font-weight:900; padding-bottom:40px; color:#00796b;">
                        CareLens
                    </td>
                </tr>
            </table>

            <table width="600" cellpadding="0" cellspacing="0" 
                style="background-color:#ffffff; border-radius:16px; padding:40px 45px; border:1px solid #b2dfdb; box-shadow:0 2px 8px rgba(0,121,107,0.08);">

                <tr>
                    <td>
                        <h2 style="margin:0 0 10px 0; color:#263238; font-size:24px; font-weight:700;">Welcome to CareLens, Dr. {{ $doctor->name ?? 'Name' }}!</h2>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p style="color:#546e7a; margin:5px 0 35px 0; font-size:15px; line-height:1.6;">
                            We are thrilled to inform you that your application to join the CareLens provider network has been reviewed and successfully approved. Your credentials have been verified, and your profile is now active.
                        </p>
                    </td>
                </tr>

                <tr>
                    <td align="center">
                        <a href="{{ $dashboard_url ?? '' }}"
                           style="background-color:#00796b; color:white; padding:14px 32px; border-radius:8px; font-weight:700; text-decoration:none; display:inline-block; font-size:16px; transition:background-color 0.3s ease;">
                           Go to Doctor Dashboard
                        </a>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p style="color:#546e7a; margin-top:35px; margin-bottom:0; font-size:14px; line-height:1.6;">
                            You can now log in using your registered credentials to set up your digital clinic, define your consultation hours, and start managing appointments.
                        </p>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p style="color:#e0871f; margin-top:12px; font-weight:600; font-size:14px;">
                            Security Note: <strong>Please ensure you complete your profile setup securely.</strong> CareLens administrators will never ask for your password via email.
                        </p>
                    </td>
                </tr>

                <tr>
                    <td>
                        <div style="border:1px solid #b2dfdb; margin:30px 0;"></div>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p style="color:#546e7a; margin:0; font-size:13px; line-height:1.6;">
                            If you're having trouble clicking the "Go to Doctor Dashboard" button, copy and paste the URL below into your web browser:
                            <br><br>
                            <a href="{{ $dashboard_url ?? '' }}" style="color:#00796b; word-break:break-all; text-decoration:none; font-weight:500;">
                                {{ $dashboard_url ?? '' }}
                            </a>
                        </p>
                    </td>
                </tr>

            </table>

            <table width="600" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="padding-top:40px; color:#546e7a; font-size:13px;">
                        © 2026 CareLens. All rights reserved.
                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>



@else
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff; padding:100px 0; font-family:'Manrope', Poppins, Arial, sans-serif;">
    <tr>
        <td align="center">

            <table width="600" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="font-size:48px; font-weight:900; padding-bottom:40px; color:#00796b;">
                        CareLens
                    </td>
                </tr>
            </table>

            <table width="600" cellpadding="0" cellspacing="0" 
                style="background-color:#ffffff; border-radius:16px; padding:40px 45px; border:1px solid #b2dfdb; box-shadow:0 2px 8px rgba(0,121,107,0.08);">

                <tr>
                    <td>
                        <h2 style="margin:0 0 10px 0; color:#263238; font-size:24px; font-weight:700;">Update on your CareLens Application</h2>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p style="color:#546e7a; margin:5px 0 35px 0; font-size:15px; line-height:1.6;">
                            Dear Dr. {{ $doctor->name ?? 'Applicant' }},<br><br>
                            Thank you for your interest in joining the CareLens network. Our credentialing committee has carefully reviewed your application and the submitted documentation. 
                            <br><br>
                            Regrettably, we are unable to approve your provider profile at this time because it did not fully meet our current verification or documentation requirements.
                        </p>
                    </td>
                </tr>

                <tr>
                    <td align="center">
                        <a href="{{ $verification_status ?? '' }}"
                           style="background-color:#00796b; color:white; padding:14px 32px; border-radius:8px; font-weight:700; text-decoration:none; display:inline-block; font-size:16px; transition:background-color 0.3s ease;">
                           View Application Status
                        </a>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p style="color:#546e7a; margin-top:35px; margin-bottom:0; font-size:14px; line-height:1.6;">
                            If you believe this was due to missing files or if you would like to update your credentials, you can log into your portal to view specific feedback or submit a new request.
                        </p>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p style="color:#e0871f; margin-top:12px; font-weight:600; font-size:14px;">
                            Need help? <strong>Our provider support team is available</strong> to guide you through the required credentials if you wish to reapply.
                        </p>
                    </td>
                </tr>

                <tr>
                    <td>
                        <div style="border:1px solid #b2dfdb; margin:30px 0;"></div>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p style="color:#546e7a; margin:0; font-size:13px; line-height:1.6;">
                            If you're having trouble clicking the button above, copy and paste this URL into your web browser:
                            <br><br>
                            <a href="{{ $support_url ?? '' }}" style="color:#00796b; word-break:break-all; text-decoration:none; font-weight:500;">
                                {{ $support_url ?? '' }}
                            </a>
                        </p>
                    </td>
                </tr>

            </table>

            <table width="600" cellpadding="0" cellspacing="0">
                <tr>
                    <td align="center" style="padding-top:40px; color:#546e7a; font-size:13px;">
                        © 2026 CareLens. All rights reserved.
                    </td>
                </tr>
            </table>

        </td>
    </tr>
</table>
@endif

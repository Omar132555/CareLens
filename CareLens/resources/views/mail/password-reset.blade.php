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
                        <h2 style="margin:0 0 10px 0; color:#263238; font-size:24px; font-weight:700;">Hello, {{ $user->name ?? 'Unknown' }}</h2>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p style="color:#546e7a; margin:5px 0 35px 0; font-size:15px; line-height:1.6;">
                            You are receiving this email because we received a password reset request for your account.
                        </p>
                    </td>
                </tr>

                <tr>
                    <td align="center">
                        <a href="{{ $url??'' }}"
                           style="background-color:#00796b; color:white; padding:14px 32px; border-radius:8px; font-weight:700; text-decoration:none; display:inline-block; font-size:16px; transition:background-color 0.3s ease;">
                            Reset Password
                        </a>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p style="color:#546e7a; margin-top:35px; margin-bottom:0; font-size:14px; line-height:1.6;">
                            This password reset link will expire in 60 minutes.
                        </p>
                    </td>
                </tr>

                <tr>
                    <td>
                        <p style="color:#e0871f; margin-top:12px; font-weight:600; font-size:14px;">
                            If you did not request a password reset, <strong>please do not take any action.</strong>
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
                            If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:
                            <br><br>
                            <a href="{{ $url??'' }}" style="color:#00796b; word-break:break-all; text-decoration:none; font-weight:500;">
                                {{ $url??'' }}
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
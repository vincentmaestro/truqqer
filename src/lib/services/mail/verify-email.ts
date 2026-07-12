'use server';

import { createTransport } from 'nodemailer';

const transporter = createTransport({
    host: process.env.SMTP_HOST!,
    secure: true,
    auth: {
        user: process.env.SMTP_AUTH!,
        pass: process.env.SMTP_PW!
    }
});

export async function sendEmailVerificationLink(recipient: string, token: string) {
    const message = {
        from: `Truqqer Co <${process.env.SMTP_AUTH!}>`,
        to: recipient,
        subject: 'Verify Your Email Address',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&display=swap" rel="stylesheet">
                <title>Verify Your Email</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                
                    a {
                        text-decoration: none;
                    }
                
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        width: 75%;
                        margin: 0 auto;
                    }

                    .img-container {
                        background-color: #f3f4f6;
                        margin: 2% 0;
                        padding: 1.5% 0;
                        border-radius: 8px;
                    }

                    .img-box {
                        width: 24%;
                        margin: 0 auto;
                    }

                    .img-box img {
                        display: block;
                        width: 100%;
                    }

                    .greetings {
                        margin: 2% 0 1%;
                    }

                    .greetings h3 {
                        display: flex;
                        column-gap: 6px;
                        align-items: center;
                        font-size: 1.3rem;
                        font-weight: 500;
                        color: #0f172a;
                    }

                    .content p {
                        font-size: 1.05rem;
                        margin-bottom: 1rem;
                        font-family: "poppins";
                        font-weight: 300;
                        line-height: 1.6;
                        color: #334155;
                    }

                    .content p:first-of-type {
                        font-size: 1.15rem;
                        color: #0f172a;
                        margin-bottom: 0.5rem;
                    }

                    .verify-section {
                        background-color: #f0fdf4;
                        border-left: 4px solid #16a34a;
                        padding: 1.5rem;
                        margin: 2rem 0;
                        border-radius: 4px;
                    }

                    .verify-section p {
                        font-size: 1rem;
                        color: #166534;
                        margin-bottom: 1rem;
                    }

                    .continue-button {
                        display: inline-block;
                        background-color: #f97316;
                        color: #fff;
                        font-size: 1rem;
                        border-radius: 6px;
                        padding: 12px 28px;
                        font-weight: 500;
                        transition: opacity 0.3s ease;
                    }

                    .continue-button:hover {
                        opacity: 0.9;
                    }

                    .security-notice {
                        background-color: #fef3f2;
                        border-left: 4px solid #ef4444;
                        padding: 1rem;
                        margin: 2rem 0 1rem 0;
                        border-radius: 4px;
                    }

                    .security-notice p {
                        font-size: 0.95rem;
                        color: #7f1d1d;
                        line-height: 1.5;
                    }

                    .contact {
                        color: #f97316;
                        font-weight: 500;
                    }

                    .contact:hover {
                        text-decoration: underline;
                    }

                    .main footer {
                        margin-top: 2rem;
                        padding-top: 1.5rem;
                        border-top: 1px solid #e2e8f0;
                    }

                    .main footer small {
                        font-size: 0.9rem;
                        color: #64748b;
                    }

                    .main footer p {
                        font-size: 1.1rem;
                        margin-top: 0.5rem;
                        color: #0f172a;
                        font-weight: 500;
                    }

                    .address {
                        margin-top: 1.5rem;
                        padding-top: 1rem;
                    }

                    .address small {
                        display: block;
                        font-size: 0.85rem;
                        font-family: "poppins";
                        font-style: italic;
                        font-weight: 300;
                        color: #94a3b8;
                    }

                    @media screen and (max-width: 1024px) {
                        .img-container {
                            margin-top: 5%;
                        }
                        .img-box {
                            width: 30%;
                        }
                    }

                    @media screen and (max-width: 768px) {
                        body {
                            width: 85%;
                        }
                        .img-container {
                            margin-top: 10%;
                        }
                        .img-box {
                            width: 36%;
                        }
                        .greetings {
                            margin-top: 4%;
                        }
                    }

                    @media screen and (max-width: 576px) {
                        .img-container {
                            margin-top: 12%;
                        }
                        .img-box {
                            width: 45%;
                        }
                        .greetings {
                            margin-top: 8%;
                        }
                    }

                    @media screen and (max-width: 425px) {
                        .img-container {
                            margin-top: 14%;
                        }
                        .img-box {
                            width: 50%;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="img-container">
                    <div class="img-box">
                        <img src="/truqqer-logo.png" alt="Truqqer logo">
                    </div>
                </div>
                <div class="main">
                    <div class="greetings">
                        <h3>Welcome to Truqqer <span><img src="https://fonts.gstatic.com/s/e/notoemoji/16.0/1f44b/32.png" alt="wave" style="width: 24px; height: 24px;"></span></h3>
                    </div>
                    
                    <div class="content">
                        <p>Glad to have you join us!</p>
                        
                        <p>To get started, we need to verify your email address. This helps us keep your account secure and ensures you receive important updates.</p>

                        <div class="verify-section">
                            <p><strong>Click the button below to verify your email and continue your registration:</strong></p>
                            <a class="continue-button" href="http://localhost:3000/signup?tab=phone&token=${token}">Verify Email Address</a>
                        </div>

                        <p>This link will expire in 1 hour, so please verify your email soon.</p>

                        <p>If you have any questions, we're here to help:</p>
                        <a class="contact" href="mailto:hello@truqqer.com">hello@truqqer.com</a>

                        <div class="security-notice">
                            <p><strong>⚠️ Security Notice:</strong> If this was not you, kindly ignore this email.</p>
                        </div>
                        
                        <br>
                        
                        <footer>
                            <small>Best regards,</small>
                            <p>The Truqqer Team</p>
                        </footer>
                    </div>

                    <div class="address">
                        <small>Pearl Cola, Pearl Gardens, Lekki</small>
                        <small>Lagos, Nigeria</small>
                    </div>
                </div>
            </body>
            </html>
        `
    }

    const info = await transporter.sendMail(message);
            
    if(!info.response.includes('250 OK'))
        throw new Error('Failed to send email. Please try again.');
}


export async function sendExistingUserSignupNotification(recipient: string) {
    const message = {
        from: `Truqqer Co <${process.env.SMTP_AUTH!}>`,
        to: recipient,
        subject: 'Did you mean to sign in?',
        html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&display=swap" rel="stylesheet">
                <title>Welcome Back to Truqqer</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                
                    a {
                        text-decoration: none;
                    }
                
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        width: 75%;
                        margin: 0 auto;
                    }

                    .img-container {
                        background-color: #c0c0c0;
                        margin: 2% 0;
                        padding: 1% 0;
                    }

                    .img-box {
                        width: 24%;
                        margin: 0 auto;
                    }

                    .img-box img {
                        display: block;
                        width: 100%;
                    }

                    .greetings {
                        margin-bottom: 2%;
                    }

                    .greetings h3 {
                        display: flex;
                        column-gap: 4px;
                        font-size: 1.3rem;
                        font-weight: lighter;
                    }

                    .content p {
                        font-size: 1.1rem;
                        margin-bottom: 2px;
                        font-family: "poppins";
                        font-weight: 300;
                        line-height: 1.6;
                    }

                    .content p:first-child {
                        font-size: 1.3rem;
                        margin-bottom: 1rem;
                    }

                    .button-group {
                        margin: 2rem 0;
                        display: flex;
                        gap: 1rem;
                        flex-wrap: wrap;
                    }

                    .proceed, .forgot-password {
                        display: inline-block;
                        border-radius: 6px;
                        padding: 12px 24px;
                        font-size: 1rem;
                        font-weight: 500;
                        transition: opacity 0.3s ease;
                    }

                    .proceed {
                        background-color: #f97316;
                        color: #fff;
                    }

                    .proceed:hover {
                        opacity: 0.9;
                    }

                    .forgot-password {
                        background-color: #e2e8f0;
                        color: #0f172a;
                        border: 1px solid #cbd5e1;
                    }

                    .forgot-password:hover {
                        opacity: 0.8;
                    }

                    .info-box {
                        background-color: #f0fdf4;
                        border-left: 4px solid #16a34a;
                        padding: 1rem;
                        margin: 1.5rem 0;
                        border-radius: 4px;
                    }

                    .info-box p {
                        font-size: 1rem;
                        color: #166534;
                    }

                    .security-notice {
                        background-color: #fef3f2;
                        border-left: 4px solid #ef4444;
                        padding: 1rem;
                        margin: 2rem 0 1rem 0;
                        border-radius: 4px;
                    }

                    .security-notice p {
                        font-size: 0.95rem;
                        color: #7f1d1d;
                        line-height: 1.5;
                    }

                    .contact {
                        color: #f97316;
                        font-size: 15px;
                    }

                    .contact:hover {
                        text-decoration: underline;
                    }

                    .main footer {
                        margin-top: 2rem;
                        padding-top: 1.5rem;
                        border-top: 1px solid #e2e8f0;
                    }

                    .main footer small {
                        font-size: 0.9rem;
                    }

                    .main footer p {
                        font-size: 1.1rem;
                        margin-top: 0.5rem;
                    }

                    .address {
                        margin-top: 2rem;
                        padding-top: 1rem;
                        border-top: 1px solid #e2e8f0;
                    }

                    .address small {
                        display: block;
                        font-size: 0.9rem;
                        font-family: "poppins";
                        font-style: italic;
                        font-weight: 300;
                        color: #64748b;
                    }

                    @media screen and (max-width: 1024px) {
                        .img-container {
                            margin-top: 5%;
                        }
                        .img-box {
                            width: 30%;
                        }
                    }

                    @media screen and (max-width: 768px) {
                        body {
                            width: 85%;
                        }
                        .img-container {
                            margin-top: 10%;
                        }
                        .img-box {
                            width: 36%;
                        }
                        .greetings {
                            margin-top: 4%;
                        }
                        .button-group {
                            flex-direction: column;
                        }
                        .proceed, .forgot-password {
                            width: 100%;
                            text-align: center;
                        }
                    }

                    @media screen and (max-width: 576px) {
                        .img-container {
                            margin-top: 12%;
                        }
                        .img-box {
                            width: 45%;
                        }
                        .greetings {
                            margin-top: 8%;
                        }
                    }

                    @media screen and (max-width: 425px) {
                        .img-container {
                            margin-top: 14%;
                        }
                        .img-box {
                            width: 50%;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="img-container">
                    <div class="img-box">
                        <img src="/truqqer-logo.png" alt="Truqqer logo">
                    </div>
                </div>
                <div class="main">
                    <div class="greetings">
                        <h3>Welcome back <span><img src="https://fonts.gstatic.com/s/e/notoemoji/16.0/1f44b/32.png" alt="wave"></span></h3>
                        <p>Did you mean to sign in?</p>
                    </div>
                    
                    <div class="content">
                        <p>A recent action saw you signing up for an account with this email.</p>
                        
                        <p>If this is you, simply sign in to your existing account. If you forgot your password, we can help you reset it.</p>

                        <div class="info-box">
                            <p><strong>💡 Tip:</strong> You can only have one account per email address. If you'd like to add a driver profile to your existing account, you can do so from your dashboard after signing in.</p>
                        </div>

                        <p>What would you like to do?</p>

                        <div class="button-group">
                            <a class="proceed" href="http://localhost:3000/login">Sign In to Your Account</a>
                            <a class="forgot-password" href="http://localhost:3000/forgot-password">Reset Your Password</a>
                        </div>

                        <p>If you have any questions or need assistance, feel free to reach out to us:</p>
                        <a class="contact" href="mailto:hello@truqqer.com">hello@truqqer.com</a>

                        <div class="security-notice">
                            <p><strong>⚠️ Security Notice:</strong> If you did not initiate this request, kindly ignore this email. Your account remains secure.</p>
                        </div>
                        
                        <br>
                        
                        <footer>
                            <small>Best regards,</small>
                            <p>The Truqqer Team</p>
                        </footer>
                    </div>

                    <div class="address">
                        <small>Pearl Cola, Pearl Gardens, Lekki</small>
                        <small>Lagos, Nigeria</small>
                    </div>
                </div>
            </body>
            </html>
        `
    }

    const info = await transporter.sendMail(message);
            
    if(!info.response.includes('250 OK'))
        throw new Error('Failed to send email. Please try again.');
}

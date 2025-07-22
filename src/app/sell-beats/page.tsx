// src/app/sell-beats/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How to Sell Beats While You Sleep - FLGang',
  description: 'The $10,000/Month Producer Blueprint - Complete system to build a beat selling business that generates sales 24/7',
};

export default function SellBeatsPage() {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>How to Sell Beats While You Sleep - FLGang</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #0a0a0a;
            color: #ffffff;
            line-height: 1.6;
            overflow-x: hidden;
        }

        /* Login Screen */
        .login-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            transition: opacity 0.5s ease;
        }

        .login-box {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
            animation: slideUp 0.5s ease;
        }

        @keyframes slideUp {
            from {
                transform: translateY(30px);
                opacity: 0;
            }
            to {
                transform: translateY(0);
                opacity: 1;
            }
        }

        .login-box h2 {
            color: #ff6b6b;
            margin-bottom: 20px;
            font-size: 28px;
        }

        .login-box input {
            width: 100%;
            padding: 15px;
            margin: 10px 0;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            color: white;
            font-size: 16px;
            transition: all 0.3s ease;
        }

        .login-box input:focus {
            outline: none;
            border-color: #ff6b6b;
            background: rgba(255, 255, 255, 0.15);
        }

        .login-box button {
            width: 100%;
            padding: 15px;
            margin-top: 20px;
            background: linear-gradient(135deg, #ff6b6b 0%, #ff5252 100%);
            border: none;
            border-radius: 10px;
            color: white;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.3s ease;
        }

        .login-box button:hover {
            transform: translateY(-2px);
        }

        .error-message {
            color: #ff4444;
            margin-top: 10px;
            display: none;
        }

        .value-props {
            margin-top: 30px;
            text-align: left;
            background: rgba(255, 107, 107, 0.1);
            padding: 20px;
            border-radius: 10px;
        }

        .value-props h3 {
            color: #ff6b6b;
            margin-bottom: 10px;
        }

        .value-props ul {
            list-style: none;
            font-size: 14px;
        }

        .value-props li {
            padding: 5px 0;
            padding-left: 20px;
            position: relative;
        }

        .value-props li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #ff6b6b;
        }

        /* Main Content */
        .main-content {
            display: none;
            opacity: 0;
            transition: opacity 0.5s ease;
        }

        /* Add all your other CSS styles here from the HTML file */
        /* ... Copy the rest of your CSS ... */
    </style>
</head>
<body>
    <!-- Copy your entire body content here -->
    
    <script>
        // Copy your JavaScript here
        function checkPassword() {
            const password = document.getElementById('passwordInput').value;
            const correctPassword = 'beatmaker2025';
            
            if (password === correctPassword) {
                document.getElementById('loginContainer').style.opacity = '0';
                setTimeout(() => {
                    document.getElementById('loginContainer').style.display = 'none';
                    document.getElementById('mainContent').style.display = 'block';
                    setTimeout(() => {
                        document.getElementById('mainContent').style.opacity = '1';
                    }, 100);
                }, 500);
            } else {
                document.getElementById('errorMessage').style.display = 'block';
                document.getElementById('passwordInput').value = '';
                document.getElementById('passwordInput').focus();
            }
        }
        // Add the rest of your JavaScript
    </script>
</body>
</html>
  `;

  return (
    <div 
      style={{ width: '100vw', height: '100vh' }}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}
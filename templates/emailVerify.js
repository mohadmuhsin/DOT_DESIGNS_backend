function verifyEmail( url) {
    return `<!DOCTYPE html>
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300&family=Outfit:wght@200;400;600&display=swap"
          rel="stylesheet"
        />
        <style>
          :root {
            --mw-1: 60%;
            --fs-1: 15px;
            --fs-h: 20px;
          }
          * {
            font-family: "Outfit", sans-serif;
            font-weight: 300;
            font-size: var(--fs-1);
          }
          body {
            margin: 0;
            padding: 0;
          }
          a {
            text-decoration: none;
            color: #1b85e7;
            cursor: pointer;
          }
          h1 {
            text-align: center;
            font-size: var(--fs-h);
          }
          .head-text {
            color: #1b85e7;
            font-weight: 700;
            font-size: var(--fs-h);
          }
          .center {
            display: block;
            margin: 0 auto;
          }
    
          .mt-20 {
            margin-top: 20px;
          }
    
          .mt-40 {
            margin-top: 40px;
          }
    
          .mt-80 {
            margin-top: 80px;
          }
    
          .letter {
            max-width: var(--mw-1);
          }
          .blue-btn {
            border: none;
            border-radius: 5px;
            padding: 10px 20px;
            background-color: #1b85e7;
            color: white;
            font-weight: 700;
            cursor: pointer;
            transition: all;
            transition-duration: 700ms;
          }
          .blue-btn:active {
            background-color: #3873ab;
          }
          .letter-note {
            max-width: var(--mw-1);
            font-size: 13px;
          }
        
        </style>
      </head>
      <body>
        <div class="main-logo mt-20">
          <!-- <div>
            <h1 class="center" style="color: #1b85e7; font-weight: 900">LOGO</h1>
          </div> -->
        </div>
    
        <div class="letter center mt-80">
                <p>
            Thank you for registering with us! We're excited to have you
            on board.
          </p>
          <p>
            To ensure the security of your account and provide you with the best
            experience, we need to verify your email address. Please click the
            "Verify Account" button below:
          </p>
        </div>
        <a href="${url}"><button class="blue-btn center mt-40">Verify Account</button></a>
        <div class="letter-note center mt-40">
          [Note: If the button doesn't work, you can also copy and paste the
          following link into your <br />
          browser:
          <a href="${url}">${url}</a>
        </div>
      </body>
    </html>`;
  }


  module.exports = {
    verifyEmail
  }

import { Pool } from 'pg';
import nodemailer from 'nodemailer';
import fs from 'fs';
import csv from 'csv-parser';

// Initialize the connection pool.
// The connection string is read from the POSTGRES_URL environment variable.
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
  ssl: {
    rejectUnauthorized: false, // Necessary for most cloud-hosted PostgreSQL services
  },
});

interface Guest {
  email: string;
}

async function sendGiftRegistryEmail(guest: Guest) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Robin & Kyle's Wedding" <${process.env.GMAIL_USER}>`,
      to: guest.email,
      subject: 'A Note on Gifts for Robin & Kyle\'s Wedding',
      html: `
        <div style="font-family: 'Georgia', serif; line-height: 1.8; color: #444; background-color: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
            
            <h2 style="color: #c0392b; font-size: 24px; text-align: center;">A Note on Gifts</h2>
            
            <p style="font-size: 16px; text-align: center;">Dear Guests,</p>
            
            <p style="font-size: 16px; text-align: center;">Please do not feel obliged to gift us. The greatest gift you can give us is your presence on our special day. We are so excited to celebrate with all of you!</p>
            
            <p style="font-size: 16px; text-align: center;">For those who have asked for gift ideas, we have a couple of options below.</p>

            <div style="margin-top: 30px; margin-bottom: 30px;">
                <h3 style="color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 5px; margin-bottom: 20px;">Gift Registries</h3>
                <p style="text-align: center;">We have created gift registries with a few items to help us start our new life together:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="https://www.mrphome.com/en_za/giftregistry/view/index/id/RHWEDD8254" style="display: inline-block; padding: 12px 25px; background-color: #c0392b; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 5px;">Mr Price Home</a>
                    <a href="https://www.yuppiechef.com/registry.htm?action=view&uuid=c062bec3-b351-48b2-a249-5cd38fb583e6" style="display: inline-block; padding: 12px 25px; background-color: #c0392b; color: #ffffff; text-decoration: none; border-radius: 5px; margin: 5px;">Yuppiechef</a>
                </div>
            </div>

            <div style="margin-top: 30px; margin-bottom: 30px;">
                <h3 style="color: #c0392b; border-bottom: 2px solid #c0392b; padding-bottom: 5px; margin-bottom: 20px;">Monetary Gifts</h3>
                <p style="text-align: center;">For those who would prefer to give a monetary gift, you can use the bank details below:</p>
                <div style="background-color: #f2f2f2; padding: 15px; border-radius: 5px; margin: 20px auto; max-width: 300px; text-align: left;">
                    <p style="margin: 5px 0;"><strong>Bank:</strong> Standard Bank</p>
                    <p style="margin: 5px 0;"><strong>Account Holder:</strong> Mr Kyle Titus</p>
                    <p style="margin: 5px 0;"><strong>Account Number:</strong> 253273196</p>
                    <p style="margin: 5px 0;"><strong>Branch Code:</strong> 051001</p>
                    <p style="margin: 5px 0;"><strong>Reference:</strong> Your Name</p>
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p>We can't wait to see you on <strong>February 7, 2026</strong>.</p>
                <p>For more wedding details, please visit our website:</p>
                <p><a href="https://www.robinandkyle.com" style="color: #c0392b; text-decoration: none; font-weight: bold;">www.robinandkyle.com</a></p>
                <p style="margin-top: 30px;">With love,</p>
                <p style="font-family: 'Garamond', 'Times New Roman', serif; font-size: 28px; color: #c0392b; margin: 0;">Robin & Kyle</p>
            </div>
          </div>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${guest.email}`);
  } catch (emailError) {
    console.error(`Failed to send email to ${guest.email}: `, emailError);
  }
}

async function main() {
  const guests: Guest[] = [];
  fs.createReadStream('guests.csv')
    .pipe(csv())
    .on('data', (data) => guests.push(data))
    .on('end', async () => {
      for (const guest of guests) {
        await sendGiftRegistryEmail(guest);
      }
      console.log('Finished sending emails.');
    });
}

main();

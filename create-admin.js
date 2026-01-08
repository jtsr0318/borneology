// Script to create admin account
// Run with: node create-admin.js

const readline = require('readline');
const http = require('http');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function createAdmin(email, password, name) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, password, name });
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/create-admin',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

console.log('=== Create Admin Account for Borneology ===\n');
console.log('⚠️  Make sure the server is running on http://localhost:3000\n');

rl.question('Admin Email: ', (email) => {
  rl.question('Admin Password: ', (password) => {
    rl.question('Admin Name: ', async (name) => {
      try {
        const result = await createAdmin(email, password, name);

        if (result.success) {
          console.log('\n✅ Admin account created successfully!');
          console.log(`User ID: ${result.userId}`);
          console.log(`\nYou can now login with:`);
          console.log(`Email: ${email}`);
          console.log(`Password: ${password}`);
          console.log(`\n📝 Note: Please save these credentials securely!`);
        } else {
          console.log('\n❌ Error:', result.error);
        }
      } catch (error) {
        console.log('\n❌ Failed to create admin account:', error.message);
        console.log('Make sure the server is running on http://localhost:3000');
        console.log('Run: npm start or npm run dev');
      }
      
      rl.close();
    });
  });
});


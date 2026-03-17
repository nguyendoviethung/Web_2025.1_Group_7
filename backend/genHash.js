import bcrypt from 'bcryptjs';

const hash = await bcrypt.hash('Admin@123', 10);
console.log('Hash:', hash);


const check = await bcrypt.compare('Admin@123', hash);
console.log('Verify:', check); // phải là true
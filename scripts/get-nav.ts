import connectDB from '../src/lib/db';
import User from '../src/models/User';

async function main() {
  await connectDB();
  const user = await User.findOne({ email: 'grigobio237@gmail.com' });
  console.log('isNavigator:', user.isNavigator);
  console.log('user:', user);
  process.exit(0);
}
main();

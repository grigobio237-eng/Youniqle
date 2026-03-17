const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

async function fixCoach() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const User = mongoose.connection.collection('users'); // Use raw collection to avoid schema issues
    
    // Find by email string if possible, or by looking for that specific object pattern
    const coach = await User.findOne({ 
      $or: [
        { email: 'coach-test@youniqle.com' },
        { 'email.order': true } // The corrupted pattern
      ]
    });

    if (coach) {
      console.log('Found coach with ID:', coach._id);
      
      const update = {
        $set: {
          email: 'coach-test@youniqle.com',
          partnerStatus: 'approved',
          'partnerType': 'coach',
          'partnerApplication.partnerType': 'coach',
          coachProfile: {
            title: 'Senior Recovery Curator',
            specialty: 'Neuromuscular Reset & Sleep Optimization',
            philosophy: '내면의 평화가 신체 회복의 시작임을 증명합니다.',
            description: '10년 이상의 경력을 가진 회복 전문가입니다.',
            certifications: ['Certified Recovery Specialist', 'Master of Sleep Science'],
            programs: [
              {
                title: 'Deep Tissue Recovery',
                duration: '90 min',
                intensity: 'Medium',
                price: '150,000₩',
                tags: ['Recovery', 'Deep Tissue']
              }
            ],
            rating: 5.0,
            reviews: 1,
            profileImage: '/images/trainers/master-1.png'
          }
        }
      };

      const result = await User.updateOne({ _id: coach._id }, update);
      console.log('Update result:', result);
    } else {
      console.log('Coach not found to fix.');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

fixCoach();

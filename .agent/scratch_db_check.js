const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://grigobio237_db_user:Youniqle2024!@cluster0.e78xeiw.mongodb.net/youniqle?retryWrites=true&w=majority&appName=Cluster0";
const email = "grigobio237@gmail.com";

async function main() {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        console.log("Connected to MongoDB successfully!");
        const db = client.db('youniqle');
        
        // Find user
        const user = await db.collection('users').findOne({ email: email });
        if (!user) {
            console.log(`User not found with email: ${email}`);
            return;
        }
        
        console.log("\n--- User Document Found ---");
        console.log("ID:", user._id);
        console.log("Name:", user.name);
        console.log("Email:", user.email);
        console.log("Grade:", user.grade);
        console.log("Role:", user.role);
        console.log("Diagnosis Results length:", user.diagnosisResults?.length || 0);
        console.log("Scan Timeline length:", user.scanTimeline?.length || 0);
        console.log("Issued Certificates length:", user.issuedCertificates?.length || 0);
        
        // Count Recovery Scores
        const recoveryScoresCount = await db.collection('recoveryscores').countDocuments({ userId: user._id });
        console.log("Recovery Scores count:", recoveryScoresCount);
        
        // Count PreConsultations
        const preConsultationsCount = await db.collection('preconsultations').countDocuments({ userId: user._id });
        console.log("PreConsultations count:", preConsultationsCount);
        
        // Count PostCareSurveys
        const postCareSurveysCount = await db.collection('postcaresurveys').countDocuments({ userId: user._id });
        console.log("PostCareSurveys count:", postCareSurveysCount);
        
        // Count SurveyResponses
        const surveyResponsesCount = await db.collection('surveyresponses').countDocuments({ userId: user._id });
        console.log("SurveyResponses count:", surveyResponsesCount);
        
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

main();

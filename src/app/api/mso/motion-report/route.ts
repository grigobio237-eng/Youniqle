import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Log the clinical telemetry package to the server console for diagnostics
    console.log("=== [YOUNIQLE MSO API] CLINICAL MOTION REPORT EMR REGISTERED ===");
    console.log("User ID:", body.userId);
    console.log("Device Info:", body.deviceInfo);
    console.log("Overall Score:", body.aiDiagnosis?.totalScore);
    console.log("Diagnostics Payload Payload:\n", JSON.stringify(body, null, 2));
    
    return NextResponse.json({
      success: true,
      registeredAt: new Date().toISOString(),
      reportId: `mso_rep_${Math.random().toString(36).substring(2, 11)}`,
      status: "SYNCED_TO_EMR_HEALTH_TIMELINE"
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to process EMR clinical report"
    }, { status: 400 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { ModelEnrichmentService } from '@/services/enrichment/ModelEnrichmentService';

export const dynamic = 'force-dynamic';

const enrichmentService = new ModelEnrichmentService();

// POST enrich all published models
export async function POST(request: NextRequest) {
  try {
    const stats = await enrichmentService.enrichAllPublishedModels();

    return NextResponse.json({
      success: true,
      total: stats.total,
      successful: stats.successful,
      failed: stats.failed
    });
  } catch (error) {
    console.error('Error enriching all models:', error);
    return NextResponse.json(
      { 
        error: 'Failed to enrich models', 
        details: (error as Error).message 
      },
      { status: 500 }
    );
  }
}


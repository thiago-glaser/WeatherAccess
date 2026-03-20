import { NextResponse } from 'next/server';
import { Station } from '@/lib/models/station';

export async function GET() {
  try {
    const latest = await Station.findOne({
      order: [['localtimestamp', 'DESC']],
    });
    
    if (!latest) {
      return NextResponse.json({ success: false, error: 'No data found' });
    }

    const plain = latest.get({ plain: true });
    
    return NextResponse.json({
      success: true,
      data: {
        externaltemperature: plain.externaltemperature,
        internaltemperature: plain.internaltemperature,
        localtimestamp: plain.localtimestamp,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

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
    
    const localTs = plain.localtimestamp instanceof Date 
      ? plain.localtimestamp.toLocaleTimeString('en-GB') // 24h format HH:MM:SS
      : plain.localtimestamp;

    return NextResponse.json({
      success: true,
      data: {
        externaltemperature: plain.externaltemperature,
        internaltemperature: plain.internaltemperature,
        localtimestamp: localTs,
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

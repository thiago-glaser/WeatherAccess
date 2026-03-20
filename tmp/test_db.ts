import 'dotenv/config';
import { Station } from '../src/lib/models/station';

async function test() {
  try {
    const latest = await Station.findOne({
      order: [['localtimestamp', 'DESC']],
    });
    console.log('Latest record:', JSON.stringify(latest, null, 2));
  } catch (error: any) {
    console.error('Error fetching latest:', error.message);
  } finally {
    process.exit();
  }
}

test();

import type { CheckpointWriter } from '@snapshot-labs/checkpoint';
import {
  convertToDecimal,
  getEvent,
  loadPair,
  Pair,
  updatePair,
  synced,
  createPair
} from './utils/utils';

export async function handleSwap({ block, tx, rawEvent, mysql }: Parameters<CheckpointWriter>[0]) {
  if (!rawEvent) {
    return;
  }

  const format = 'sender,amount0In,amount1In,amount0Out,amount1Out,to';
  const data: any = getEvent(rawEvent.data, format);

  // Load or create the pair
  const pairId = process.env.PAIR!;

  let pair: Pair | null = await loadPair(pairId, mysql);
  if (!pair) {
    pair = {
      id: pairId,
      buyAmount: 0,
      timestamp: block!.timestamp,
      tx: tx.transaction_hash!
    };
    await createPair(pair, mysql);
  }
  pair.buyAmount = data.amount0In / 10**18;
  // Take profit or stop loss
  if (pair.buyAmount >= 0.1) {
    console.log('Alert! New buy of: ' + pair.buyAmount +'ETH !');
    // Insert your swap method here
  }

  // Update the pair and save it in the database
  pair.timestamp = block!.timestamp;
  pair.tx = tx.transaction_hash!;
  await updatePair(pair, mysql);
}

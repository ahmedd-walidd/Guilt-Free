import { supabase } from '../lib/supabase';
import type { AffordDecisionResult, PurchaseCheck } from '../types/money';
import { toNumber } from '../utils/money';

export async function savePurchaseCheck(input: {
  userId: string;
  itemName: string;
  price: number;
  reason?: string | null;
  result: AffordDecisionResult;
}) {
  const { data, error } = await supabase
    .from('purchase_checks')
    .insert({
      user_id: input.userId,
      item_name: input.itemName,
      price: input.price,
      reason: input.reason ?? null,
      decision: input.result.decision,
      decision_message: input.result.message,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Failed to save purchase check', error);
    throw error;
  }

  return {
    ...data,
    price: toNumber(data.price),
    decision: data.decision as PurchaseCheck['decision'],
  } satisfies PurchaseCheck;
}

export const affordService = {
  savePurchaseCheck,
};

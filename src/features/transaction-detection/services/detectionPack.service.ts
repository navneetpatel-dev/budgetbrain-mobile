import { compilePack, type CompiledPack, type KnowledgePack } from '@budgetbrain/detection-core';

/**
 * The knowledge pack the pipeline runs on. Until the pack manager downloads signed country packs
 * (plan T4.4), the app bundles core's India baseline pack. It is compiled once per process
 * (plan T3.14), on first use, so an app start that detects nothing never pays for it.
 */
let compiled: CompiledPack | null = null;
let raw: KnowledgePack | null = null;

function baselinePack(): KnowledgePack {
  raw ??= require('@budgetbrain/detection-core/packs/baseline/IN.json') as KnowledgePack;
  return raw;
}

export function getCompiledPack(): CompiledPack {
  compiled ??= compilePack(baselinePack());
  return compiled;
}

/**
 * What the native pre-filter keeps (plan T2.2): the SMS headers of every institution in the pack.
 * Unknown senders are ignored by the pipeline anyway, so nothing else needs to reach JS.
 */
export function nativeSenderFilter(): { headers: string[]; keywords: string[] } {
  const headers = baselinePack()
    .senders.filter((sender) => sender.channel === 'sms' && sender.match === 'header')
    .map((sender) => sender.key.toUpperCase());
  return { headers: [...new Set(headers)], keywords: [] };
}

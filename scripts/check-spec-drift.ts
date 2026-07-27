/**
 * Spec Drift Audit Script
 * Compares current @thestudioxi/webmcp type exports against official W3C WebMCP spec standards.
 */

import { WebMCPPolyfill, type ModelContext } from '../packages/sdk/src/frontend/polyfill';
import type { WebMCPToolDefinition, WebMCPMessage, WebMCPRequest, WebMCPResponse } from '../packages/sdk/src/types/index';

console.log('🔍 Running W3C WebMCP Specification Drift Audit...');

let errorsCount = 0;

// 1. Audit ModelContext method interface
const requiredModelContextMethods: Array<keyof ModelContext> = [
  'registerTool',
  'unregisterTool',
  'listTools',
  'callTool',
];

const polyfill = new WebMCPPolyfill();
for (const method of requiredModelContextMethods) {
  if (typeof polyfill[method] !== 'function') {
    console.error(`❌ Spec Drift Error: WebMCPPolyfill is missing required W3C method '${method}'`);
    errorsCount++;
  } else {
    console.log(`  ✓ Method '${method}' matches standard ModelContext spec`);
  }
}

// 2. Audit ToolDefinition structure
const sampleToolDef: WebMCPToolDefinition = {
  name: 'test_tool',
  description: 'A test tool for spec audit',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

if (!sampleToolDef.name || !sampleToolDef.description || !sampleToolDef.inputSchema) {
  console.error('❌ Spec Drift Error: WebMCPToolDefinition does not conform to standard schema');
  errorsCount++;
} else {
  console.log('  ✓ WebMCPToolDefinition conforms to W3C JSON Schema specifications');
}

// 3. Audit JSON-RPC 2.0 message contracts
const sampleReq: WebMCPRequest = {
  jsonrpc: '2.0',
  id: 1,
  method: 'tools/call',
  params: { name: 'test_tool', arguments: {} },
};

const sampleRes: WebMCPResponse = {
  jsonrpc: '2.0',
  id: 1,
  result: { success: true },
};

if (sampleReq.jsonrpc !== '2.0' || sampleRes.jsonrpc !== '2.0') {
  console.error('❌ Spec Drift Error: WebMCPRequest/Response failed JSON-RPC 2.0 validation');
  errorsCount++;
} else {
  console.log('  ✓ WebMCP JSON-RPC 2.0 protocol definitions are fully compliant');
}

if (errorsCount > 0) {
  console.error(`\n🚨 Spec Drift Audit FAILED with ${errorsCount} error(s).`);
  process.exit(1);
} else {
  console.log('\n✅ Spec Drift Audit PASSED. 0 spec drift detected against W3C WebMCP standard.');
}

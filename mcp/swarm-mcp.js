#!/usr/bin/env node
/**
 * Swarm MCP Server
 * Standard Model Context Protocol server over stdio for OpenSpec 12-Agent Swarm.
 * Allows agents to talk to each other, publish events, and query pipeline state.
 */

const readline = require('readline');
const {
  sendMessage,
  readMessages,
  publishEvent,
  readEvents,
  getStatus,
  advanceStep,
  setAgentStatus,
  PHASE_STEPS
} = require('../scripts/swarm-bus');

const TOOLS = [
  {
    name: 'swarm_send_message',
    description: 'Send a message to another agent or broadcast to all agents in the swarm.',
    inputSchema: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Agent ID or role sending the message (e.g. 01-coordinator, 05-plan-auditor)' },
        to: { type: 'string', description: 'Recipient agent ID or "all" for broadcast', default: 'all' },
        topic: { type: 'string', description: 'Subject or category (e.g. plan-review, test-failure, design-tokens)' },
        message: { type: 'string', description: 'Detailed message body' },
        payload: { type: 'object', description: 'Optional structured JSON data' }
      },
      required: ['from', 'message']
    }
  },
  {
    name: 'swarm_read_messages',
    description: 'Read past messages from the swarm communication log.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: { type: 'string', description: 'Filter by topic' },
        from: { type: 'string', description: 'Filter by sender' },
        to: { type: 'string', description: 'Filter by recipient' },
        limit: { type: 'number', description: 'Maximum messages to fetch (default: 20)', default: 20 }
      }
    }
  },
  {
    name: 'swarm_publish_event',
    description: 'Publish a lifecycle event (e.g. PLAN_LOCKED, DESIGN_AUDITED, TEST_GATE_FAILED).',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', description: 'Event type identifier' },
        sender: { type: 'string', description: 'Agent publishing the event' },
        summary: { type: 'string', description: 'High-level description of what happened' },
        data: { type: 'object', description: 'Optional event data payload' }
      },
      required: ['type', 'summary']
    }
  },
  {
    name: 'swarm_get_pipeline_status',
    description: 'Get current OpenSpec phase, active step (1-14), lock gates, and status of all 12 agents.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'swarm_advance_step',
    description: 'Advance the OpenSpec execution pipeline to the next step (1 to 14).',
    inputSchema: {
      type: 'object',
      properties: {
        step: { type: 'number', description: 'Step number (1 to 14)' },
        summary: { type: 'string', description: 'Summary of transition' }
      },
      required: ['step']
    }
  },
  {
    name: 'swarm_set_agent_status',
    description: 'Update the activity state of a specific agent (idle, active, blocked, done).',
    inputSchema: {
      type: 'object',
      properties: {
        agent_id: { type: 'string', description: 'Agent identifier' },
        status: { type: 'string', enum: ['idle', 'active', 'blocked', 'done'], description: 'New status' }
      },
      required: ['agent_id', 'status']
    }
  }
];

function handleCallTool(name, args) {
  try {
    switch (name) {
      case 'swarm_send_message': {
        const res = sendMessage(args);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
      case 'swarm_read_messages': {
        const res = readMessages(args);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
      case 'swarm_publish_event': {
        const res = publishEvent(args);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
      case 'swarm_get_pipeline_status': {
        const res = getStatus();
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
      case 'swarm_advance_step': {
        const res = advanceStep(args.step, args.summary || '');
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
      case 'swarm_set_agent_status': {
        const res = setAgentStatus(args.agent_id, args.status);
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
      }
      default:
        return { isError: true, content: [{ type: 'text', text: `Unknown tool: ${name}` }] };
    }
  } catch (err) {
    return { isError: true, content: [{ type: 'text', text: `Tool error: ${err.message}` }] };
  }
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', line => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    const { id, method, params } = req;

    if (method === 'initialize') {
      const resp = {
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: { tools: {} },
          serverInfo: { name: 'swarm-mcp', version: '1.0.0' }
        }
      };
      process.stdout.write(JSON.stringify(resp) + '\n');
    } else if (method === 'notifications/initialized') {
      // No response needed
    } else if (method === 'tools/list') {
      const resp = {
        jsonrpc: '2.0',
        id,
        result: { tools: TOOLS }
      };
      process.stdout.write(JSON.stringify(resp) + '\n');
    } else if (method === 'tools/call') {
      const toolResult = handleCallTool(params.name, params.arguments || {});
      const resp = {
        jsonrpc: '2.0',
        id,
        result: toolResult
      };
      process.stdout.write(JSON.stringify(resp) + '\n');
    } else if (method === 'ping') {
      process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id, result: {} }) + '\n');
    } else {
      if (id !== undefined) {
        process.stdout.write(JSON.stringify({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: 'Method not found' }
        }) + '\n');
      }
    }
  } catch (err) {
    // Ignore malformed JSON
  }
});

const { Client } = require("@modelcontextprotocol/sdk/client/index.js");
const { SSEClientTransport } = require("@modelcontextprotocol/sdk/client/sse.js");

const MCP_URL = "http://localhost:6274/sse";
const AUTH_TOKEN = "7bec677ef33015e4defd7fd5c9e4992ab5a7c32a57c8327151c17132807bfc52";

async function connectToMcp() {
  console.log(`Connecting to MCP server at ${MCP_URL}...`);

  const client = new Client(
    { name: "mcp-client", version: "1.0.0" },
    { capabilities: {} }
  );

  const transport = new SSEClientTransport(new URL(MCP_URL), {
    requestInit: {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    },
  });

  await client.connect(transport);
  console.log("Connected to MCP server!");

  // List available tools
  console.log("\n--- Listing Tools ---");
  try {
    const tools = await client.listTools();
    console.log("Available tools:", JSON.stringify(tools, null, 2));
  } catch (e) {
    console.log("listTools not available or error:", e.message);
  }

  // List available resources
  console.log("\n--- Listing Resources ---");
  try {
    const resources = await client.listResources();
    console.log("Available resources:", JSON.stringify(resources, null, 2));
  } catch (e) {
    console.log("listResources not available or error:", e.message);
  }

  // List available prompts
  console.log("\n--- Listing Prompts ---");
  try {
    const prompts = await client.listPrompts();
    console.log("Available prompts:", JSON.stringify(prompts, null, 2));
  } catch (e) {
    console.log("listPrompts not available or error:", e.message);
  }

  // Keep connection alive for a bit
  await new Promise(resolve => setTimeout(resolve, 5000));

  await client.close();
  console.log("\nDisconnected from MCP server.");
}

connectToMcp().catch(err => {
  console.error("Connection failed:", err.message);
  process.exit(1);
});
